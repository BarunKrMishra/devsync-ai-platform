# DevSync - From Requirement to Integration in Days

> AI-Powered Requirement Translator + Universal API Connector

Transform natural language requirements into production-ready applications with DevSync's intelligent microservices platform.

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BarunKrMishra/devsync-project.git
   cd devsync-project
   ```

2. **Set up environment variables:**
   ```bash
   cp env.example .env
   # Edit .env with your API keys and configuration
   ```

3. **Start the entire platform:**
   ```bash
   docker-compose up -d
   ```

4. **Access the services:**
   - **Frontend**: http://localhost:3000
   - **API Gateway**: http://localhost:3009
   - **Documentation**: http://localhost:3000/api-docs

## 🏗️ Architecture

DevSync is built as a production-ready microservices platform:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────────────┐
│   Frontend      │    │   API Gateway   │    │    Microservices        │
│   (Next.js)     │◄──►│   (Port 3000)   │◄──►│ Auth       (Port 3001)  │
│                 │    │                 │    │ AI Trans   (Port 3002)  │
└─────────────────┘    │ • Authentication│    │ API Conn   (Port 3003)  │
                       │ • Rate Limiting │    │ CodeGen    (Port 3004)  │
                       │ • Load Balancer │    │ Project    (Port 3005)  │
                       │ • Circuit Break │    │ Notify     (Port 3006)  │
                       │ • Health Checks │    │ Storage    (Port 3007)  │
                       │ • Observability │    │ Monitor    (Port 3008)  │
                       └─────────────────┘    └─────────────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Infrastructure  │
                       │ • MySQL         │
                       │ • Redis         │
                       │ • Jaeger        │
                       │ • Prometheus    │
                       │ • Grafana       │
                       └─────────────────┘
```

## 🔧 Services Overview

### Core Services

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| **API Gateway** | 3000 | Entry point, routing, auth, rate limiting | ✅ Production Ready |
| **Auth Service** | 3001 | User management, JWT, 2FA, OAuth | ✅ Production Ready |
| **AI Translator** | 3002 | Natural language → Technical specs | ✅ Production Ready |
| **API Connector** | 3003 | Universal API integration platform | ✅ Production Ready |
| **Code Generator** | 3004 | Multi-framework code generation | ✅ Production Ready |
| **Project Service** | 3005 | Project management & collaboration | ✅ Production Ready |
| **Notification** | 3006 | Email, Slack, real-time notifications | ✅ Production Ready |
| **Storage Service** | 3007 | File upload, processing, CDN | ✅ Production Ready |
| **Monitoring** | 3008 | Health checks, metrics, alerting | ✅ Production Ready |

### Infrastructure Services

| Service | Port | Description |
|---------|------|-------------|
| **MySQL** | 3306 | Primary database |
| **Redis** | 6379 | Cache & session store |
| **Jaeger** | 16686 | Distributed tracing |
| **Prometheus** | 9090 | Metrics collection |
| **Grafana** | 3000 | Monitoring dashboards |

## 🌟 Key Features

### 🤖 AI-Powered Translation
- **Natural Language Processing**: Convert requirements into technical specifications
- **Multi-Provider Support**: OpenAI GPT-4 & Anthropic Claude
- **Intelligent Fallback**: Automatic provider switching
- **Comprehensive Output**: ERDs, APIs, tests, code, recommendations

### 🔌 Universal API Connector
- **100+ Service Integrations**: Slack, GitHub, Jira, Google, AWS, Stripe, etc.
- **OAuth 2.0 Support**: Secure authentication flows
- **Rate Limiting**: Built-in protection and retry logic
- **Webhook Management**: Real-time event handling

### 🛡️ Enterprise Security
- **JWT Authentication**: Access & refresh token management
- **Two-Factor Authentication**: TOTP with QR codes
- **Role-Based Access Control**: Granular permissions
- **Audit Logging**: Complete security event tracking
- **Rate Limiting**: DDoS and brute force protection

### 📊 Observability
- **Distributed Tracing**: End-to-end request tracking with Jaeger
- **Metrics Collection**: Performance monitoring with Prometheus
- **Health Checks**: Automated service health monitoring
- **Centralized Logging**: Structured logging across all services

## 🚀 Development

### Local Development

1. **Start core infrastructure:**
   ```bash
   docker-compose up mysql redis jaeger prometheus grafana -d
   ```

2. **Run services individually:**
   ```bash
   # Terminal 1 - API Gateway
   cd microservices/api-gateway
   npm install && npm run dev

   # Terminal 2 - Auth Service
   cd microservices/auth-service
   npm install && npm run dev

   # Terminal 3 - AI Translator
   cd microservices/ai-translator-service
   npm install && npm run dev
   ```

3. **Run frontend:**
   ```bash
   cd frontend
   npm install && npm run dev
   ```

### Testing

```bash
# Run all tests
npm test

# Test specific service
cd microservices/auth-service
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Linting & Code Quality

```bash
# Lint all services
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run type-check
```

## 📦 Deployment

### Production Deployment

1. **Set production environment variables:**
   ```bash
   cp env.example .env.production
   # Configure production values
   ```

2. **Build and deploy:**
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

3. **Scale services:**
   ```bash
   docker-compose up -d --scale auth-service=3 --scale ai-translator-service=2
   ```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f k8s/

# Monitor deployment
kubectl get pods -l app=devsync

# Check service health
kubectl get svc
```

## 🔧 Configuration

### Environment Variables

Key configuration options:

```bash
# AI Services
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Database
DATABASE_URL=mysql://user:pass@host:port/db

# Authentication
JWT_SECRET=your_super_secret_key
JWT_REFRESH_SECRET=your_refresh_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@domain.com
SMTP_PASS=your_password

# AWS (for storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET=your_bucket_name
```

### Service Configuration

Each microservice can be configured independently:

- **API Gateway**: Routing rules, rate limits, circuit breaker settings
- **Auth Service**: Token expiry, 2FA settings, OAuth providers
- **AI Translator**: Model selection, timeout, fallback behavior
- **API Connector**: Provider configurations, webhook settings

## 📊 Monitoring & Observability

### Dashboards

- **Grafana**: http://localhost:3015 (admin/admin)
- **Jaeger**: http://localhost:16686
- **Prometheus**: http://localhost:9090

### Health Checks

```bash
# Check all services
curl http://localhost:3009/health

# Individual service health
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # AI Translator
curl http://localhost:3003/health  # API Connector
```

### Metrics

```bash
# Prometheus metrics
curl http://localhost:3008/metrics

# Custom application metrics
curl http://localhost:3009/api/metrics
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow semantic versioning
- Use conventional commits

## 📄 API Documentation

### Authentication Service
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `GET /auth/verify` - Verify JWT token

### AI Translator Service
- `POST /translate` - Generic translation
- `POST /translate/requirements` - Requirement analysis
- `POST /translate/api-spec` - API specification generation
- `POST /translate/database` - Database design
- `POST /translate/tests` - Test case generation
- `POST /translate/code` - Code generation

### API Connector Service
- `GET /providers` - List available providers
- `POST /connect` - Create API connection
- `GET /connections` - List user connections
- `POST /webhook` - Webhook endpoint

## 🔒 Security

### Security Features

- **JWT Authentication** with refresh tokens
- **Two-Factor Authentication** (TOTP)
- **Role-Based Access Control** (RBAC)
- **Rate Limiting** on all endpoints
- **CORS Protection** with configurable origins
- **Helmet Security Headers**
- **Input Validation** and sanitization
- **Audit Logging** for security events

### Security Best Practices

- Regular security audits
- Dependency vulnerability scanning
- Environment variable encryption
- Database connection encryption
- API rate limiting
- HTTPS in production

## 📈 Performance

### Optimization Features

- **Redis Caching** for frequently accessed data
- **Connection Pooling** for database connections
- **Compression** for API responses
- **CDN Integration** for static assets
- **Circuit Breaker** pattern for external API calls
- **Load Balancing** across service instances

### Performance Monitoring

- Response time tracking
- Memory usage monitoring
- CPU utilization metrics
- Database query performance
- Cache hit/miss ratios

## 🆘 Troubleshooting

### Common Issues

1. **Service won't start**
   ```bash
   # Check logs
   docker-compose logs service-name
   
   # Check health
   curl http://localhost:port/health
   ```

2. **Database connection issues**
   ```bash
   # Check MySQL
   docker-compose logs mysql
   
   # Test connection
   docker exec -it devsync-mysql mysql -u devsync -p devsync
   ```

3. **Redis connection issues**
   ```bash
   # Check Redis
   docker-compose logs redis
   
   # Test connection
   docker exec -it devsync-redis redis-cli ping
   ```

### Getting Help

- **Documentation**: Check service-specific README files
- **Logs**: Use `docker-compose logs service-name`
- **Health Checks**: Use `/health` endpoints
- **Issues**: Create a GitHub issue with detailed information

## 📊 Project Stats

- **9 Microservices**: Production-ready, containerized
- **100+ API Integrations**: Universal connector platform
- **Enterprise Security**: JWT, 2FA, RBAC, audit logging
- **Full Observability**: Tracing, metrics, logging, health checks
- **Cloud Native**: Docker, Kubernetes ready
- **Production Ready**: CI/CD, monitoring, scaling

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Anthropic for Claude API
- The amazing open-source community
- All contributors and supporters

---

**Built with ❤️ by the DevSync Team**

Transform your ideas into reality with DevSync - From Requirement to Integration in Days!