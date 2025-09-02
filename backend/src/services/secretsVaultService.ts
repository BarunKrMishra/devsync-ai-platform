import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { logger } from '../config/logger';
import { mongoDBService } from '../config/mongodb';

export interface SecretData {
  id?: string;
  name: string;
  value: string;
  description?: string;
  tags?: string[];
  projectId?: string;
  userId: string;
  expiresAt?: Date;
  isActive?: boolean;
}

export interface SecretAccess {
  id: string;
  secretId: string;
  userId: string;
  accessedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class SecretsVaultService {
  private prisma: PrismaClient;
  private encryptionKey: string;
  private algorithm = 'aes-256-gcm';

  constructor() {
    this.prisma = new PrismaClient();
    this.encryptionKey = process.env.SECRETS_ENCRYPTION_KEY || this.generateEncryptionKey();
  }

  async createSecret(data: SecretData): Promise<{ id: string; name: string }> {
    try {
      // Encrypt the secret value
      const encryptedValue = this.encrypt(data.value);

      // Store in database
      const secret = await this.prisma.secret.create({
        data: {
          name: data.name,
          value: encryptedValue,
          description: data.description,
          tags: data.tags || [],
          projectId: data.projectId,
          userId: data.userId,
          expiresAt: data.expiresAt,
          isActive: data.isActive !== false
        }
      });

      // Log secret creation
      await this.logSecretActivity('create', secret.id, data.userId, {
        name: data.name,
        projectId: data.projectId,
        hasExpiration: !!data.expiresAt
      });

      logger.info('Secret created', { secretId: secret.id, name: data.name, userId: data.userId });

      return {
        id: secret.id,
        name: secret.name
      };

    } catch (error) {
      logger.error('Secret creation failed', { error: error.message, userId: data.userId });
      throw error;
    }
  }

  async getSecret(secretId: string, userId: string, context?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ name: string; value: string; description?: string; tags?: string[] }> {
    try {
      const secret = await this.prisma.secret.findFirst({
        where: {
          id: secretId,
          isActive: true,
          OR: [
            { userId }, // User's own secrets
            { projectId: { in: await this.getUserProjectIds(userId) } } // Project secrets
          ]
        }
      });

      if (!secret) {
        throw new Error('Secret not found or access denied');
      }

      // Check expiration
      if (secret.expiresAt && secret.expiresAt < new Date()) {
        throw new Error('Secret has expired');
      }

      // Decrypt the secret value
      const decryptedValue = this.decrypt(secret.value);

      // Log secret access
      await this.logSecretAccess(secretId, userId, context);

      logger.info('Secret accessed', { secretId, userId });

      return {
        name: secret.name,
        value: decryptedValue,
        description: secret.description || undefined,
        tags: secret.tags || undefined
      };

    } catch (error) {
      logger.error('Secret access failed', { error: error.message, secretId, userId });
      throw error;
    }
  }

  async updateSecret(secretId: string, userId: string, updates: {
    name?: string;
    value?: string;
    description?: string;
    tags?: string[];
    expiresAt?: Date;
  }): Promise<void> {
    try {
      // Check if user owns the secret
      const secret = await this.prisma.secret.findFirst({
        where: {
          id: secretId,
          userId,
          isActive: true
        }
      });

      if (!secret) {
        throw new Error('Secret not found or access denied');
      }

      // Prepare update data
      const updateData: any = {};
      
      if (updates.name) updateData.name = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt;
      
      if (updates.value) {
        updateData.value = this.encrypt(updates.value);
      }

      // Update secret
      await this.prisma.secret.update({
        where: { id: secretId },
        data: updateData
      });

      // Log secret update
      await this.logSecretActivity('update', secretId, userId, {
        updatedFields: Object.keys(updates)
      });

      logger.info('Secret updated', { secretId, userId });

    } catch (error) {
      logger.error('Secret update failed', { error: error.message, secretId, userId });
      throw error;
    }
  }

  async deleteSecret(secretId: string, userId: string): Promise<void> {
    try {
      // Check if user owns the secret
      const secret = await this.prisma.secret.findFirst({
        where: {
          id: secretId,
          userId,
          isActive: true
        }
      });

      if (!secret) {
        throw new Error('Secret not found or access denied');
      }

      // Soft delete
      await this.prisma.secret.update({
        where: { id: secretId },
        data: { isActive: false }
      });

      // Log secret deletion
      await this.logSecretActivity('delete', secretId, userId, {
        name: secret.name
      });

      logger.info('Secret deleted', { secretId, userId });

    } catch (error) {
      logger.error('Secret deletion failed', { error: error.message, secretId, userId });
      throw error;
    }
  }

  async listSecrets(userId: string, filters?: {
    projectId?: string;
    tags?: string[];
    includeExpired?: boolean;
  }): Promise<Array<{
    id: string;
    name: string;
    description?: string;
    tags?: string[];
    projectId?: string;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  }>> {
    try {
      const where: any = {
        isActive: true,
        OR: [
          { userId }, // User's own secrets
          { projectId: { in: await this.getUserProjectIds(userId) } } // Project secrets
        ]
      };

      if (filters?.projectId) {
        where.projectId = filters.projectId;
      }

      if (filters?.tags && filters.tags.length > 0) {
        where.tags = {
          hasSome: filters.tags
        };
      }

      if (!filters?.includeExpired) {
        where.OR = [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } }
        ];
      }

      const secrets = await this.prisma.secret.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          tags: true,
          projectId: true,
          expiresAt: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { updatedAt: 'desc' }
      });

      return secrets;

    } catch (error) {
      logger.error('Secret listing failed', { error: error.message, userId });
      throw error;
    }
  }

  async getSecretAccessLogs(secretId: string, userId: string, limit = 50): Promise<SecretAccess[]> {
    try {
      // Check if user has access to this secret
      const secret = await this.prisma.secret.findFirst({
        where: {
          id: secretId,
          OR: [
            { userId },
            { projectId: { in: await this.getUserProjectIds(userId) } }
          ]
        }
      });

      if (!secret) {
        throw new Error('Secret not found or access denied');
      }

      // Get access logs from MongoDB
      const logs = await mongoDBService.getCollection('secret_access_logs')
        ?.find({ secretId })
        .sort({ accessedAt: -1 })
        .limit(limit)
        .toArray() || [];

      return logs.map(log => ({
        id: log._id.toString(),
        secretId: log.secretId,
        userId: log.userId,
        accessedAt: log.accessedAt,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent
      }));

    } catch (error) {
      logger.error('Secret access logs retrieval failed', { error: error.message, secretId, userId });
      throw error;
    }
  }

  async rotateSecret(secretId: string, userId: string, newValue: string): Promise<void> {
    try {
      // Check if user owns the secret
      const secret = await this.prisma.secret.findFirst({
        where: {
          id: secretId,
          userId,
          isActive: true
        }
      });

      if (!secret) {
        throw new Error('Secret not found or access denied');
      }

      // Update with new encrypted value
      await this.prisma.secret.update({
        where: { id: secretId },
        data: {
          value: this.encrypt(newValue),
          updatedAt: new Date()
        }
      });

      // Log secret rotation
      await this.logSecretActivity('rotate', secretId, userId, {
        name: secret.name
      });

      logger.info('Secret rotated', { secretId, userId });

    } catch (error) {
      logger.error('Secret rotation failed', { error: error.message, secretId, userId });
      throw error;
    }
  }

  async bulkCreateSecrets(secrets: Omit<SecretData, 'userId'>[], userId: string): Promise<{
    created: number;
    failed: number;
    errors: string[];
  }> {
    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const secretData of secrets) {
      try {
        await this.createSecret({ ...secretData, userId });
        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Failed to create secret "${secretData.name}": ${error.message}`);
      }
    }

    logger.info('Bulk secret creation completed', { 
      userId, 
      created: results.created, 
      failed: results.failed 
    });

    return results;
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher(this.algorithm, this.encryptionKey);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  private decrypt(encryptedText: string): string {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipher(this.algorithm, this.encryptionKey);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async getUserProjectIds(userId: string): Promise<string[]> {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      select: { organizationId: true }
    });

    const organizationIds = memberships.map(m => m.organizationId);

    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { userId },
          { organizationId: { in: organizationIds } }
        ]
      },
      select: { id: true }
    });

    return projects.map(p => p.id);
  }

  private async logSecretActivity(action: string, secretId: string, userId: string, metadata: any): Promise<void> {
    try {
      await mongoDBService.logSystemActivity({
        level: 'info',
        message: `Secret ${action}`,
        metadata: {
          action,
          secretId,
          userId,
          ...metadata
        },
        userId
      });
    } catch (error) {
      logger.error('Failed to log secret activity', { error: error.message });
    }
  }

  private async logSecretAccess(secretId: string, userId: string, context?: {
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    try {
      const collection = mongoDBService.getCollection('secret_access_logs');
      if (collection) {
        await collection.insertOne({
          secretId,
          userId,
          accessedAt: new Date(),
          ipAddress: context?.ipAddress,
          userAgent: context?.userAgent
        });
      }
    } catch (error) {
      logger.error('Failed to log secret access', { error: error.message });
    }
  }
}
