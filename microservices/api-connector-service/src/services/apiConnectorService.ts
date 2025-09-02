import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { config } from '../config/config';
import logger from '../config/logger';

export interface ConnectorRequest {
  service: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  data?: any;
  params?: Record<string, any>;
  auth?: {
    type: 'bearer' | 'basic' | 'oauth2' | 'aws4';
    token?: string;
    username?: string;
    password?: string;
    accessToken?: string;
    refreshToken?: string;
  };
}

export interface ConnectorResponse {
  success: boolean;
  data?: any;
  error?: string;
  statusCode: number;
  headers?: Record<string, string>;
  metadata?: {
    service: string;
    endpoint: string;
    method: string;
    timestamp: string;
    responseTime: number;
  };
}

export class ApiConnectorService {
  private retryAttempts: number;
  private timeout: number;

  constructor() {
    this.retryAttempts = config.maxRetries;
    this.timeout = config.timeout;
  }

  async makeRequest(request: ConnectorRequest): Promise<ConnectorResponse> {
    const startTime = Date.now();
    
    try {
      const serviceConfig = config.supportedServices[request.service as keyof typeof config.supportedServices];
      if (!serviceConfig) {
        throw new Error(`Unsupported service: ${request.service}`);
      }

      const axiosInstance = this.createAxiosInstance(serviceConfig, request.auth);
      const axiosConfig = this.buildAxiosConfig(request, serviceConfig);

      logger.info('Making API request', {
        service: request.service,
        endpoint: request.endpoint,
        method: request.method
      });

      const response: AxiosResponse = await this.executeWithRetry(
        axiosInstance,
        axiosConfig
      );

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        data: response.data,
        statusCode: response.status,
        headers: response.headers as Record<string, string>,
        metadata: {
          service: request.service,
          endpoint: request.endpoint,
          method: request.method,
          timestamp: new Date().toISOString(),
          responseTime
        }
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      logger.error('API request failed', {
        service: request.service,
        endpoint: request.endpoint,
        method: request.method,
        error: error.message,
        responseTime
      });

      return {
        success: false,
        error: error.message,
        statusCode: error.response?.status || 500,
        metadata: {
          service: request.service,
          endpoint: request.endpoint,
          method: request.method,
          timestamp: new Date().toISOString(),
          responseTime
        }
      };
    }
  }

  private createAxiosInstance(serviceConfig: any, auth?: ConnectorRequest['auth']): AxiosInstance {
    const instance = axios.create({
      baseURL: serviceConfig.baseUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DevSync-API-Connector/1.0.0'
      }
    });

    // Add authentication
    if (auth) {
      this.addAuthentication(instance, auth);
    }

    // Add request interceptor for logging
    instance.interceptors.request.use(
      (config) => {
        logger.debug('Outgoing request', {
          url: config.url,
          method: config.method,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        logger.error('Request interceptor error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    instance.interceptors.response.use(
      (response) => {
        logger.debug('Incoming response', {
          status: response.status,
          statusText: response.statusText,
          url: response.config.url
        });
        return response;
      },
      (error) => {
        logger.error('Response interceptor error', {
          error: error.message,
          status: error.response?.status,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );

    return instance;
  }

  private addAuthentication(instance: AxiosInstance, auth: ConnectorRequest['auth']): void {
    if (!auth) return;

    switch (auth.type) {
      case 'bearer':
        if (auth.token) {
          instance.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
        }
        break;
      
      case 'basic':
        if (auth.username && auth.password) {
          const credentials = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
          instance.defaults.headers.common['Authorization'] = `Basic ${credentials}`;
        }
        break;
      
      case 'oauth2':
        if (auth.accessToken) {
          instance.defaults.headers.common['Authorization'] = `Bearer ${auth.accessToken}`;
        }
        break;
      
      case 'aws4':
        // AWS4 signature would be implemented here
        logger.warn('AWS4 authentication not yet implemented');
        break;
    }
  }

  private buildAxiosConfig(request: ConnectorRequest, serviceConfig: any): AxiosRequestConfig {
    return {
      url: request.endpoint,
      method: request.method.toLowerCase() as any,
      headers: {
        ...request.headers
      },
      data: request.data,
      params: request.params
    };
  }

  private async executeWithRetry(
    instance: AxiosInstance,
    config: AxiosRequestConfig,
    attempt: number = 1
  ): Promise<AxiosResponse> {
    try {
      return await instance.request(config);
    } catch (error: any) {
      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${this.retryAttempts})`, {
          error: error.message,
          attempt
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.executeWithRetry(instance, config, attempt + 1);
      }
      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on network errors, timeouts, and 5xx status codes
    return (
      !error.response ||
      error.code === 'ECONNABORTED' ||
      error.code === 'ENOTFOUND' ||
      error.code === 'ECONNREFUSED' ||
      (error.response.status >= 500 && error.response.status < 600)
    );
  }

  // Utility methods for common operations
  async testConnection(service: string, auth?: ConnectorRequest['auth']): Promise<boolean> {
    try {
      const testRequest: ConnectorRequest = {
        service,
        endpoint: '/',
        method: 'GET',
        auth
      };
      
      const response = await this.makeRequest(testRequest);
      return response.success && response.statusCode < 400;
    } catch (error) {
      logger.error('Connection test failed', { service, error: (error as Error).message });
      return false;
    }
  }

  getSupportedServices(): string[] {
    return Object.keys(config.supportedServices);
  }

  getServiceInfo(service: string): any {
    return config.supportedServices[service as keyof typeof config.supportedServices];
  }
}
