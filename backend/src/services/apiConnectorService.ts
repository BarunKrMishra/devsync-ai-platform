import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { config } from '@/config/config'
import { logger } from '@/config/logger'
import { redisClient } from '@/config/database'

export interface ConnectorConfig {
  id: string
  name: string
  type: ConnectorType
  baseUrl: string
  authType: AuthType
  credentials: Record<string, any>
  rateLimit?: {
    requests: number
    window: number // in seconds
  }
  retryConfig?: {
    attempts: number
    delay: number // in milliseconds
    backoff: 'linear' | 'exponential'
  }
  timeout?: number
  headers?: Record<string, string>
}

export interface ConnectorResponse<T = any> {
  data: T
  status: number
  headers: Record<string, string>
  metadata: {
    connectorId: string
    timestamp: Date
    duration: number
    retryCount: number
  }
}

export interface OAuthConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scope: string[]
  authUrl: string
  tokenUrl: string
  refreshUrl?: string
}

export enum ConnectorType {
  SLACK = 'slack',
  JIRA = 'jira',
  GITHUB = 'github',
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
  SALESFORCE = 'salesforce',
  STRIPE = 'stripe',
  TWILIO = 'twilio',
  SENDGRID = 'sendgrid',
  AWS = 'aws',
  CUSTOM = 'custom'
}

export enum AuthType {
  NONE = 'none',
  API_KEY = 'api_key',
  BASIC = 'basic',
  BEARER = 'bearer',
  OAUTH2 = 'oauth2',
  OAUTH1 = 'oauth1'
}

export class ApiConnectorService {
  private connectors: Map<string, ConnectorConfig> = new Map()
  private httpClients: Map<string, AxiosInstance> = new Map()
  private oauthTokens: Map<string, any> = new Map()

  constructor() {
    this.initializeBuiltInConnectors()
  }

  private initializeBuiltInConnectors(): void {
    // Slack Connector
    this.registerConnector({
      id: 'slack',
      name: 'Slack',
      type: ConnectorType.SLACK,
      baseUrl: 'https://slack.com/api',
      authType: AuthType.BEARER,
      credentials: {},
      rateLimit: { requests: 100, window: 60 },
      retryConfig: { attempts: 3, delay: 1000, backoff: 'exponential' }
    })

    // Jira Connector
    this.registerConnector({
      id: 'jira',
      name: 'Jira',
      type: ConnectorType.JIRA,
      baseUrl: 'https://your-domain.atlassian.net/rest/api/3',
      authType: AuthType.BASIC,
      credentials: {},
      rateLimit: { requests: 100, window: 60 },
      retryConfig: { attempts: 3, delay: 1000, backoff: 'exponential' }
    })

    // GitHub Connector
    this.registerConnector({
      id: 'github',
      name: 'GitHub',
      type: ConnectorType.GITHUB,
      baseUrl: 'https://api.github.com',
      authType: AuthType.BEARER,
      credentials: {},
      rateLimit: { requests: 5000, window: 3600 },
      retryConfig: { attempts: 3, delay: 1000, backoff: 'exponential' }
    })

    // Google Connector
    this.registerConnector({
      id: 'google',
      name: 'Google',
      type: ConnectorType.GOOGLE,
      baseUrl: 'https://www.googleapis.com',
      authType: AuthType.OAUTH2,
      credentials: {},
      rateLimit: { requests: 100, window: 60 },
      retryConfig: { attempts: 3, delay: 1000, backoff: 'exponential' }
    })

    // Stripe Connector
    this.registerConnector({
      id: 'stripe',
      name: 'Stripe',
      type: ConnectorType.STRIPE,
      baseUrl: 'https://api.stripe.com/v1',
      authType: AuthType.BEARER,
      credentials: {},
      rateLimit: { requests: 100, window: 1 },
      retryConfig: { attempts: 3, delay: 1000, backoff: 'exponential' }
    })

    // Twilio Connector
    this.registerConnector({
      id: 'twilio',
      name: 'Twilio',
      type: ConnectorType.TWILIO,
      baseUrl: 'https://api.twilio.com/2010-04-01',
      authType: AuthType.BASIC,
      credentials: {},
      rateLimit: { requests: 100, window: 60 },
      retryConfig: { attempts: 3, delay: 1000, backoff: 'exponential' }
    })

    // SendGrid Connector
    this.registerConnector({
      id: 'sendgrid',
      name: 'SendGrid',
      type: ConnectorType.SENDGRID,
      baseUrl: 'https://api.sendgrid.com/v3',
      authType: AuthType.BEARER,
      credentials: {},
      rateLimit: { requests: 600, window: 60 },
      retryConfig: { attempts: 3, delay: 1000, backoff: 'exponential' }
    })
  }

  registerConnector(connectorConfig: ConnectorConfig): void {
    this.connectors.set(connectorConfig.id, connectorConfig)
    this.createHttpClient(connectorConfig)
    logger.info('Registered connector', { id: connectorConfig.id, type: connectorConfig.type })
  }

  private createHttpClient(connectorConfig: ConnectorConfig): void {
    const client = axios.create({
      baseURL: connectorConfig.baseUrl,
      timeout: connectorConfig.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DevSync-Connector/1.0',
        ...connectorConfig.headers
      }
    })

    // Add request interceptor for authentication
    client.interceptors.request.use(async (config) => {
      await this.addAuthentication(config, connectorConfig)
      return config
    })

    // Add response interceptor for error handling and retries
    client.interceptors.response.use(
      (response) => response,
      async (error) => {
        return this.handleError(error, connectorConfig)
      }
    )

    this.httpClients.set(connectorConfig.id, client)
  }

  private async addAuthentication(
    requestConfig: AxiosRequestConfig,
    connectorConfig: ConnectorConfig
  ): Promise<void> {
    const { authType, credentials } = connectorConfig

    switch (authType) {
      case AuthType.API_KEY:
        if (credentials.apiKey) {
          requestConfig.headers = {
            ...requestConfig.headers,
            'X-API-Key': credentials.apiKey
          }
        }
        break

      case AuthType.BASIC:
        if (credentials.username && credentials.password) {
          const auth = Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')
          requestConfig.headers = {
            ...requestConfig.headers,
            'Authorization': `Basic ${auth}`
          }
        }
        break

      case AuthType.BEARER:
        if (credentials.token) {
          requestConfig.headers = {
            ...requestConfig.headers,
            'Authorization': `Bearer ${credentials.token}`
          }
        }
        break

      case AuthType.OAUTH2:
        const oauthToken = await this.getOAuthToken(connectorConfig.id)
        if (oauthToken) {
          requestConfig.headers = {
            ...requestConfig.headers,
            'Authorization': `Bearer ${oauthToken.access_token}`
          }
        }
        break

      case AuthType.OAUTH1:
        // OAuth 1.0 implementation would go here
        break
    }
  }

  private async getOAuthToken(connectorId: string): Promise<any> {
    const cachedToken = await redisClient.get(`oauth_token:${connectorId}`)
    if (cachedToken) {
      return JSON.parse(cachedToken)
    }

    const token = this.oauthTokens.get(connectorId)
    if (token) {
      await redisClient.setEx(`oauth_token:${connectorId}`, 3600, JSON.stringify(token))
      return token
    }

    return null
  }

  private async handleError(error: any, connectorConfig: ConnectorConfig): Promise<any> {
    const { response, config } = error
    const retryConfig = connectorConfig.retryConfig

    if (!retryConfig || !config) {
      throw error
    }

    const retryCount = config.retryCount || 0
    const shouldRetry = this.shouldRetry(response?.status, retryCount, retryConfig.attempts)

    if (shouldRetry) {
      const delay = this.calculateDelay(retryCount, retryConfig)
      
      logger.warn('Retrying API request', {
        connectorId: connectorConfig.id,
        retryCount: retryCount + 1,
        delay,
        status: response?.status
      })

      await this.sleep(delay)
      config.retryCount = retryCount + 1
      
      return this.httpClients.get(connectorConfig.id)?.request(config)
    }

    throw error
  }

  private shouldRetry(status: number, retryCount: number, maxAttempts: number): boolean {
    if (retryCount >= maxAttempts) return false
    
    const retryableStatuses = [408, 429, 500, 502, 503, 504]
    return retryableStatuses.includes(status)
  }

  private calculateDelay(retryCount: number, retryConfig: any): number {
    const { delay, backoff } = retryConfig
    
    if (backoff === 'exponential') {
      return delay * Math.pow(2, retryCount)
    }
    
    return delay * (retryCount + 1)
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  async makeRequest<T = any>(
    connectorId: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    options?: AxiosRequestConfig
  ): Promise<ConnectorResponse<T>> {
    const startTime = Date.now()
    const connector = this.connectors.get(connectorId)
    
    if (!connector) {
      throw new Error(`Connector ${connectorId} not found`)
    }

    const client = this.httpClients.get(connectorId)
    if (!client) {
      throw new Error(`HTTP client for connector ${connectorId} not found`)
    }

    // Check rate limit
    await this.checkRateLimit(connectorId, connector)

    try {
      const response: AxiosResponse<T> = await client.request({
        method,
        url: endpoint,
        data,
        ...options
      })

      const duration = Date.now() - startTime

      logger.info('API request successful', {
        connectorId,
        method,
        endpoint,
        status: response.status,
        duration
      })

      return {
        data: response.data,
        status: response.status,
        headers: response.headers as Record<string, string>,
        metadata: {
          connectorId,
          timestamp: new Date(),
          duration,
          retryCount: options?.retryCount || 0
        }
      }

    } catch (error) {
      const duration = Date.now() - startTime
      
      logger.error('API request failed', {
        connectorId,
        method,
        endpoint,
        error: error.message,
        duration
      })

      throw error
    }
  }

  private async checkRateLimit(connectorId: string, connector: ConnectorConfig): Promise<void> {
    if (!connector.rateLimit) return

    const { requests, window } = connector.rateLimit
    const key = `rate_limit:${connectorId}:${Math.floor(Date.now() / (window * 1000))}`
    
    const currentCount = await redisClient.incr(key)
    
    if (currentCount === 1) {
      await redisClient.expire(key, window)
    }

    if (currentCount > requests) {
      throw new Error(`Rate limit exceeded for connector ${connectorId}`)
    }
  }

  // Convenience methods for common operations
  async get<T = any>(connectorId: string, endpoint: string, options?: AxiosRequestConfig): Promise<ConnectorResponse<T>> {
    return this.makeRequest<T>(connectorId, 'GET', endpoint, undefined, options)
  }

  async post<T = any>(connectorId: string, endpoint: string, data?: any, options?: AxiosRequestConfig): Promise<ConnectorResponse<T>> {
    return this.makeRequest<T>(connectorId, 'POST', endpoint, data, options)
  }

  async put<T = any>(connectorId: string, endpoint: string, data?: any, options?: AxiosRequestConfig): Promise<ConnectorResponse<T>> {
    return this.makeRequest<T>(connectorId, 'PUT', endpoint, data, options)
  }

  async delete<T = any>(connectorId: string, endpoint: string, options?: AxiosRequestConfig): Promise<ConnectorResponse<T>> {
    return this.makeRequest<T>(connectorId, 'DELETE', endpoint, undefined, options)
  }

  async patch<T = any>(connectorId: string, endpoint: string, data?: any, options?: AxiosRequestConfig): Promise<ConnectorResponse<T>> {
    return this.makeRequest<T>(connectorId, 'PATCH', endpoint, data, options)
  }

  // OAuth 2.0 flow methods
  generateOAuthUrl(connectorId: string, oauthConfig: OAuthConfig, state?: string): string {
    const params = new URLSearchParams({
      client_id: oauthConfig.clientId,
      redirect_uri: oauthConfig.redirectUri,
      scope: oauthConfig.scope.join(' '),
      response_type: 'code',
      ...(state && { state })
    })

    return `${oauthConfig.authUrl}?${params.toString()}`
  }

  async exchangeCodeForToken(
    connectorId: string,
    oauthConfig: OAuthConfig,
    code: string
  ): Promise<any> {
    const response = await axios.post(oauthConfig.tokenUrl, {
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: oauthConfig.redirectUri
    })

    const token = response.data
    this.oauthTokens.set(connectorId, token)
    
    // Cache token in Redis
    await redisClient.setEx(
      `oauth_token:${connectorId}`,
      token.expires_in || 3600,
      JSON.stringify(token)
    )

    return token
  }

  async refreshOAuthToken(connectorId: string, oauthConfig: OAuthConfig): Promise<any> {
    const currentToken = await this.getOAuthToken(connectorId)
    
    if (!currentToken?.refresh_token) {
      throw new Error('No refresh token available')
    }

    const response = await axios.post(oauthConfig.refreshUrl || oauthConfig.tokenUrl, {
      client_id: oauthConfig.clientId,
      client_secret: oauthConfig.clientSecret,
      refresh_token: currentToken.refresh_token,
      grant_type: 'refresh_token'
    })

    const newToken = response.data
    this.oauthTokens.set(connectorId, newToken)
    
    // Update cached token
    await redisClient.setEx(
      `oauth_token:${connectorId}`,
      newToken.expires_in || 3600,
      JSON.stringify(newToken)
    )

    return newToken
  }

  // Built-in connector methods
  async sendSlackMessage(channel: string, text: string, options?: any): Promise<ConnectorResponse> {
    return this.post('slack', '/chat.postMessage', {
      channel,
      text,
      ...options
    })
  }

  async createJiraIssue(projectKey: string, issueType: string, summary: string, description?: string): Promise<ConnectorResponse> {
    return this.post('jira', '/issue', {
      fields: {
        project: { key: projectKey },
        issuetype: { name: issueType },
        summary,
        description
      }
    })
  }

  async createGitHubIssue(owner: string, repo: string, title: string, body?: string): Promise<ConnectorResponse> {
    return this.post('github', `/repos/${owner}/${repo}/issues`, {
      title,
      body
    })
  }

  async sendEmail(to: string, subject: string, content: string, from?: string): Promise<ConnectorResponse> {
    return this.post('sendgrid', '/mail/send', {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from || 'noreply@devsync.com' },
      subject,
      content: [{ type: 'text/html', value: content }]
    })
  }

  async sendSMS(to: string, message: string, from?: string): Promise<ConnectorResponse> {
    return this.post('twilio', `/Accounts/${config.services.twilio.accountSid}/Messages.json`, {
      To: to,
      From: from || config.services.twilio.phoneNumber,
      Body: message
    })
  }

  // Utility methods
  getConnector(connectorId: string): ConnectorConfig | undefined {
    return this.connectors.get(connectorId)
  }

  listConnectors(): ConnectorConfig[] {
    return Array.from(this.connectors.values())
  }

  async testConnection(connectorId: string): Promise<boolean> {
    try {
      const connector = this.connectors.get(connectorId)
      if (!connector) return false

      // Try a simple request to test the connection
      await this.get(connectorId, '/')
      return true
    } catch (error) {
      logger.error('Connection test failed', { connectorId, error: error.message })
      return false
    }
  }
}
