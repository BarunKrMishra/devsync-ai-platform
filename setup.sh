#!/bin/bash

# DevSync Setup Script
# This script sets up the complete DevSync development environment

set -e

echo "🚀 DevSync Setup Script"
echo "========================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}[SETUP]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    print_header "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_status "Docker and Docker Compose are installed"
}

# Check if Node.js is installed
check_node() {
    print_header "Checking Node.js installation..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ first."
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    
    print_status "Node.js $(node --version) is installed"
}

# Create environment file
create_env_file() {
    print_header "Creating environment file..."
    
    if [ ! -f .env ]; then
        cp env.example .env
        print_status "Created .env file from template"
        print_warning "Please update .env file with your API keys and configuration"
    else
        print_status ".env file already exists"
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing dependencies..."
    
    # Install root dependencies
    print_status "Installing root dependencies..."
    npm install
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd frontend
    npm install
    cd ..
    
    # Install backend dependencies
    print_status "Installing backend dependencies..."
    cd backend
    npm install
    cd ..
    
    print_status "All dependencies installed successfully"
}

# Setup databases
setup_databases() {
    print_header "Setting up databases..."
    
    # Start databases
    print_status "Starting database services..."
    docker-compose up -d postgres neo4j mongodb redis
    
    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 10
    
    # Run database migrations
    print_status "Running database migrations..."
    cd backend
    npx prisma migrate dev --name init
    npx prisma generate
    cd ..
    
    print_status "Databases setup completed"
}

# Build applications
build_applications() {
    print_header "Building applications..."
    
    # Build backend
    print_status "Building backend..."
    cd backend
    npm run build
    cd ..
    
    # Build frontend
    print_status "Building frontend..."
    cd frontend
    npm run build
    cd ..
    
    print_status "Applications built successfully"
}

# Start all services
start_services() {
    print_header "Starting all services..."
    
    # Start all services
    docker-compose up -d
    
    print_status "All services started"
    print_status "Services are starting up, this may take a few minutes..."
    
    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30
    
    # Check service health
    print_status "Checking service health..."
    
    # Check backend health
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        print_status "Backend is healthy"
    else
        print_warning "Backend health check failed"
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        print_status "Frontend is healthy"
    else
        print_warning "Frontend health check failed"
    fi
}

# Display service URLs
display_urls() {
    print_header "Service URLs"
    echo "========================"
    echo "Frontend:        http://localhost:3000"
    echo "Backend API:     http://localhost:8000"
    echo "API Docs:        http://localhost:8000/api-docs"
    echo "Prometheus:      http://localhost:9090"
    echo "Grafana:         http://localhost:3001 (admin/admin)"
    echo "Jaeger:          http://localhost:16686"
    echo "Neo4j Browser:   http://localhost:7474 (neo4j/devsync_password)"
    echo "========================"
}

# Main setup function
main() {
    print_header "Starting DevSync setup..."
    
    # Check prerequisites
    check_docker
    check_node
    
    # Setup environment
    create_env_file
    install_dependencies
    
    # Setup databases
    setup_databases
    
    # Build applications
    build_applications
    
    # Start services
    start_services
    
    # Display URLs
    display_urls
    
    print_status "DevSync setup completed successfully! 🎉"
    print_warning "Don't forget to:"
    echo "  1. Update .env file with your API keys"
    echo "  2. Restart services if you updated environment variables"
    echo "  3. Check the logs if any service is not working: docker-compose logs [service-name]"
}

# Handle script arguments
case "${1:-}" in
    "start")
        print_header "Starting DevSync services..."
        docker-compose up -d
        display_urls
        ;;
    "stop")
        print_header "Stopping DevSync services..."
        docker-compose down
        ;;
    "restart")
        print_header "Restarting DevSync services..."
        docker-compose restart
        ;;
    "logs")
        print_header "Showing DevSync logs..."
        docker-compose logs -f ${2:-}
        ;;
    "clean")
        print_header "Cleaning up DevSync..."
        docker-compose down -v
        docker system prune -f
        ;;
    "reset")
        print_header "Resetting DevSync..."
        docker-compose down -v
        docker system prune -f
        main
        ;;
    *)
        main
        ;;
esac
