@echo off
setlocal enabledelayedexpansion

echo 🚀 DevSync Setup Script (Windows)
echo ==================================

REM Check if Docker is installed
echo [SETUP] Checking Docker installation...
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

echo [INFO] Docker and Docker Compose are installed

REM Check if Node.js is installed
echo [SETUP] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo [INFO] Node.js is installed

REM Create environment file
echo [SETUP] Creating environment file...
if not exist .env (
    copy env.example .env
    echo [INFO] Created .env file from template
    echo [WARNING] Please update .env file with your API keys and configuration
) else (
    echo [INFO] .env file already exists
)

REM Install dependencies
echo [SETUP] Installing dependencies...

echo [INFO] Installing root dependencies...
call npm install

echo [INFO] Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo [INFO] Installing backend dependencies...
cd backend
call npm install
cd ..

echo [INFO] All dependencies installed successfully

REM Setup databases
echo [SETUP] Setting up databases...

echo [INFO] Starting database services...
docker-compose up -d postgres neo4j mongodb redis

echo [INFO] Waiting for databases to be ready...
timeout /t 10 /nobreak >nul

echo [INFO] Running database migrations...
cd backend
call npx prisma migrate dev --name init
call npx prisma generate
cd ..

echo [INFO] Databases setup completed

REM Build applications
echo [SETUP] Building applications...

echo [INFO] Building backend...
cd backend
call npm run build
cd ..

echo [INFO] Building frontend...
cd frontend
call npm run build
cd ..

echo [INFO] Applications built successfully

REM Start all services
echo [SETUP] Starting all services...

docker-compose up -d

echo [INFO] All services started
echo [INFO] Services are starting up, this may take a few minutes...

echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Display service URLs
echo [SETUP] Service URLs
echo ==================================
echo Frontend:        http://localhost:3000
echo Backend API:     http://localhost:8000
echo API Docs:        http://localhost:8000/api-docs
echo Prometheus:      http://localhost:9090
echo Grafana:         http://localhost:3001 (admin/admin)
echo Jaeger:          http://localhost:16686
echo Neo4j Browser:   http://localhost:7474 (neo4j/devsync_password)
echo ==================================

echo [INFO] DevSync setup completed successfully! 🎉
echo [WARNING] Don't forget to:
echo   1. Update .env file with your API keys
echo   2. Restart services if you updated environment variables
echo   3. Check the logs if any service is not working: docker-compose logs [service-name]

pause
