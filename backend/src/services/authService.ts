import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { mongoDBService } from '../config/mongodb';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { Strategy as SamlStrategy } from 'passport-saml';
import { config } from '../config/config';

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  organizationId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  organizationId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SSOConfig {
  provider: 'google' | 'github' | 'saml';
  clientId: string;
  clientSecret: string;
  callbackUrl: string;
  samlEntryPoint?: string;
  samlIssuer?: string;
  samlCert?: string;
}

export class AuthService {
  private prisma: PrismaClient;
  private jwtSecret: string;
  private jwtRefreshSecret: string;
  private jwtExpiresIn: string;
  private refreshTokenExpiresIn: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key';
    this.jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '15m';
    this.refreshTokenExpiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';
    
    this.initializePassport();
  }

  private initializePassport(): void {
    // JWT Strategy
    passport.use(new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: this.jwtSecret,
    }, async (payload, done) => {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: payload.userId },
          include: { organizations: true }
        });

        if (user && user.isActive) {
          return done(null, user);
        }
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }));

    // Google OAuth Strategy
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await this.findOrCreateOAuthUser({
          email: profile.emails?.[0]?.value || '',
          firstName: profile.name?.givenName,
          lastName: profile.name?.familyName,
          provider: 'google',
          providerId: profile.id
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));

    // GitHub OAuth Strategy
    passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      callbackURL: process.env.GITHUB_CALLBACK_URL || '/auth/github/callback'
    }, async (accessToken, refreshToken, profile, done) => {
      try {
        const user = await this.findOrCreateOAuthUser({
          email: profile.emails?.[0]?.value || '',
          firstName: profile.displayName?.split(' ')[0],
          lastName: profile.displayName?.split(' ').slice(1).join(' '),
          provider: 'github',
          providerId: profile.id
        });
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }));

    // SAML Strategy
    if (process.env.SAML_ENTRY_POINT) {
      passport.use(new SamlStrategy({
        entryPoint: process.env.SAML_ENTRY_POINT,
        issuer: process.env.SAML_ISSUER || 'devsync',
        cert: process.env.SAML_CERT,
        callbackUrl: process.env.SAML_CALLBACK_URL || '/auth/saml/callback'
      }, async (profile, done) => {
        try {
          const user = await this.findOrCreateOAuthUser({
            email: profile.email || profile.nameID,
            firstName: profile.firstName,
            lastName: profile.lastName,
            provider: 'saml',
            providerId: profile.nameID
          });
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }));
    }
  }

  async register(data: RegisterData): Promise<{ user: AuthUser; tokens: TokenPair }> {
    try {
      // Check if user already exists
      const existingUser = await this.prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new Error('User already exists with this email');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(data.password, 12);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'USER'
        }
      });

      // Add to organization if specified
      if (data.organizationId) {
        await this.prisma.organizationMember.create({
          data: {
            organizationId: data.organizationId,
            userId: user.id,
            role: 'MEMBER'
          }
        });
      }

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log registration
      await this.logAuthActivity('register', user.id, {
        email: data.email,
        organizationId: data.organizationId
      });

      logger.info('User registered successfully', { userId: user.id, email: user.email });

      return {
        user: this.sanitizeUser(user),
        tokens
      };

    } catch (error) {
      logger.error('Registration failed', { error: error.message, email: data.email });
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: TokenPair }> {
    try {
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { email: credentials.email },
        include: { organizations: true }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid credentials');
      }

      // Check password
      if (!user.password) {
        throw new Error('Password not set. Please use SSO login.');
      }

      const isValidPassword = await bcrypt.compare(credentials.password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await this.prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() }
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      // Log login
      await this.logAuthActivity('login', user.id, {
        email: credentials.email,
        method: 'password'
      });

      logger.info('User logged in successfully', { userId: user.id, email: user.email });

      return {
        user: this.sanitizeUser(user),
        tokens
      };

    } catch (error) {
      logger.error('Login failed', { error: error.message, email: credentials.email });
      throw error;
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      
      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user || !user.isActive) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = await this.generateTokens(user);

      // Log token refresh
      await this.logAuthActivity('token_refresh', user.id, {
        email: user.email
      });

      return tokens;

    } catch (error) {
      logger.error('Token refresh failed', { error: error.message });
      throw new Error('Invalid refresh token');
    }
  }

  async logout(userId: string, token: string): Promise<void> {
    try {
      // Add token to blacklist (implement with Redis)
      // For now, we'll just log the logout
      await this.logAuthActivity('logout', userId, {
        token: token.substring(0, 20) + '...'
      });

      logger.info('User logged out', { userId });

    } catch (error) {
      logger.error('Logout failed', { error: error.message, userId });
      throw error;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user || !user.password) {
        throw new Error('User not found or password not set');
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });

      // Log password change
      await this.logAuthActivity('password_change', userId, {
        email: user.email
      });

      logger.info('Password changed successfully', { userId });

    } catch (error) {
      logger.error('Password change failed', { error: error.message, userId });
      throw error;
    }
  }

  async resetPassword(email: string): Promise<void> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        // Don't reveal if user exists
        return;
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id, type: 'password_reset' },
        this.jwtSecret,
        { expiresIn: '1h' }
      );

      // TODO: Send email with reset link
      // await this.sendPasswordResetEmail(user.email, resetToken);

      // Log password reset request
      await this.logAuthActivity('password_reset_request', user.id, {
        email: user.email
      });

      logger.info('Password reset requested', { userId: user.id, email });

    } catch (error) {
      logger.error('Password reset failed', { error: error.message, email });
      throw error;
    }
  }

  async confirmPasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      // Verify reset token
      const payload = jwt.verify(token, this.jwtSecret) as any;
      
      if (payload.type !== 'password_reset') {
        throw new Error('Invalid reset token');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.prisma.user.update({
        where: { id: payload.userId },
        data: { password: hashedPassword }
      });

      // Log password reset
      await this.logAuthActivity('password_reset_complete', payload.userId, {
        email: (await this.prisma.user.findUnique({ where: { id: payload.userId } }))?.email
      });

      logger.info('Password reset completed', { userId: payload.userId });

    } catch (error) {
      logger.error('Password reset confirmation failed', { error: error.message });
      throw error;
    }
  }

  async updateUserRole(userId: string, newRole: 'ADMIN' | 'USER' | 'VIEWER'): Promise<void> {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
      });

      // Log role change
      await this.logAuthActivity('role_change', userId, {
        newRole,
        email: (await this.prisma.user.findUnique({ where: { id: userId } }))?.email
      });

      logger.info('User role updated', { userId, newRole });

    } catch (error) {
      logger.error('Role update failed', { error: error.message, userId });
      throw error;
    }
  }

  async createApiKey(userId: string, name: string, permissions: string[]): Promise<{ key: string }> {
    try {
      // Generate API key
      const key = this.generateApiKey();

      // Hash the key for storage
      const hashedKey = await bcrypt.hash(key, 12);

      // Store in database
      await this.prisma.apiKey.create({
        data: {
          userId,
          name,
          key: hashedKey,
          permissions: permissions,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
        }
      });

      // Log API key creation
      await this.logAuthActivity('api_key_created', userId, {
        keyName: name,
        permissions
      });

      logger.info('API key created', { userId, keyName: name });

      return { key };

    } catch (error) {
      logger.error('API key creation failed', { error: error.message, userId });
      throw error;
    }
  }

  async revokeApiKey(userId: string, keyId: string): Promise<void> {
    try {
      await this.prisma.apiKey.update({
        where: { id: keyId, userId },
        data: { isActive: false }
      });

      // Log API key revocation
      await this.logAuthActivity('api_key_revoked', userId, {
        keyId
      });

      logger.info('API key revoked', { userId, keyId });

    } catch (error) {
      logger.error('API key revocation failed', { error: error.message, userId });
      throw error;
    }
  }

  async validateApiKey(apiKey: string): Promise<AuthUser | null> {
    try {
      const keys = await this.prisma.apiKey.findMany({
        where: { isActive: true },
        include: { user: true }
      });

      for (const key of keys) {
        const isValid = await bcrypt.compare(apiKey, key.key);
        if (isValid && key.user.isActive) {
          // Update last used
          await this.prisma.apiKey.update({
            where: { id: key.id },
            data: { lastUsed: new Date() }
          });

          return this.sanitizeUser(key.user);
        }
      }

      return null;

    } catch (error) {
      logger.error('API key validation failed', { error: error.message });
      return null;
    }
  }

  private async findOrCreateOAuthUser(data: {
    email: string;
    firstName?: string;
    lastName?: string;
    provider: string;
    providerId: string;
  }): Promise<any> {
    let user = await this.prisma.user.findUnique({
      where: { email: data.email }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'USER',
          emailVerified: true
        }
      });
    }

    return user;
  }

  private async generateTokens(user: any): Promise<TokenPair> {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn
    });

    const refreshToken = jwt.sign(payload, this.jwtRefreshSecret, {
      expiresIn: this.refreshTokenExpiresIn
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60 // 15 minutes in seconds
    };
  }

  private sanitizeUser(user: any): AuthUser {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizations?.[0]?.organizationId
    };
  }

  private generateApiKey(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'ds_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async logAuthActivity(action: string, userId: string, metadata: any): Promise<void> {
    try {
      await mongoDBService.logSystemActivity({
        level: 'info',
        message: `Auth activity: ${action}`,
        metadata: {
          action,
          userId,
          ...metadata
        },
        userId
      });
    } catch (error) {
      logger.error('Failed to log auth activity', { error: error.message });
    }
  }
}
