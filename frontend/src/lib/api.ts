// API Integration Layer for DevSync Frontend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Authentication
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: { name: string; email: string; password: string }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Projects
  async getProjects() {
    return this.request('/projects');
  }

  async createProject(projectData: {
    name: string;
    description: string;
    requirements?: string;
  }) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async updateProject(id: string, projectData: any) {
    return this.request(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }

  // AI Translator
  async translateRequirements(requirements: string, type: 'erd' | 'api' | 'code' | 'tests' = 'erd') {
    return this.request('/translate', {
      method: 'POST',
      body: JSON.stringify({ requirements, type }),
    });
  }

  // API Connectors
  async getConnectors() {
    return this.request('/connectors');
  }

  async createConnection(connectorData: {
    service: string;
    credentials: any;
  }) {
    return this.request('/connectors/connect', {
      method: 'POST',
      body: JSON.stringify(connectorData),
    });
  }

  async testConnection(connectorId: string) {
    return this.request(`/connectors/${connectorId}/test`, {
      method: 'POST',
    });
  }

  // API Endpoints
  async getApiEndpoints(projectId?: string) {
    const endpoint = projectId ? `/apis?projectId=${projectId}` : '/apis';
    return this.request(endpoint);
  }

  async createApiEndpoint(endpointData: {
    method: string;
    path: string;
    description: string;
    projectId?: string;
  }) {
    return this.request('/apis', {
      method: 'POST',
      body: JSON.stringify(endpointData),
    });
  }

  // Health Check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };
