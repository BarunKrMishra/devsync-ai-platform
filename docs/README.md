# DevSync Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Quick Start](#quick-start)
4. [API Reference](#api-reference)
5. [Configuration](#configuration)
6. [Deployment](#deployment)
7. [Development](#development)
8. [Troubleshooting](#troubleshooting)

## Overview

DevSync is an AI-powered platform that transforms natural language requirements into production-ready applications. It combines AI requirement translation with universal API connectivity to accelerate development from days to minutes.

### Key Features

- **AI Requirement Translator**: Converts natural language to ERDs, OpenAPI specs, and boilerplate code
- **Universal API Connector**: Integrates with 100+ services with OAuth, retries, and monitoring
- **Multi-Database Support**: PostgreSQL, Neo4j, MongoDB, Redis
- **Enterprise Security**: SSO/SAML, secrets vault, audit logs, role-based permissions
- **Full Observability**: OpenTelemetry, Prometheus, Grafana, Jaeger
- **Multi-Framework Support**: Node.js, Laravel, Java, Python, React, Vue, Angular

## Architecture

### System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Databases     │
│   (Next.js)     │◄──►│   (Express.js)  │◄──►│   (Multi-DB)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Monitoring    │    │   AI Services   │    │   API Connectors│
│   (Grafana)     │    │   (OpenAI)      │    │   (100+ APIs)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 14 with App Router
- React 18 with TypeScript
- Tailwind CSS for styling
- Lucide React for icons

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- Prisma ORM for database operations
- JWT for authentication
- Passport.js for SSO

**Databases:**
- PostgreSQL (primary data)
- Neo4j (graph relationships)
- MongoDB (logs and analytics)
- Redis (caching and queues)

**AI & ML:**
- OpenAI GPT-4 for code generation
- Anthropic Claude for requirement analysis
- Custom prompt engineering

**Monitoring:**
- OpenTelemetry for distributed tracing
- Prometheus for metrics collection
- Grafana for visualization
- Jaeger for trace analysis

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-org/devsync.git
   cd devsync
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the development environment:**
   ```bash
   # Using Docker Compose (recommended)
   docker-compose up -d
   
   # Or using setup scripts
   ./setup.sh  # Linux/Mac
   setup.bat   # Windows
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Grafana: http://localhost:3001 (admin/admin)
   - Jaeger: http://localhost:16686

### First Steps

1. **Create an account** at http://localhost:3000/register
2. **Start a new project** and describe your requirements
3. **Watch the AI translate** your requirements into structured data
4. **Generate code** for your preferred framework
5. **Connect APIs** and deploy your application

## API Reference

### Authentication

All API endpoints require authentication via JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Core Endpoints

#### AI Translation

```http
POST /api/translate
Content-Type: application/json

{
  "requirements": "Build an e-commerce platform with user management",
  "options": {
    "framework": "node",
    "database": "postgresql",
    "includeAuth": true,
    "includeTests": true
  }
}
```

**Response:**
```json
{
  "entities": [...],
  "openApiSpec": {...},
  "testCases": [...],
  "codeTemplates": {
    "backend": "...",
    "frontend": "...",
    "database": "..."
  },
  "recommendations": [...]
}
```

#### API Connectors

```http
GET /api/connectors
```

```http
POST /api/connectors/{connectorId}/test
```

```http
POST /api/connectors/{connectorId}/request
Content-Type: application/json

{
  "method": "GET",
  "endpoint": "/users",
  "data": {}
}
```

#### Project Management

```http
GET /api/projects
POST /api/projects
GET /api/projects/{id}
PUT /api/projects/{id}
DELETE /api/projects/{id}
```

### WebSocket Events

Connect to `ws://localhost:8000` for real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8000');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Update:', data);
};
```

## Configuration

### Environment Variables

#### Required Variables

```bash
# Database URLs
DATABASE_URL=postgresql://user:password@localhost:5432/devsync
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
MONGODB_URI=mongodb://localhost:27017/devsync
REDIS_URL=redis://localhost:6379

# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# AI API Keys
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

#### Optional Variables

```bash
# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# SAML Configuration
SAML_ENTRY_POINT=https://your-saml-provider.com/sso
SAML_ISSUER=devsync
SAML_CERT=your-saml-certificate

# Monitoring
JAEGER_ENDPOINT=http://localhost:14268/api/traces
PROMETHEUS_PORT=9464

# Secrets Encryption
SECRETS_ENCRYPTION_KEY=your-32-character-encryption-key
```

### Database Configuration

#### PostgreSQL
- Default port: 5432
- Database: devsync
- User: devsync
- Password: devsync_password

#### Neo4j
- HTTP port: 7474
- Bolt port: 7687
- User: neo4j
- Password: devsync_password

#### MongoDB
- Port: 27017
- Database: devsync
- User: devsync
- Password: devsync_password

#### Redis
- Port: 6379
- No authentication required for development

## Deployment

### Production Deployment

1. **Prepare production environment:**
   ```bash
   # Set production environment variables
   export NODE_ENV=production
   export DATABASE_URL=postgresql://prod-user:prod-pass@prod-host:5432/devsync
   # ... other production variables
   ```

2. **Build the application:**
   ```bash
   # Build frontend
   cd frontend
   npm run build
   
   # Build backend
   cd ../backend
   npm run build
   ```

3. **Run database migrations:**
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

4. **Start the application:**
   ```bash
   # Using Docker Compose
   docker-compose -f docker-compose.prod.yml up -d
   
   # Or using PM2
   pm2 start ecosystem.config.js
   ```

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Scale services
docker-compose up -d --scale backend=3
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

## Development

### Local Development Setup

1. **Install dependencies:**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   ```

2. **Start development servers:**
   ```bash
   # Terminal 1: Start databases
   docker-compose up postgres neo4j mongodb redis
   
   # Terminal 2: Start backend
   cd backend && npm run dev
   
   # Terminal 3: Start frontend
   cd frontend && npm run dev
   ```

3. **Run tests:**
   ```bash
   # Backend tests
   cd backend && npm test
   
   # Frontend tests
   cd frontend && npm test
   
   # E2E tests
   npm run test:e2e
   ```

### Code Structure

```
devsync/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   └── lib/            # Utility functions
│   └── public/             # Static assets
├── backend/                 # Express.js backend API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── services/       # Business logic services
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Express middleware
│   │   └── index.ts        # Application entry point
│   └── prisma/             # Database schema and migrations
├── docker/                  # Docker configuration files
├── docs/                   # Documentation
└── k8s/                    # Kubernetes manifests
```

### Adding New Features

1. **Create feature branch:**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **Implement changes:**
   - Add backend API endpoints in `backend/src/routes/`
   - Add frontend components in `frontend/src/components/`
   - Update database schema in `backend/prisma/schema.prisma`

3. **Run tests and linting:**
   ```bash
   npm run test
   npm run lint
   ```

4. **Create pull request:**
   ```bash
   git push origin feature/new-feature
   ```

### Database Migrations

```bash
# Create a new migration
cd backend
npx prisma migrate dev --name add-new-feature

# Apply migrations to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
1. Check if PostgreSQL is running: `docker ps`
2. Verify connection string in `.env`
3. Restart database: `docker-compose restart postgres`

#### AI API Issues

**Problem:** OpenAI API requests failing
```bash
Error: Invalid API key
```

**Solution:**
1. Verify API key in `.env` file
2. Check API key permissions and billing
3. Ensure rate limits are not exceeded

#### Frontend Build Issues

**Problem:** Next.js build failing
```bash
Error: Module not found
```

**Solution:**
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check import paths and file extensions

### Performance Issues

#### Slow API Responses

1. **Check database queries:**
   ```bash
   # Enable query logging in Prisma
   # Add to backend/src/config/database.ts
   log: ['query', 'info', 'warn', 'error']
   ```

2. **Monitor with Grafana:**
   - Access http://localhost:3001
   - Check response time metrics
   - Identify slow endpoints

3. **Optimize database:**
   - Add indexes for frequently queried fields
   - Use database connection pooling
   - Implement query caching with Redis

#### High Memory Usage

1. **Monitor memory usage:**
   ```bash
   # Check container memory usage
   docker stats
   ```

2. **Optimize Node.js:**
   - Increase heap size: `--max-old-space-size=4096`
   - Use clustering for multiple processes
   - Implement memory leak detection

### Logging and Debugging

#### Enable Debug Logging

```bash
# Set debug level
export DEBUG=devsync:*
export LOG_LEVEL=debug
```

#### View Application Logs

```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Application logs
tail -f backend/logs/app.log
```

#### Database Debugging

```bash
# Connect to databases
docker exec -it devsync-postgres psql -U devsync -d devsync
docker exec -it devsync-neo4j cypher-shell -u neo4j -p devsync_password
docker exec -it devsync-mongodb mongosh devsync
```

### Getting Help

1. **Check the logs** for error messages
2. **Review the documentation** for configuration options
3. **Search existing issues** on GitHub
4. **Create a new issue** with:
   - Error messages and logs
   - Steps to reproduce
   - Environment details
   - Expected vs actual behavior

### Support

- **Documentation:** [docs.devsync.com](https://docs.devsync.com)
- **GitHub Issues:** [github.com/your-org/devsync/issues](https://github.com/your-org/devsync/issues)
- **Community Discord:** [discord.gg/devsync](https://discord.gg/devsync)
- **Email Support:** support@devsync.com
