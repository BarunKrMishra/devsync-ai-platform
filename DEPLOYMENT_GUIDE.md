# DevSync Deployment Guide

## 🚀 Complete Deployment Instructions

This guide covers deploying DevSync to your development server using Docker and GitHub.

## 📋 Prerequisites

- Docker and Docker Compose installed
- Git configured
- GitHub repository set up
- Development server with Docker access

## 🔧 Configuration Changes Made

### 1. **Port Configuration Fixed**
- **Frontend**: Now accessible at `http://your-server:3000`
- **API Gateway**: Internal port 3009, external port 3009
- **Grafana**: Moved to port 3015 to avoid conflicts
- **All other services**: Maintained original ports

### 2. **Docker Configuration Enhanced**
- **Frontend Dockerfile**: Optimized for Next.js production
- **Multi-stage build**: Reduced image size
- **Security**: Non-root user execution
- **Health checks**: Added for all services

### 3. **Environment Variables**
- **Frontend**: Properly configured for container networking
- **API URLs**: Updated to use container names
- **CORS**: Configured for production deployment

## 🚀 Deployment Steps

### **Step 1: Local Development**
```bash
# Test locally first
cd frontend
npm install
npm run dev
```

### **Step 2: Build and Test Docker**
```bash
# Build frontend image
docker build -t devsync-frontend:latest ./frontend

# Test the build
docker run -p 3000:3000 devsync-frontend:latest
```

### **Step 3: Deploy to GitHub**
```bash
# Add all changes
git add .

# Commit changes
git commit -m "Deploy enhanced frontend with Docker fixes"

# Push to GitHub
git push origin main
```

### **Step 4: Deploy to Development Server**
```bash
# On your development server
git pull origin main

# Start all services
docker-compose up -d --build

# Check status
docker-compose ps
```

## 🌐 Service URLs

After deployment, your services will be available at:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://your-server:3000` | Main application |
| **API Gateway** | `http://your-server:3009` | API endpoints |
| **Grafana** | `http://your-server:3015` | Monitoring dashboard |
| **Jaeger** | `http://your-server:16686` | Distributed tracing |
| **Prometheus** | `http://your-server:9090` | Metrics collection |

## 🔍 Verification Steps

### **1. Check Container Status**
```bash
docker-compose ps
```
All services should show "Up" status.

### **2. Test Frontend**
- Visit `http://your-server:3000`
- Verify all buttons work
- Test project creation
- Test AI translator

### **3. Test API Integration**
```bash
# Test API Gateway
curl http://your-server:3009/health

# Test individual services
curl http://your-server:3009/api/projects
```

### **4. Check Logs**
```bash
# View all logs
docker-compose logs

# View specific service logs
docker-compose logs frontend
docker-compose logs api-gateway
```

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. Port Conflicts**
```bash
# Check what's using port 3000
netstat -tulpn | grep :3000

# Kill process if needed
sudo kill -9 <PID>
```

#### **2. Container Won't Start**
```bash
# Check logs
docker-compose logs <service-name>

# Rebuild specific service
docker-compose up -d --build <service-name>
```

#### **3. Frontend Not Loading**
```bash
# Check if frontend container is running
docker ps | grep frontend

# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend
```

#### **4. API Connection Issues**
```bash
# Check if API Gateway is running
docker-compose logs api-gateway

# Test internal connectivity
docker exec -it devsync-frontend curl http://api-gateway:3009/health
```

## 🔄 Update Process

### **For Future Updates**
```bash
# 1. Make changes locally
# 2. Test locally
npm run dev

# 3. Build and test Docker
docker build -t devsync-frontend:latest ./frontend

# 4. Push to GitHub
git add .
git commit -m "Update frontend features"
git push

# 5. Deploy to server
# On your development server:
git pull
docker-compose up -d --build frontend
```

## 📊 Monitoring

### **Health Checks**
All services have health checks configured:
- **Frontend**: `http://localhost:3000`
- **API Gateway**: `http://localhost:3009/health`
- **All Microservices**: Individual health endpoints

### **Monitoring Stack**
- **Grafana**: `http://your-server:3015` (admin/admin)
- **Prometheus**: `http://your-server:9090`
- **Jaeger**: `http://your-server:16686`

## ✅ Deployment Checklist

- [ ] All containers are running (`docker-compose ps`)
- [ ] Frontend loads at `http://your-server:3000`
- [ ] All buttons and forms work
- [ ] API calls are successful
- [ ] No error logs in containers
- [ ] Health checks pass
- [ ] Monitoring dashboards accessible

## 🎉 Success!

Your DevSync application is now fully deployed and ready for use!

**Frontend URL**: `http://your-server:3000`
**Features Available**:
- ✅ Project Management
- ✅ AI Requirement Translator
- ✅ API Connector Management
- ✅ Real-time Monitoring
- ✅ Full CRUD Operations

## 📞 Support

If you encounter any issues:
1. Check the logs: `docker-compose logs`
2. Verify container status: `docker-compose ps`
3. Test individual services
4. Check network connectivity

---

**DevSync Team** - From Requirement to Integration in Days! 🚀