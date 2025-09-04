#!/bin/bash

# DevSync Complete Platform Deployment Script
# This script deploys both frontend and backend to your development server

set -e

echo "🚀 DevSync Complete Platform Deployment"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_IP="10.0.0.153"
SERVER_USER="varun"
PROJECT_DIR="/home/varun/devsync-ai-platform"
GITHUB_REPO="https://github.com/BarunKrMishra/devsync-ai-platform.git"

echo -e "${BLUE}📋 Deployment Configuration:${NC}"
echo "  Server: $SERVER_USER@$SERVER_IP"
echo "  Project Directory: $PROJECT_DIR"
echo "  GitHub Repo: $GITHUB_REPO"
echo ""

# Function to run commands on remote server
run_remote() {
    ssh $SERVER_USER@$SERVER_IP "$1"
}

# Function to check if command exists
command_exists() {
    run_remote "command -v $1 >/dev/null 2>&1"
}

echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

# Check if Docker is installed
if ! command_exists docker; then
    echo -e "${RED}❌ Docker is not installed on the server${NC}"
    echo "Please install Docker first:"
    echo "  sudo yum install -y docker-ce docker-ce-cli containerd.io"
    echo "  sudo systemctl start docker"
    echo "  sudo systemctl enable docker"
    exit 1
fi

# Check if Docker Compose is installed
if ! command_exists docker-compose; then
    echo -e "${RED}❌ Docker Compose is not installed on the server${NC}"
    echo "Please install Docker Compose first:"
    echo "  sudo curl -L \"https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "  sudo chmod +x /usr/local/bin/docker-compose"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

echo -e "${YELLOW}📥 Cloning/Updating repository...${NC}"

# Clone or update repository
if run_remote "[ -d '$PROJECT_DIR' ]"; then
    echo "Repository exists, updating..."
    run_remote "cd $PROJECT_DIR && git pull origin main"
else
    echo "Cloning repository..."
    run_remote "git clone $GITHUB_REPO $PROJECT_DIR"
fi

echo -e "${GREEN}✅ Repository updated${NC}"

echo -e "${YELLOW}🛑 Stopping existing services...${NC}"

# Stop existing services
run_remote "cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml down || true"

echo -e "${GREEN}✅ Existing services stopped${NC}"

echo -e "${YELLOW}🧹 Cleaning up Docker resources...${NC}"

# Clean up Docker resources
run_remote "docker system prune -f || true"
run_remote "docker volume prune -f || true"

echo -e "${GREEN}✅ Docker cleanup completed${NC}"

echo -e "${YELLOW}🏗️ Building and starting services...${NC}"

# Build and start services in phases to manage resources
echo "Phase 1: Starting infrastructure services..."
run_remote "cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml up -d mysql redis prometheus jaeger grafana"

echo "Waiting for infrastructure to be ready..."
sleep 30

echo "Phase 2: Starting core microservices..."
run_remote "cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml up -d api-gateway auth-service ai-translator-service"

echo "Waiting for core services to be ready..."
sleep 30

echo "Phase 3: Starting remaining microservices..."
run_remote "cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml up -d api-connector-service codegen-service project-service notification-service storage-service monitoring-service"

echo "Waiting for microservices to be ready..."
sleep 30

echo "Phase 4: Starting frontend..."
run_remote "cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml up -d frontend"

echo -e "${GREEN}✅ All services started${NC}"

echo -e "${YELLOW}🔍 Checking service health...${NC}"

# Wait a bit for services to fully start
sleep 30

# Check service health
echo "Checking service status..."
run_remote "cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml ps"

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo "  Frontend Dashboard: http://$SERVER_IP:3000"
echo "  API Gateway: http://$SERVER_IP:3009"
echo "  Grafana: http://$SERVER_IP:3010"
echo "  Prometheus: http://$SERVER_IP:9090"
echo "  Jaeger: http://$SERVER_IP:16686"
echo ""
echo -e "${BLUE}🔧 Service Ports:${NC}"
echo "  Frontend: 3000"
echo "  API Gateway: 3009"
echo "  Auth Service: 3001"
echo "  AI Translator: 3002"
echo "  API Connector: 3003"
echo "  Code Generation: 3004"
echo "  Project Service: 3005"
echo "  Notification Service: 3006"
echo "  Storage Service: 3007"
echo "  Monitoring Service: 3008"
echo "  MySQL: 3306"
echo "  Redis: 6379"
echo ""
echo -e "${YELLOW}🧪 Testing services...${NC}"

# Test key services
echo "Testing API Gateway..."
if run_remote "curl -f http://localhost:3009/health >/dev/null 2>&1"; then
    echo -e "${GREEN}✅ API Gateway is healthy${NC}"
else
    echo -e "${RED}❌ API Gateway health check failed${NC}"
fi

echo "Testing Frontend..."
if run_remote "curl -f http://localhost:3000 >/dev/null 2>&1"; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend is not accessible${NC}"
fi

echo ""
echo -e "${GREEN}🎯 Next Steps:${NC}"
echo "1. Open http://$SERVER_IP:3000 in your browser to access the frontend"
echo "2. Use the service monitoring dashboard to check all microservices"
echo "3. Test API endpoints through the frontend interface"
echo "4. Access Grafana at http://$SERVER_IP:3010 for detailed monitoring"
echo ""
echo -e "${BLUE}📊 Monitoring Commands:${NC}"
echo "  View logs: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml logs -f'"
echo "  Check status: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml ps'"
echo "  Restart services: ssh $SERVER_USER@$SERVER_IP 'cd $PROJECT_DIR && docker-compose -f docker-compose.mysql.yml restart'"
echo ""
echo -e "${GREEN}🚀 DevSync Platform is ready for testing!${NC}"
