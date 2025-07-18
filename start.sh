#!/bin/bash

# Custom Candle E-commerce Application Startup Script

set -e

echo "🕯️  Starting Custom Candle E-commerce Application..."

# Check if Docker and Docker Compose are installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating environment file from template..."
    cp .env.docker .env
    echo "⚠️  Please edit .env file with your actual configuration values before proceeding."
    echo "   Required: STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, EMAIL_* settings"
    read -p "Press Enter to continue after editing .env file..."
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p ./server/logs ./server/uploads ./backups ./nginx/ssl

# Start the application
echo "🚀 Starting all services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check service health
echo "🔍 Checking service health..."
services=("mongodb" "backend" "frontend" "nginx")
for service in "${services[@]}"; do
    if docker-compose ps | grep -q "$service.*Up"; then
        echo "✅ $service is running"
    else
        echo "❌ $service failed to start"
        docker-compose logs "$service"
    fi
done

echo ""
echo "🎉 Application started successfully!"
echo ""
echo "📱 Access points:"
echo "   Main Application: http://localhost"
echo "   API Endpoint:     http://localhost/api"
echo "   Grafana:          http://localhost:3001 (admin/admin)"
echo "   Prometheus:       http://localhost:9090"
echo ""
echo "📊 Useful commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo ""
echo "📚 For more information, see README.md"