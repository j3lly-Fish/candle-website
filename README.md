# Custom Candle E-commerce Application

A full-stack e-commerce application for custom candle sales built with Next.js, Express.js, MongoDB, and Docker.

## Features

- **Frontend**: Next.js 15 with React 19, Tailwind CSS, and Framer Motion
- **Backend**: Express.js API with TypeScript
- **Database**: MongoDB with automated backups
- **Authentication**: JWT-based authentication
- **Payment**: Stripe integration
- **Monitoring**: Prometheus and Grafana dashboards
- **Caching**: Redis for session storage
- **Reverse Proxy**: Nginx with rate limiting
- **Containerization**: Full Docker Compose setup

## Quick Start with Docker

### Prerequisites

- Docker and Docker Compose installed
- Git

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd candle-ecommerce
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.docker .env
```

Edit the `.env` file with your actual values:

```env
# Stripe Configuration (Required for payments)
STRIPE_SECRET_KEY=sk_test_your_actual_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_stripe_publishable_key

# Email Configuration (Required for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Candle E-commerce <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com

# Grafana Admin Password
GRAFANA_PASSWORD=your_secure_password
```

### 3. Start the Application

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Start specific services only
docker-compose up -d mongodb backend frontend nginx
```

### 4. Access the Application

- **Main Application**: http://localhost
- **API Documentation**: http://localhost/api
- **Grafana Dashboard**: http://localhost:3001 (admin/your_password)
- **Prometheus**: http://localhost:9090

### 5. Initialize Sample Data (Optional)

```bash
# Access the backend container
docker-compose exec backend sh

# Run database initialization
node dist/scripts/initDb.js
```

## Development Setup (Without Docker)

### Prerequisites

- Node.js 18+
- MongoDB
- Redis (optional)

### 1. Install Dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Environment Setup

```bash
# Frontend
cp .env.local.example .env.local

# Backend
cd server
cp .env.example .env
```

### 3. Start Services

```bash
# Start MongoDB
brew services start mongodb-community

# Start Redis (optional)
brew services start redis

# Start Backend (in server directory)
npm run dev

# Start Frontend (in root directory)
npm run dev
```

## Docker Services Overview

| Service | Port | Description |
|---------|------|-------------|
| **nginx** | 80, 443 | Reverse proxy and load balancer |
| **frontend** | 3000 | Next.js application |
| **backend** | 4000 | Express.js API server |
| **mongodb** | 27017 | MongoDB database |
| **redis** | 6379 | Redis cache and session store |
| **prometheus** | 9090 | Metrics collection |
| **grafana** | 3001 | Metrics visualization |
| **node-exporter** | 9100 | System metrics |
| **backup** | - | Automated database backups |

## Volume Mounts

The Docker setup includes persistent volumes for:

- **mongodb_data**: Database files
- **redis_data**: Redis persistence
- **prometheus_data**: Metrics data
- **grafana_data**: Dashboard configurations
- **nginx_logs**: Access and error logs
- **./server/logs**: Application logs
- **./server/uploads**: File uploads
- **./backups**: Database backups

## Useful Docker Commands

```bash
# View running containers
docker-compose ps

# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend

# Restart a service
docker-compose restart backend

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: This deletes data)
docker-compose down -v

# Rebuild and restart services
docker-compose up -d --build

# Execute commands in containers
docker-compose exec backend sh
docker-compose exec mongodb mongosh

# Scale services (if needed)
docker-compose up -d --scale backend=2
```

## Monitoring and Logging

### Grafana Dashboards

Access Grafana at http://localhost:3001 with admin credentials to view:

- Application performance metrics
- System resource usage
- Database performance
- Error rates and response times

### Log Files

Application logs are available in:
- Container logs: `docker-compose logs -f [service]`
- Nginx logs: `./nginx_logs/` volume
- Application logs: `./server/logs/` volume

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose ps

# Manual health check
curl http://localhost/health
curl http://localhost:4000/health
```

## Backup and Recovery

### Automated Backups

The backup service automatically creates daily MongoDB backups at 2 AM:

```bash
# View backup logs
docker-compose logs -f backup

# Manual backup
docker-compose exec backup /app/scripts/backup-script.sh

# List backups
ls -la ./backups/
```

### Restore from Backup

```bash
# Stop the application
docker-compose stop backend frontend

# Extract backup
tar -xzf ./backups/mongodb_backup_YYYYMMDD_HHMMSS.tar.gz

# Restore database
docker-compose exec mongodb mongorestore --drop /path/to/backup

# Restart services
docker-compose start backend frontend
```

## Security Considerations

### Production Deployment

1. **Environment Variables**: Use secure values for all secrets
2. **SSL/TLS**: Configure SSL certificates in nginx
3. **Firewall**: Restrict access to monitoring ports
4. **Database**: Use strong passwords and enable authentication
5. **Updates**: Regularly update Docker images

### Rate Limiting

Nginx is configured with rate limiting:
- API endpoints: 10 requests/second
- Authentication endpoints: 5 requests/minute

## Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using ports
   lsof -i :80 -i :3000 -i :4000 -i :27017
   
   # Stop conflicting services
   sudo lsof -ti:80 | xargs kill -9
   ```

2. **Permission Issues**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER ./server/logs ./backups
   ```

3. **Database Connection Issues**
   ```bash
   # Check MongoDB logs
   docker-compose logs mongodb
   
   # Test connection
   docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
   ```

4. **Build Issues**
   ```bash
   # Clean rebuild
   docker-compose down
   docker system prune -a
   docker-compose up -d --build
   ```

### Debug Mode

Enable debug logging:

```bash
# Set debug environment
echo "DEBUG=true" >> .env

# Restart with debug logs
docker-compose up -d --build
docker-compose logs -f
```

## API Documentation

The API includes the following main endpoints:

- `GET /api/products` - List products
- `POST /api/auth/login` - User authentication
- `POST /api/cart/add` - Add items to cart
- `POST /api/orders` - Create orders
- `GET /api/admin/dashboard` - Admin dashboard data

For detailed API documentation, visit http://localhost/api after starting the application.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Docker Compose
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.