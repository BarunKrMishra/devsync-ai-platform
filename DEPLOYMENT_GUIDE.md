# 🚀 DevSync Deployment Guide

## Ubuntu Server Deployment (10.0.0.199)

This guide will help you deploy the DevSync microservices platform on your Ubuntu server, starting with development and moving to production.

## 📋 Prerequisites

- Ubuntu Server (10.0.0.199)
- SSH access to the server
- Internet connection
- Domain name (optional, for production)

## 🔧 Step 1: Server Preparation

### Connect to your server:
```bash
ssh root@10.0.0.199
# or
ssh username@10.0.0.199
```

### Update the system:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git vim htop ufw
```

### Install Docker:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

## 📥 Step 2: Clone Repository

```bash
# Clone the repository
git clone https://github.com/BarunKrMishra/devsync-ai-platform.git
cd devsync-ai-platform

# Make deployment script executable
chmod +x deploy.sh
```

## 🛠️ Step 3: Development Deployment

### Configure environment:
```bash
# Copy environment template
cp env.example .env

# Edit the environment file
nano .env
```

### Key environment variables to update:
```bash
# Update these in .env file:
NODE_ENV=development
FRONTEND_URL=http://10.0.0.199:3000

# Add your API keys:
OPENAI_API_KEY=your_openai_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Generate secure JWT secrets:
JWT_SECRET=your_super_secure_jwt_secret_here_minimum_32_characters
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_here_minimum_32_characters
```

### Deploy in development mode:
```bash
# Run development deployment
./deploy.sh development
```

### Verify deployment:
```bash
# Check all services are running
docker-compose ps

# Check logs
docker-compose logs -f

# Test API Gateway
curl http://10.0.0.199:3000/health
```

## 🌐 Step 4: Access Development Services

Once deployed, you can access:

- **API Gateway**: http://10.0.0.199:3000
- **Auth Service**: http://10.0.0.199:3001
- **AI Translator**: http://10.0.0.199:3002
- **API Connector**: http://10.0.0.199:3003
- **Code Generation**: http://10.0.0.199:3004
- **Project Service**: http://10.0.0.199:3005
- **Notification**: http://10.0.0.199:3006
- **Storage Service**: http://10.0.0.199:3007
- **Monitoring**: http://10.0.0.199:3008

### Monitoring URLs:
- **Grafana**: http://10.0.0.199:3000 (if not conflicting)
- **Jaeger**: http://10.0.0.199:16686
- **Prometheus**: http://10.0.0.199:9090

## 🚀 Step 5: Production Deployment

### Configure production environment:
```bash
# Copy production environment template
cp env.production .env

# Edit with production values
nano .env
```

### Essential production configurations:
```bash
NODE_ENV=production
FRONTEND_URL=https://your-domain.com

# Database (use strong passwords)
DATABASE_URL=postgresql://devsync_user:STRONG_PASSWORD@postgres:5432/devsync_db

# JWT secrets (generate strong ones)
JWT_SECRET=your_production_jwt_secret_here
JWT_REFRESH_SECRET=your_production_refresh_secret_here

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_production_email@gmail.com
SMTP_PASS=your_app_password

# AWS credentials (for file storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=your_production_bucket
```

### Deploy to production:
```bash
# Run production deployment
./deploy.sh production
```

## 🔒 Step 6: Security Configuration

### Configure firewall:
```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP and HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Allow DevSync ports (if needed for direct access)
sudo ufw allow 3000:3008/tcp

# Check status
sudo ufw status
```

### SSL/TLS Setup (for production):
```bash
# Install Certbot
sudo apt install -y certbot

# Get SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com

# Configure automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Step 7: Monitoring and Maintenance

### Useful commands:
```bash
# View all services
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Restart services
docker-compose restart [service-name]

# Update services
git pull
docker-compose pull
docker-compose up -d --build

# Backup database
docker-compose exec postgres pg_dump -U devsync_user devsync_db > backup.sql

# Restore database
docker-compose exec -T postgres psql -U devsync_user devsync_db < backup.sql
```

### Health checks:
```bash
# Check all service health
curl http://10.0.0.199:3000/health
curl http://10.0.0.199:3001/health
curl http://10.0.0.199:3002/health
# ... and so on for all services
```

## 🔧 Troubleshooting

### Common issues:

1. **Port conflicts**:
   ```bash
   # Check what's using a port
   sudo netstat -tulpn | grep :3000
   
   # Kill process using port
   sudo kill -9 PID
   ```

2. **Docker issues**:
   ```bash
   # Restart Docker
   sudo systemctl restart docker
   
   # Clean up Docker
   docker system prune -a
   ```

3. **Service not starting**:
   ```bash
   # Check logs
   docker-compose logs [service-name]
   
   # Check environment variables
   docker-compose config
   ```

4. **Database connection issues**:
   ```bash
   # Check PostgreSQL logs
   docker-compose logs postgres
   
   # Connect to database
   docker-compose exec postgres psql -U devsync_user -d devsync_db
   ```

## 📈 Performance Optimization

### For production:

1. **Resource limits**:
   ```yaml
   # Add to docker-compose.yml
   deploy:
     resources:
       limits:
         memory: 512M
         cpus: '0.5'
   ```

2. **Database optimization**:
   ```bash
   # Tune PostgreSQL
   docker-compose exec postgres psql -U devsync_user -d devsync_db -c "
   ALTER SYSTEM SET shared_buffers = '256MB';
   ALTER SYSTEM SET effective_cache_size = '1GB';
   ALTER SYSTEM SET maintenance_work_mem = '64MB';
   SELECT pg_reload_conf();
   "
   ```

3. **Enable logging**:
   ```bash
   # Configure log rotation
   sudo nano /etc/logrotate.d/docker
   ```

## 🎯 Next Steps

1. **Set up CI/CD**: Configure GitHub Actions for automated deployment
2. **Load balancing**: Use Nginx or HAProxy for production
3. **Monitoring**: Set up alerts in Grafana
4. **Backup strategy**: Implement automated database backups
5. **Scaling**: Configure horizontal scaling for high-traffic scenarios

## 📞 Support

If you encounter any issues:

1. Check the logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Check service health: `curl http://10.0.0.199:3000/health`
4. Review this guide for troubleshooting steps

---

**🎉 Congratulations! Your DevSync platform is now deployed and ready to transform requirements into applications!**
