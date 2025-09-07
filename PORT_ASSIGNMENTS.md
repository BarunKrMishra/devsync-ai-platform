# DevSync Port Assignments

## 🚀 **FIXED PORT CONFIGURATION - NO CONFLICTS**

### **🌐 External Access Ports (Accessible from outside Docker)**

| Service | External Port | Internal Port | URL | Description |
|---------|---------------|---------------|-----|-------------|
| **Frontend** | `3000` | `3000` | `http://your-server:3000` | Main application interface |
| **API Gateway** | `3009` | `3009` | `http://your-server:3009` | API endpoints |
| **Auth Service** | `3001` | `3001` | `http://your-server:3001` | Authentication service |
| **AI Translator** | `3002` | `3002` | `http://your-server:3002` | AI translation service |
| **API Connector** | `3003` | `3003` | `http://your-server:3003` | Universal API connector |
| **Code Generator** | `3004` | `3004` | `http://your-server:3004` | Code generation service |
| **Project Service** | `3005` | `3005` | `http://your-server:3005` | Project management |
| **Notification** | `3006` | `3006` | `http://your-server:3006` | Email/Slack notifications |
| **Storage Service** | `3007` | `3007` | `http://your-server:3007` | File storage service |
| **Monitoring** | `3008` | `3008` | `http://your-server:3008` | Health monitoring |
| **MySQL** | `3306` | `3306` | `mysql://your-server:3306` | Database |
| **Redis** | `6379` | `6379` | `redis://your-server:6379` | Cache & sessions |
| **Jaeger** | `16686` | `16686` | `http://your-server:16686` | Distributed tracing |
| **Prometheus** | `9090` | `9090` | `http://your-server:9090` | Metrics collection |
| **Grafana** | `3015` | `3015` | `http://your-server:3015` | Monitoring dashboard |

## ✅ **CONFLICTS RESOLVED**

### **Before (Problematic):**
- ❌ Frontend: `3000` (External) → `3000` (Internal)
- ❌ API Gateway: `3009` (External) → `3000` (Internal) (CONFLICT!)
- ❌ Grafana: `3015` (External) → `3000` (Internal) (CONFLICT!)

### **After (Fixed):**
- ✅ Frontend: `3000` (External) → `3000` (Internal)
- ✅ API Gateway: `3009` (External) → `3009` (Internal) (NO CONFLICT!)
- ✅ Grafana: `3015` (External) → `3015` (Internal) (NO CONFLICT!)

## 🔧 **Configuration Changes Made**

### **1. Docker Compose Updates**
```yaml
# API Gateway - Fixed internal port conflict
api-gateway:
  ports:
    - "3009:3009"  # External:Internal (NO CONFLICT!)

# Frontend - Kept at 3000
frontend:
  ports:
    - "3000:3000"  # External:Internal

# Grafana - Fixed internal port conflict
grafana:
  ports:
    - "3015:3015"  # External:Internal (NO CONFLICT!)
  environment:
    GF_SERVER_HTTP_PORT: 3015
```

### **2. Frontend Configuration Updates**
```javascript
// API client now points to port 3009
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3009';

// Next.js config updated
NEXT_PUBLIC_API_URL: 'http://localhost:3009'
```

### **3. Environment Variables Updated**
```yaml
# Frontend environment
NEXT_PUBLIC_API_URL: http://localhost:3009
NEXT_PUBLIC_AUTH_URL: http://localhost:3001
NEXT_PUBLIC_AI_TRANSLATOR_URL: http://localhost:3002
```

## 🌐 **Access Points**

### **For End Users:**
- **Main Application**: `http://your-server:3000`
- **API Endpoints**: `http://your-server:3009/api/*`

### **For Developers/Admins:**
- **Grafana Monitoring**: `http://your-server:3015` (admin/admin)
- **Jaeger Tracing**: `http://your-server:16686`
- **Prometheus Metrics**: `http://your-server:9090`

### **For Database Access:**
- **MySQL**: `your-server:3306` (devsync/devsync_password)
- **Redis**: `your-server:6379`

## 🔄 **Internal Container Communication**

Inside Docker network, services communicate using container names:
- `http://api-gateway:3009` (internal)
- `http://auth-service:3001` (internal)
- `http://ai-translator-service:3002` (internal)
- `http://mysql:3306` (internal)
- `http://redis:6379` (internal)

## ✅ **Verification Commands**

```bash
# Check all services are running
docker-compose ps

# Test frontend
curl http://localhost:3000

# Test API Gateway
curl http://localhost:3009/health

# Test individual services
curl http://localhost:3001/health  # Auth
curl http://localhost:3002/health  # AI Translator
curl http://localhost:3003/health  # API Connector
```

## 🎯 **Key Benefits of This Configuration**

1. **No Port Conflicts**: Each service has a unique external port
2. **Clear Separation**: Frontend (3000) and API (3009) are distinct
3. **Easy Access**: Simple URLs for each service
4. **Scalable**: Easy to add more services without conflicts
5. **Production Ready**: Follows best practices for port management

## 🚀 **Ready for Deployment!**

All port conflicts have been resolved. Your DevSync application will deploy without any port issues!

**Main Access**: `http://your-server:3000`
**API Access**: `http://your-server:3009`
