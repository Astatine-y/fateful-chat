# Docker & Container Setup Guide

## Quick Start with Docker

### Prerequisites
- Docker (v20.10+)
- Docker Compose (v1.29+)

### Local Development

1. **Setup environment variables**
```bash
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local
```

2. **Fill in required secrets**
```bash
# apps/api/.env.local
JWT_SECRET=your-dev-secret-key
OPENAI_API_KEY=sk_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# apps/web/.env.local
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Start the application**
```bash
docker-compose up -d
```

4. **Access the services**
- Web: http://localhost:3000
- API: http://localhost:5000
- MongoDB: localhost:27017
- Redis: localhost:6379

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f web
docker-compose logs -f mongodb
```

### Stop Services

```bash
docker-compose down

# With volume cleanup
docker-compose down -v
```

---

## Production Deployment

### Build Images

```bash
docker build -f Dockerfile.api -t fateful-chat-api:latest .
docker build -f Dockerfile.web -t fateful-chat-web:latest .
```

### Tag for Registry

```bash
docker tag fateful-chat-api:latest your-registry.com/fateful-chat-api:latest
docker tag fateful-chat-web:latest your-registry.com/fateful-chat-web:latest
```

### Push to Registry

```bash
docker push your-registry.com/fateful-chat-api:latest
docker push your-registry.com/fateful-chat-web:latest
```

---

## Docker Compose Services

### MongoDB
- **Image**: mongo:6.0-alpine
- **Port**: 27017
- **Username**: admin
- **Password**: password
- **Volume**: mongodb_data

### Redis
- **Image**: redis:7-alpine
- **Port**: 6379
- **Volume**: redis_data

### API
- **Build**: Dockerfile.api
- **Port**: 5000
- **Depends on**: MongoDB
- **Health Check**: http://localhost:5000/health

### Web
- **Build**: Dockerfile.web
- **Port**: 3000
- **Depends on**: API

---

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs api

# Rebuild
docker-compose build --no-cache
```

### Database connection fails
```bash
# Check MongoDB health
docker-compose exec mongodb mongosh

# Reset database
docker-compose down -v
docker-compose up -d
```

### Port already in use
```bash
# Use custom ports
docker-compose -f docker-compose.yml up -d -e API_PORT=5001 -e WEB_PORT=3001
```

---

## Environment Variables Reference

### API (.env.local)
- `NODE_ENV`: development | production
- `PORT`: API server port (default: 5000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT signing
- `OPENAI_API_KEY`: OpenAI API key
- `STRIPE_SECRET_KEY`: Stripe secret key
- `STRIPE_PUBLISHABLE_KEY`: Stripe publishable key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `CORS_ORIGIN`: Comma-separated CORS origins

### Web (.env.local)
- `NEXT_PUBLIC_API_URL`: API base URL
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

---

## Health Checks

All services have health checks configured:

```bash
# API health
curl http://localhost:5000/health

# MongoDB
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"

# Redis
docker-compose exec redis redis-cli ping
```

