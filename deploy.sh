#!/bin/bash

# DevSync Microservices Deployment Script
# Usage: ./deploy.sh [development|production]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if environment is provided
if [ $# -eq 0 ]; then
    print_error "Please specify environment: development or production"
    echo "Usage: ./deploy.sh [development|production]"
    exit 1
fi

ENVIRONMENT=$1

if [ "$ENVIRONMENT" != "development" ] && [ "$ENVIRONMENT" != "production" ]; then
    print_error "Invalid environment. Use 'development' or 'production'"
    exit 1
fi

print_status "Starting DevSync deployment for $ENVIRONMENT environment..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create environment file
if [ "$ENVIRONMENT" = "production" ]; then
    if [ ! -f .env ]; then
        print_warning "Creating .env file from env.production template..."
        cp env.production .env
        print_warning "Please update .env file with your actual configuration values!"
        print_warning "Especially update:"
        print_warning "  - OPENAI_API_KEY"
        print_warning "  - ANTHROPIC_API_KEY"
        print_warning "  - JWT_SECRET"
        print_warning "  - SMTP credentials"
        print_warning "  - AWS credentials"
        read -p "Press Enter after updating .env file..."
    fi
else
    if [ ! -f .env ]; then
        print_warning "Creating .env file from env.example template..."
        cp env.example .env
    fi
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down --remove-orphans

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose pull

# Build and start services
print_status "Building and starting services..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose up -d --build
else
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d --build
fi

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check service health
print_status "Checking service health..."

# Function to check service health
check_service() {
    local service_name=$1
    local port=$2
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s http://localhost:$port/health > /dev/null 2>&1; then
            print_success "$service_name is healthy"
            return 0
        fi
        
        print_status "Waiting for $service_name... (attempt $attempt/$max_attempts)"
        sleep 2
        attempt=$((attempt + 1))
    done
    
    print_error "$service_name failed to start properly"
    return 1
}

# Check all services
services=(
    "API Gateway:3000"
    "Auth Service:3001"
    "AI Translator Service:3002"
    "API Connector Service:3003"
    "Code Generation Service:3004"
    "Project Service:3005"
    "Notification Service:3006"
    "Storage Service:3007"
    "Monitoring Service:3008"
)

all_healthy=true
for service in "${services[@]}"; do
    IFS=':' read -r name port <<< "$service"
    if ! check_service "$name" "$port"; then
        all_healthy=false
    fi
done

# Display service URLs
print_success "Deployment completed!"
echo ""
print_status "Service URLs:"
echo "  🌐 API Gateway: http://10.0.0.199:3000"
echo "  🔐 Auth Service: http://10.0.0.199:3001"
echo "  🤖 AI Translator: http://10.0.0.199:3002"
echo "  🔗 API Connector: http://10.0.0.199:3003"
echo "  ⚡ Code Generation: http://10.0.0.199:3004"
echo "  📁 Project Service: http://10.0.0.199:3005"
echo "  🔔 Notification: http://10.0.0.199:3006"
echo "  💾 Storage Service: http://10.0.0.199:3007"
echo "  📊 Monitoring: http://10.0.0.199:3008"
echo ""
print_status "Monitoring URLs:"
echo "  📈 Grafana: http://10.0.0.199:3000 (if not conflicting with API Gateway)"
echo "  🔍 Jaeger: http://10.0.0.199:16686"
echo "  📊 Prometheus: http://10.0.0.199:9090"
echo ""

if [ "$all_healthy" = true ]; then
    print_success "All services are healthy and running!"
    print_success "DevSync platform is ready for use! 🚀"
else
    print_warning "Some services may not be fully ready yet."
    print_status "Check logs with: docker-compose logs -f"
fi

echo ""
print_status "Useful commands:"
echo "  📋 View logs: docker-compose logs -f"
echo "  🔄 Restart: docker-compose restart"
echo "  🛑 Stop: docker-compose down"
echo "  📊 Status: docker-compose ps"
echo ""
