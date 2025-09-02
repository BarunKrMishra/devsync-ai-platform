# DevSync Setup Guide

This guide will help you set up DevSync for development, testing, and production deployment.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Development Setup](#development-setup)
3. [Production Setup](#production-setup)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [AI Services Setup](#ai-services-setup)
7. [Monitoring Setup](#monitoring-setup)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js:** 18.0.0 or higher
- **npm:** 8.0.0 or higher
- **Docker:** 20.10.0 or higher
- **Docker Compose:** 2.0.0 or higher
- **Git:** 2.30.0 or higher

### Hardware Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 10GB free space

**Recommended:**
- CPU: 4+ cores
- RAM: 8GB+
- Storage: 20GB+ free space

### Required Accounts

- **OpenAI Account:** For GPT-4 API access
- **Anthropic Account:** For Claude API access
- **GitHub Account:** For OAuth integration (optional)
- **Google Account:** For OAuth integration (optional)

## Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/devsync.git
cd devsync
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Environment Configuration

Create environment files:

```bash
# Copy example environment file
cp env.example .env

# Edit the environment file
nano .env
```

**Required Environment Variables:**

```bash
# Database Configuration
DATABASE_URL=postgresql://devsync:devsync_password@localhost:5432/devsync
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=devsync_password
MONGODB_URI=mongodb://devsync:devsync_password@localhost:27017/devsync?authSource=admin
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d

# AI Services
OPENAI_API_KEY=sk-your-openai-api-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-api-key

# Application URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Monitoring
JAEGER_ENDPOINT=http://localhost:14268/api/traces
PROMETHEUS_PORT=9464

# Secrets Encryption
SECRETS_ENCRYPTION_KEY=your-32-character-encryption-key
```

### 4. Start Development Environment

**Option A: Using Docker Compose (Recommended)**

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Option B: Manual Setup**

```bash
# Terminal 1: Start databases
docker-compose up postgres neo4j mongodb redis prometheus grafana jaeger

# Terminal 2: Start backend
cd backend
npm run dev

# Terminal 3: Start frontend
cd frontend
npm run dev
```

### 5. Database Setup

```bash
# Run database migrations
cd backend
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Seed database (optional)
npm run db:seed
```

### 6. Verify Installation

1. **Frontend:** http://localhost:3000
2. **Backend API:** http://localhost:8000/health
3. **Grafana:** http://localhost:3001 (admin/admin)
4. **Jaeger:** http://localhost:16686
5. **Prometheus:** http://localhost:9090

## Production Setup

### 1. Server Preparation

**Ubuntu/Debian:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**CentOS/RHEL:**

```bash
# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# Install Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install -y docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/your-org/devsync.git
cd devsync

# Create production environment
cp env.example .env.production

# Edit production environment
nano .env.production
```

**Production Environment Variables:**

```bash
NODE_ENV=production
DATABASE_URL=postgresql://prod_user:secure_password@prod_host:5432/devsync
NEO4J_URI=bolt://prod_neo4j_host:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=secure_neo4j_password
MONGODB_URI=mongodb://prod_user:secure_password@prod_mongo_host:27017/devsync?authSource=admin
REDIS_URL=redis://prod_redis_host:6379

# Use strong, unique secrets
JWT_SECRET=your-production-jwt-secret-256-bits
JWT_REFRESH_SECRET=your-production-refresh-secret-256-bits

# Production AI API keys
OPENAI_API_KEY=sk-your-production-openai-key
ANTHROPIC_API_KEY=sk-ant-your-production-anthropic-key

# Production URLs
FRONTEND_URL=https://app.devsync.com
BACKEND_URL=https://api.devsync.com

# SSL/TLS Configuration
SSL_CERT_PATH=/path/to/ssl/cert.pem
SSL_KEY_PATH=/path/to/ssl/private.key

# Monitoring
JAEGER_ENDPOINT=https://jaeger.devsync.com/api/traces
PROMETHEUS_PORT=9464

# Secrets Encryption
SECRETS_ENCRYPTION_KEY=your-production-32-char-encryption-key
```

### 3. Build and Deploy

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd ../backend
npm run build

# Run database migrations
npx prisma migrate deploy

# Start production services
docker-compose -f docker-compose.prod.yml up -d
```

### 4. SSL/TLS Setup

**Using Let's Encrypt:**

```bash
# Install Certbot
sudo apt install certbot

# Generate SSL certificate
sudo certbot certonly --standalone -d api.devsync.com
sudo certbot certonly --standalone -d app.devsync.com

# Update environment variables
SSL_CERT_PATH=/etc/letsencrypt/live/api.devsync.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/api.devsync.com/privkey.pem
```

**Using Custom Certificates:**

```bash
# Copy certificates to server
scp cert.pem user@server:/path/to/ssl/
scp private.key user@server:/path/to/ssl/

# Set proper permissions
sudo chmod 600 /path/to/ssl/private.key
sudo chmod 644 /path/to/ssl/cert.pem
```

### 5. Reverse Proxy Setup

**Nginx Configuration:**

```nginx
# /etc/nginx/sites-available/devsync
server {
    listen 80;
    server_name api.devsync.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.devsync.com;

    ssl_certificate /etc/letsencrypt/live/api.devsync.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.devsync.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/devsync /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Configuration

### Database Configuration

#### PostgreSQL

```bash
# Create production database
sudo -u postgres createdb devsync

# Create user
sudo -u postgres createuser devsync

# Set password
sudo -u postgres psql -c "ALTER USER devsync PASSWORD 'secure_password';"

# Grant privileges
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE devsync TO devsync;"
```

#### Neo4j

```bash
# Update Neo4j configuration
sudo nano /etc/neo4j/neo4j.conf

# Key settings:
dbms.security.auth_enabled=true
dbms.default_database=devsync
dbms.memory.heap.initial_size=1G
dbms.memory.heap.max_size=2G
```

#### MongoDB

```bash
# Create MongoDB user
mongo admin --eval "db.createUser({user: 'devsync', pwd: 'secure_password', roles: [{role: 'readWrite', db: 'devsync'}]})"
```

#### Redis

```bash
# Configure Redis
sudo nano /etc/redis/redis.conf

# Key settings:
requirepass secure_redis_password
maxmemory 1gb
maxmemory-policy allkeys-lru
```

### AI Services Configuration

#### OpenAI Setup

1. **Create OpenAI Account:** https://platform.openai.com
2. **Generate API Key:** Go to API Keys section
3. **Set Usage Limits:** Configure billing and usage limits
4. **Add to Environment:** Set `OPENAI_API_KEY` in `.env`

#### Anthropic Setup

1. **Create Anthropic Account:** https://console.anthropic.com
2. **Generate API Key:** Go to API Keys section
3. **Set Usage Limits:** Configure billing and usage limits
4. **Add to Environment:** Set `ANTHROPIC_API_KEY` in `.env`

### OAuth Providers Setup

#### Google OAuth

1. **Go to Google Cloud Console:** https://console.cloud.google.com
2. **Create Project:** Create new project or select existing
3. **Enable APIs:** Enable Google+ API
4. **Create Credentials:** Create OAuth 2.0 client ID
5. **Configure Redirect URIs:** Add your callback URLs
6. **Add to Environment:**
   ```bash
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=https://api.devsync.com/auth/google/callback
   ```

#### GitHub OAuth

1. **Go to GitHub Settings:** https://github.com/settings/developers
2. **Create OAuth App:** Click "New OAuth App"
3. **Configure App:** Set name, homepage URL, callback URL
4. **Add to Environment:**
   ```bash
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   GITHUB_CALLBACK_URL=https://api.devsync.com/auth/github/callback
   ```

### SAML Configuration

#### Azure AD Setup

1. **Go to Azure Portal:** https://portal.azure.com
2. **Create Enterprise Application:** Add new SAML application
3. **Configure SAML:** Set entity ID, reply URL, sign-on URL
4. **Download Certificate:** Download the SAML signing certificate
5. **Add to Environment:**
   ```bash
   SAML_ENTRY_POINT=https://login.microsoftonline.com/tenant-id/saml2
   SAML_ISSUER=devsync
   SAML_CERT=-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----
   SAML_CALLBACK_URL=https://api.devsync.com/auth/saml/callback
   ```

## Monitoring Setup

### Prometheus Configuration

```yaml
# docker/prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "rules/*.yml"

scrape_configs:
  - job_name: 'devsync-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    scrape_interval: 5s

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

  - job_name: 'neo4j'
    static_configs:
      - targets: ['neo4j:7474']

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

### Grafana Dashboard Setup

1. **Access Grafana:** http://localhost:3001
2. **Login:** admin/admin
3. **Add Data Source:** Add Prometheus data source
4. **Import Dashboard:** Import DevSync dashboard JSON
5. **Configure Alerts:** Set up alerting rules

### Alerting Rules

```yaml
# docker/prometheus/rules/devsync.yml
groups:
  - name: devsync
    rules:
      - alert: HighErrorRate
        expr: rate(errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseConnectionFailed
        expr: up{job="postgres"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failed"
          description: "PostgreSQL database is not responding"
```

## Troubleshooting

### Common Issues

#### Database Connection Issues

**Problem:** Cannot connect to PostgreSQL
```bash
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. Check if PostgreSQL is running: `docker ps | grep postgres`
2. Verify connection string in `.env`
3. Check firewall settings
4. Restart database: `docker-compose restart postgres`

#### AI API Issues

**Problem:** OpenAI API requests failing
```bash
Error: Invalid API key
```

**Solutions:**
1. Verify API key in `.env` file
2. Check API key permissions and billing
3. Ensure rate limits are not exceeded
4. Test API key with curl:
   ```bash
   curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
   ```

#### Frontend Build Issues

**Problem:** Next.js build failing
```bash
Error: Module not found
```

**Solutions:**
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check import paths and file extensions
4. Verify TypeScript configuration

#### Memory Issues

**Problem:** Out of memory errors
```bash
Error: JavaScript heap out of memory
```

**Solutions:**
1. Increase Node.js heap size:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```
2. Use clustering for multiple processes
3. Implement memory leak detection
4. Monitor memory usage with Grafana

### Performance Optimization

#### Database Optimization

1. **Add Indexes:**
   ```sql
   CREATE INDEX idx_users_email ON users(email);
   CREATE INDEX idx_projects_user_id ON projects(user_id);
   ```

2. **Connection Pooling:**
   ```typescript
   // backend/src/config/database.ts
   const prisma = new PrismaClient({
     datasources: {
       db: {
         url: process.env.DATABASE_URL,
       },
     },
     log: ['query', 'info', 'warn', 'error'],
   });
   ```

3. **Query Optimization:**
   - Use `select` to limit fields
   - Implement pagination
   - Use database views for complex queries

#### API Optimization

1. **Implement Caching:**
   ```typescript
   // Use Redis for caching
   const cacheKey = `user:${userId}`;
   const cached = await redis.get(cacheKey);
   if (cached) return JSON.parse(cached);
   ```

2. **Rate Limiting:**
   ```typescript
   // Implement rate limiting
   const limiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

3. **Response Compression:**
   ```typescript
   // Enable gzip compression
   app.use(compression());
   ```

### Security Hardening

#### Environment Security

1. **Secure Environment Variables:**
   ```bash
   # Use strong, unique secrets
   JWT_SECRET=$(openssl rand -base64 32)
   SECRETS_ENCRYPTION_KEY=$(openssl rand -base64 32)
   ```

2. **File Permissions:**
   ```bash
   # Secure environment file
   chmod 600 .env
   chown root:root .env
   ```

3. **Database Security:**
   ```bash
   # Use strong passwords
   # Enable SSL connections
   # Restrict network access
   ```

#### Application Security

1. **Input Validation:**
   ```typescript
   // Validate all inputs
   const schema = Joi.object({
     email: Joi.string().email().required(),
     password: Joi.string().min(8).required()
   });
   ```

2. **SQL Injection Prevention:**
   ```typescript
   // Use parameterized queries
   const user = await prisma.user.findUnique({
     where: { email: userEmail }
   });
   ```

3. **XSS Protection:**
   ```typescript
   // Sanitize user inputs
   const sanitized = DOMPurify.sanitize(userInput);
   ```

### Backup and Recovery

#### Database Backups

```bash
# PostgreSQL backup
pg_dump -h localhost -U devsync devsync > backup_$(date +%Y%m%d_%H%M%S).sql

# MongoDB backup
mongodump --host localhost:27017 --db devsync --out backup_$(date +%Y%m%d_%H%M%S)

# Neo4j backup
neo4j-admin dump --database=devsync --to=backup_$(date +%Y%m%d_%H%M%S).dump
```

#### Automated Backups

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create backup directory
mkdir -p $BACKUP_DIR

# PostgreSQL backup
pg_dump -h localhost -U devsync devsync > $BACKUP_DIR/postgres_$DATE.sql

# MongoDB backup
mongodump --host localhost:27017 --db devsync --out $BACKUP_DIR/mongodb_$DATE

# Neo4j backup
neo4j-admin dump --database=devsync --to=$BACKUP_DIR/neo4j_$DATE.dump

# Compress backups
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*_$DATE*

# Clean old backups (keep 30 days)
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete
```

```bash
# Add to crontab for daily backups
0 2 * * * /path/to/backup.sh
```

### Getting Help

1. **Check Logs:**
   ```bash
   # Application logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   
   # System logs
   journalctl -u devsync -f
   ```

2. **Monitor Resources:**
   ```bash
   # System resources
   htop
   df -h
   free -h
   
   # Docker resources
   docker stats
   ```

3. **Test Connectivity:**
   ```bash
   # Test database connections
   psql -h localhost -U devsync -d devsync -c "SELECT 1;"
   redis-cli ping
   curl http://localhost:8000/health
   ```

4. **Community Support:**
   - GitHub Issues: https://github.com/your-org/devsync/issues
   - Discord: https://discord.gg/devsync
   - Documentation: https://docs.devsync.com
