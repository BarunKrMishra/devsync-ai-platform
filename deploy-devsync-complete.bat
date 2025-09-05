@echo off
REM DevSync Complete Platform Deployment Script for Windows
REM This script helps you deploy the complete DevSync platform to your development server

echo 🚀 DevSync Complete Platform Deployment
echo ======================================

REM Configuration
set SERVER_IP=10.0.0.153
set SERVER_USER=varun
set PROJECT_DIR=/home/varun/devsync-ai-platform
set GITHUB_REPO=https://github.com/BarunKrMishra/devsync-ai-platform.git

echo 📋 Deployment Configuration:
echo   Server: %SERVER_USER%@%SERVER_IP%
echo   Project Directory: %PROJECT_DIR%
echo   GitHub Repo: %GITHUB_REPO%
echo.

echo 🔍 Checking prerequisites...

REM Check if SSH is available
ssh -V >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ SSH is not available. Please install OpenSSH or use WSL.
    echo You can also run the commands manually on your server.
    pause
    exit /b 1
)

echo ✅ SSH check passed

echo 📥 Cloning/Updating repository...

REM Clone or update repository
ssh %SERVER_USER%@%SERVER_IP% "if [ -d '%PROJECT_DIR%' ]; then cd %PROJECT_DIR% && git pull origin main; else git clone %GITHUB_REPO% %PROJECT_DIR%; fi"

echo ✅ Repository updated

echo 🛑 Stopping existing services...

REM Stop existing services
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml down || true"

echo ✅ Existing services stopped

echo 🧹 Cleaning up Docker resources...

REM Clean up Docker resources
ssh %SERVER_USER%@%SERVER_IP% "docker system prune -f || true"
ssh %SERVER_USER%@%SERVER_IP% "docker volume prune -f || true"

echo ✅ Docker cleanup completed

echo 🏗️ Building and starting services...

echo Phase 1: Starting infrastructure services...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml up -d mysql redis prometheus jaeger grafana"

echo Waiting for infrastructure to be ready...
timeout /t 30 /nobreak >nul

echo Phase 2: Starting core microservices...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml up -d api-gateway auth-service ai-translator-service"

echo Waiting for core services to be ready...
timeout /t 30 /nobreak >nul

echo Phase 3: Starting remaining microservices...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml up -d api-connector-service codegen-service project-service notification-service storage-service monitoring-service"

echo Waiting for microservices to be ready...
timeout /t 30 /nobreak >nul

echo Phase 4: Starting frontend...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml up -d frontend"

echo ✅ All services started

echo 🔍 Checking service health...

REM Wait a bit for services to fully start
timeout /t 30 /nobreak >nul

echo Checking service status...
ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml ps"

echo.
echo 🎉 Deployment completed successfully!
echo.
echo 🌐 Access URLs:
echo   🎨 Frontend Landing: http://%SERVER_IP%:3012
echo   📊 Frontend Dashboard: http://%SERVER_IP%:3012/dashboard
echo   🔌 API Gateway: http://%SERVER_IP%:3009
echo   📈 Grafana: http://%SERVER_IP%:3010
echo   📊 Prometheus: http://%SERVER_IP%:9090
echo   🔍 Jaeger: http://%SERVER_IP%:16686
echo.
echo 🔧 Service Ports:
echo   Frontend: 3012
echo   API Gateway: 3009
echo   Auth Service: 3001
echo   AI Translator: 3002
echo   API Connector: 3003
echo   Code Generation: 3004
echo   Project Service: 3005
echo   Notification Service: 3006
echo   Storage Service: 3007
echo   Monitoring Service: 3008
echo   MySQL: 3306
echo   Redis: 6379
echo.
echo 🧪 Testing services...

echo Testing API Gateway...
ssh %SERVER_USER%@%SERVER_IP% "curl -f http://localhost:3009/health >/dev/null 2>&1 && echo ✅ API Gateway is healthy || echo ❌ API Gateway health check failed"

echo Testing Frontend...
ssh %SERVER_USER%@%SERVER_IP% "curl -f http://localhost:3012 >/dev/null 2>&1 && echo ✅ Frontend is accessible || echo ❌ Frontend is not accessible"

echo.
echo 🎯 Next Steps:
echo 1. Open http://%SERVER_IP%:3012 in your browser to access the landing page
echo 2. Click 'Start Free Trial' to access the dashboard
echo 3. Explore all features: Projects, ERD, APIs, Connectors, Monitor
echo 4. Test the microservices through the dashboard interface
echo 5. Access Grafana at http://%SERVER_IP%:3010 for detailed monitoring
echo.
echo 📊 Monitoring Commands:
echo   View logs: ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml logs -f"
echo   Check status: ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml ps"
echo   Restart services: ssh %SERVER_USER%@%SERVER_IP% "cd %PROJECT_DIR% && docker-compose -f docker-compose.mysql.yml restart"
echo.
echo 🚀 DevSync Platform is ready for testing!

pause
