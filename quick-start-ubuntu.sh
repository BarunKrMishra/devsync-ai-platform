#!/bin/bash

# DevSync Quick Start Script for Ubuntu Server (10.0.0.199)
# This script will set up everything needed to run DevSync on your Ubuntu server

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

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

print_status "🚀 DevSync Quick Start for Ubuntu Server"
print_status "This script will prepare your server and deploy DevSync"

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_warning "Running as root. This is fine for server setup."
fi

# Update system
print_status "Updating system packages..."
apt update && apt upgrade -y

# Install essential tools
print_status "Installing essential tools..."
apt install -y curl wget git vim htop ufw

# Install Docker
print_status "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_success "Docker installed successfully"
else
    print_success "Docker already installed"
fi

# Install Docker Compose
print_status "Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    print_success "Docker Compose installed successfully"
else
    print_success "Docker Compose already installed"
fi

# Add user to docker group (if not root)
if [ "$EUID" -ne 0 ]; then
    print_status "Adding user to docker group..."
    usermod -aG docker $USER
    print_warning "You may need to log out and back in for docker group changes to take effect"
fi

# Clone repository
print_status "Cloning DevSync repository..."
if [ ! -d "devsync-ai-platform" ]; then
    git clone https://github.com/BarunKrMishra/devsync-ai-platform.git
    print_success "Repository cloned successfully"
else
    print_success "Repository already exists"
fi

cd devsync-ai-platform

# Make deployment script executable
chmod +x deploy.sh

# Configure firewall
print_status "Configuring firewall..."
ufw --force enable
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 3000:3008/tcp
print_success "Firewall configured"

# Create environment file
print_status "Setting up environment configuration..."
if [ ! -f .env ]; then
    cp env.example .env
    print_warning "Environment file created from template"
    print_warning "Please update .env file with your API keys and configuration"
    print_warning "Key variables to update:"
    print_warning "  - OPENAI_API_KEY"
    print_warning "  - ANTHROPIC_API_KEY"
    print_warning "  - JWT_SECRET"
    print_warning "  - JWT_REFRESH_SECRET"
    print_warning ""
    print_warning "You can edit the file with: nano .env"
    print_warning "Or continue with default values for testing"
    
    read -p "Press Enter to continue with default values, or Ctrl+C to edit .env file first..."
fi

# Deploy in development mode
print_status "Deploying DevSync in development mode..."
./deploy.sh development

print_success "🎉 DevSync deployment completed!"
echo ""
print_status "Your DevSync platform is now running on:"
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
echo "  📈 Grafana: http://10.0.0.199:3000"
echo "  🔍 Jaeger: http://10.0.0.199:16686"
echo "  📊 Prometheus: http://10.0.0.199:9090"
echo ""
print_status "Useful commands:"
echo "  📋 View logs: docker-compose logs -f"
echo "  🔄 Restart: docker-compose restart"
echo "  🛑 Stop: docker-compose down"
echo "  📊 Status: docker-compose ps"
echo ""
print_status "To deploy to production later:"
echo "  1. Update .env file with production values"
echo "  2. Run: ./deploy.sh production"
echo ""
print_success "DevSync is ready to transform requirements into applications! 🚀"
