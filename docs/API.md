# DevSync API Documentation

## Base URL

- **Development:** `http://localhost:8000`
- **Production:** `https://api.devsync.com`

## Authentication

DevSync uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "USER"
  },
  "tokens": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

## Core API Endpoints

### AI Translation

#### Translate Requirements

Converts natural language requirements into structured data and code.

```http
POST /api/translate
Content-Type: application/json
Authorization: Bearer <token>

{
  "requirements": "Build an e-commerce platform where users can browse products, add items to cart, and checkout. Users should be able to create accounts, view order history, and leave reviews.",
  "options": {
    "framework": "node",
    "database": "postgresql",
    "includeAuth": true,
    "includeTests": true,
    "includeDocs": true
  }
}
```

**Response:**
```json
{
  "entities": [
    {
      "name": "User",
      "description": "User account information",
      "attributes": [
        {
          "name": "id",
          "type": "string",
          "required": true,
          "unique": true,
          "description": "Unique user identifier"
        },
        {
          "name": "email",
          "type": "email",
          "required": true,
          "unique": true,
          "description": "User email address"
        },
        {
          "name": "name",
          "type": "string",
          "required": true,
          "description": "User full name"
        }
      ],
      "relationships": [
        {
          "target": "Order",
          "type": "one-to-many",
          "description": "User can have multiple orders"
        }
      ]
    }
  ],
  "openApiSpec": {
    "openapi": "3.0.0",
    "info": {
      "title": "E-commerce API",
      "version": "1.0.0",
      "description": "Generated API for e-commerce platform"
    },
    "paths": {
      "/users": {
        "get": {
          "summary": "List users",
          "responses": {
            "200": {
              "description": "List of users",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "array",
                    "items": {
                      "$ref": "#/components/schemas/User"
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    "components": {
      "schemas": {
        "User": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string"
            },
            "email": {
              "type": "string",
              "format": "email"
            },
            "name": {
              "type": "string"
            }
          }
        }
      }
    }
  },
  "testCases": [
    {
      "name": "Create User",
      "description": "Test user creation endpoint",
      "type": "unit",
      "steps": [
        "Send POST request to /users",
        "Verify response status is 201",
        "Verify user data is returned"
      ],
      "expectedResult": "User is created successfully"
    }
  ],
  "codeTemplates": {
    "backend": "// Express.js server code...",
    "frontend": "// React components...",
    "database": "// Prisma schema..."
  },
  "recommendations": [
    "Consider implementing rate limiting for API endpoints",
    "Add input validation for all user inputs",
    "Implement proper error handling and logging"
  ]
}
```

#### Validate Requirements

Validates requirements for completeness and clarity.

```http
POST /api/translate/validate
Content-Type: application/json
Authorization: Bearer <token>

{
  "requirements": "Build a website"
}
```

**Response:**
```json
{
  "isValid": false,
  "issues": [
    "Missing information about website purpose",
    "No mention of user roles or permissions",
    "Unclear about required features"
  ],
  "suggestions": [
    "Specify the type of website (e-commerce, blog, portfolio)",
    "Define user roles (admin, user, guest)",
    "List specific features and functionality"
  ]
}
```

### Project Management

#### List Projects

```http
GET /api/projects
Authorization: Bearer <token>
```

**Response:**
```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "E-commerce Platform",
      "description": "Online store with user management",
      "status": "ACTIVE",
      "visibility": "PRIVATE",
      "createdAt": "2024-01-15T10:30:00Z",
      "updatedAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "totalPages": 1
  }
}
```

#### Create Project

```http
POST /api/projects
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "My New Project",
  "description": "Project description",
  "visibility": "PRIVATE"
}
```

#### Get Project Details

```http
GET /api/projects/{projectId}
Authorization: Bearer <token>
```

#### Update Project

```http
PUT /api/projects/{projectId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

#### Delete Project

```http
DELETE /api/projects/{projectId}
Authorization: Bearer <token>
```

### API Connectors

#### List Available Connectors

```http
GET /api/connectors
Authorization: Bearer <token>
```

**Response:**
```json
{
  "connectors": [
    {
      "id": "slack",
      "name": "Slack",
      "type": "slack",
      "baseUrl": "https://slack.com/api",
      "authType": "bearer",
      "rateLimit": {
        "requests": 100,
        "window": 60
      },
      "status": "available"
    },
    {
      "id": "stripe",
      "name": "Stripe",
      "type": "stripe",
      "baseUrl": "https://api.stripe.com/v1",
      "authType": "bearer",
      "rateLimit": {
        "requests": 100,
        "window": 1
      },
      "status": "available"
    }
  ]
}
```

#### Configure Connector

```http
POST /api/connectors/{connectorId}/configure
Content-Type: application/json
Authorization: Bearer <token>

{
  "credentials": {
    "token": "xoxb-your-slack-token"
  },
  "projectId": "proj_123"
}
```

#### Test Connector

```http
POST /api/connectors/{connectorId}/test
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Connection successful",
  "responseTime": 245
}
```

#### Make Connector Request

```http
POST /api/connectors/{connectorId}/request
Content-Type: application/json
Authorization: Bearer <token>

{
  "method": "GET",
  "endpoint": "/users.list",
  "data": {},
  "options": {
    "timeout": 30000
  }
}
```

**Response:**
```json
{
  "data": {
    "ok": true,
    "members": [...]
  },
  "status": 200,
  "headers": {
    "content-type": "application/json"
  },
  "metadata": {
    "connectorId": "slack",
    "timestamp": "2024-01-15T10:30:00Z",
    "duration": 245,
    "retryCount": 0
  }
}
```

### Code Generation

#### Generate Code

```http
POST /api/codegen/generate
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": "proj_123",
  "entities": [...],
  "openApiSpec": {...},
  "options": {
    "framework": "node",
    "database": "postgresql",
    "includeAuth": true,
    "includeTests": true,
    "includeDocs": true
  }
}
```

**Response:**
```json
{
  "files": [
    {
      "path": "src/app.js",
      "content": "const express = require('express');...",
      "type": "backend"
    },
    {
      "path": "src/models/User.js",
      "content": "const { PrismaClient } = require('@prisma/client');...",
      "type": "backend"
    }
  ],
  "dependencies": [
    "express",
    "cors",
    "helmet",
    "prisma",
    "@prisma/client"
  ],
  "scripts": {
    "start": "node src/app.js",
    "dev": "nodemon src/app.js",
    "test": "jest"
  },
  "instructions": [
    "1. Install dependencies: npm install",
    "2. Set up environment variables: cp .env.example .env",
    "3. Run database migrations: npx prisma migrate dev",
    "4. Start the application: npm run dev"
  ]
}
```

### Authentication & User Management

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login User

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Refresh Token

```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

#### Change Password

```http
PUT /api/auth/password
Content-Type: application/json
Authorization: Bearer <token>

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

#### Reset Password

```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Confirm Password Reset

```http
POST /api/auth/confirm-reset
Content-Type: application/json

{
  "token": "reset-token",
  "newPassword": "newpassword"
}
```

### Secrets Management

#### List Secrets

```http
GET /api/secrets
Authorization: Bearer <token>
```

**Query Parameters:**
- `projectId` (optional): Filter by project
- `tags` (optional): Filter by tags (comma-separated)
- `includeExpired` (optional): Include expired secrets

#### Create Secret

```http
POST /api/secrets
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "database_password",
  "value": "secretpassword123",
  "description": "Database password for production",
  "tags": ["database", "production"],
  "projectId": "proj_123",
  "expiresAt": "2024-12-31T23:59:59Z"
}
```

#### Get Secret

```http
GET /api/secrets/{secretId}
Authorization: Bearer <token>
```

#### Update Secret

```http
PUT /api/secrets/{secretId}
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "updated_name",
  "value": "newsecretvalue",
  "description": "Updated description"
}
```

#### Delete Secret

```http
DELETE /api/secrets/{secretId}
Authorization: Bearer <token>
```

#### Rotate Secret

```http
POST /api/secrets/{secretId}/rotate
Content-Type: application/json
Authorization: Bearer <token>

{
  "newValue": "newsecretvalue"
}
```

### Monitoring & Analytics

#### Get System Health

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "neo4j": "healthy",
    "mongodb": "healthy"
  },
  "metrics": {
    "uptime": 3600,
    "memoryUsage": {
      "rss": 45678912,
      "heapTotal": 20971520,
      "heapUsed": 15728640,
      "external": 1234567
    },
    "cpuUsage": {
      "user": 1234567,
      "system": 123456
    }
  }
}
```

#### Get Metrics

```http
GET /api/metrics
Authorization: Bearer <token>
```

**Query Parameters:**
- `timeRange` (optional): Time range for metrics (1h, 24h, 7d, 30d)
- `metric` (optional): Specific metric to retrieve

#### Get Logs

```http
GET /api/logs
Authorization: Bearer <token>
```

**Query Parameters:**
- `level` (optional): Log level (error, warn, info, debug)
- `service` (optional): Service name
- `limit` (optional): Number of logs to return (default: 100)

## WebSocket API

### Connection

Connect to the WebSocket endpoint:

```javascript
const ws = new WebSocket('ws://localhost:8000');

ws.onopen = () => {
  console.log('Connected to DevSync WebSocket');
  
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: 'your-jwt-token'
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Events

#### Authentication

```json
{
  "type": "auth",
  "token": "your-jwt-token"
}
```

#### Subscribe to Project Updates

```json
{
  "type": "subscribe",
  "channel": "project:proj_123"
}
```

#### Unsubscribe from Project Updates

```json
{
  "type": "unsubscribe",
  "channel": "project:proj_123"
}
```

### Incoming Events

#### Project Update

```json
{
  "type": "project_update",
  "channel": "project:proj_123",
  "data": {
    "event": "translation_complete",
    "projectId": "proj_123",
    "timestamp": "2024-01-15T10:30:00Z",
    "details": {
      "entitiesCount": 5,
      "apisGenerated": 12,
      "testCasesGenerated": 8
    }
  }
}
```

#### Code Generation Progress

```json
{
  "type": "codegen_progress",
  "channel": "project:proj_123",
  "data": {
    "projectId": "proj_123",
    "progress": 75,
    "currentStep": "Generating frontend components",
    "estimatedTimeRemaining": 30
  }
}
```

#### Connector Status Update

```json
{
  "type": "connector_update",
  "channel": "connector:slack",
  "data": {
    "connectorId": "slack",
    "status": "connected",
    "lastSync": "2024-01-15T10:30:00Z",
    "metrics": {
      "requestsToday": 150,
      "errorRate": 0.02
    }
  }
}
```

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    },
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR`: Input validation failed
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_ERROR`: Server error
- `CONNECTOR_ERROR`: API connector error
- `AI_SERVICE_ERROR`: AI service unavailable

### HTTP Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error
- `502 Bad Gateway`: External service error
- `503 Service Unavailable`: Service temporarily unavailable

## Rate Limiting

API requests are rate limited to prevent abuse:

- **Authenticated users:** 1000 requests per hour
- **Unauthenticated users:** 100 requests per hour
- **AI Translation:** 10 requests per hour per user
- **Code Generation:** 5 requests per hour per user

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `sort`: Sort field (default: createdAt)
- `order`: Sort order (asc, desc)

**Response Format:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @devsync/sdk
```

```javascript
import { DevSyncClient } from '@devsync/sdk';

const client = new DevSyncClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.devsync.com'
});

// Translate requirements
const result = await client.translate({
  requirements: 'Build an e-commerce platform',
  options: { framework: 'node' }
});
```

### Python

```bash
pip install devsync-sdk
```

```python
from devsync import DevSyncClient

client = DevSyncClient(api_key='your-api-key')

# Translate requirements
result = client.translate(
    requirements='Build an e-commerce platform',
    options={'framework': 'node'}
)
```

### Go

```bash
go get github.com/devsync/go-sdk
```

```go
package main

import (
    "github.com/devsync/go-sdk"
)

func main() {
    client := devsync.NewClient("your-api-key")
    
    result, err := client.Translate(devsync.TranslateRequest{
        Requirements: "Build an e-commerce platform",
        Options: devsync.TranslateOptions{
            Framework: "node",
        },
    })
}
```
