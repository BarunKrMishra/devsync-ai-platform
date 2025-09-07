#!/bin/bash

# DevSync Frontend Deployment Script
# This script builds and deploys the frontend to your development server

echo "🚀 Starting DevSync Frontend Deployment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Build the frontend Docker image
echo "📦 Building frontend Docker image..."
docker build -t devsync-frontend:latest .

if [ $? -ne 0 ]; then
    echo "❌ Frontend build failed!"
    exit 1
fi

echo "✅ Frontend Docker image built successfully!"

# Tag for GitHub Container Registry (optional)
echo "🏷️  Tagging image for GitHub Container Registry..."
docker tag devsync-frontend:latest ghcr.io/yourusername/devsync-frontend:latest

echo "✅ Frontend deployment preparation complete!"
echo ""
echo "📋 Next steps:"
echo "1. Push to GitHub: git add . && git commit -m 'Deploy frontend updates' && git push"
echo "2. On your dev server, pull changes: git pull"
echo "3. Restart containers: docker-compose up -d --build frontend"
echo ""
echo "🌐 Your frontend will be available at: http://your-server:3000"
echo "📊 Grafana monitoring at: http://your-server:3015"
