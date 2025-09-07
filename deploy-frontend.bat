@echo off
REM DevSync Frontend Deployment Script for Windows
REM This script builds and deploys the frontend to your development server

echo 🚀 Starting DevSync Frontend Deployment...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd frontend

REM Build the frontend Docker image
echo 📦 Building frontend Docker image...
docker build -t devsync-frontend:latest .

if %errorlevel% neq 0 (
    echo ❌ Frontend build failed!
    pause
    exit /b 1
)

echo ✅ Frontend Docker image built successfully!

REM Tag for GitHub Container Registry (optional)
echo 🏷️  Tagging image for GitHub Container Registry...
docker tag devsync-frontend:latest ghcr.io/yourusername/devsync-frontend:latest

echo ✅ Frontend deployment preparation complete!
echo.
echo 📋 Next steps:
echo 1. Push to GitHub: git add . ^&^& git commit -m "Deploy frontend updates" ^&^& git push
echo 2. On your dev server, pull changes: git pull
echo 3. Restart containers: docker-compose up -d --build frontend
echo.
echo 🌐 Your frontend will be available at: http://your-server:3000
echo 📊 Grafana monitoring at: http://your-server:3015

pause
