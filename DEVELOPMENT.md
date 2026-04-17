# Development Setup Guide

## Prerequisites

- **Node.js**: v18+ (with npm or yarn)
- **MongoDB**: v6.0+ (or use Docker)
- **Git**: For version control
- **Code Editor**: VS Code recommended

## Local Development Setup

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/Astatine-y/fateful-chat.git
cd fateful-chat

# Install dependencies (using npm)
npm install

# Or using yarn
yarn install
```

### 2. Environment Configuration

```bash
# Copy environment templates
cp apps/api/.env.example apps/api/.env.local
cp apps/web/.env.example apps/web/.env.local

# Edit configuration files with your secrets
nano apps/api/.env.local
nano apps/web/.env.local
```

Required environment variables:

**apps/api/.env.local**:
```
JWT_SECRET=your-dev-secret-key-here
OPENAI_API_KEY=sk_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGODB_URI=mongodb://localhost:27017/fateful-chat
PORT=5000
NODE_ENV=development
```

**apps/web/.env.local**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start MongoDB in Docker
docker run -d \
  --name fateful-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  mongo:6.0-alpine

# Connection string for .env.local
MONGODB_URI=mongodb://admin:password@localhost:27017/fateful-chat?authSource=admin
```

#### Option B: Using docker-compose (Full Stack)

```bash
docker-compose up -d
```

This starts:
- MongoDB (port 27017)
- Redis (port 6379)
- API (port 5000) - auto-reloads on code changes
- Web (port 3000) - auto-reloads on code changes

### 4. Start Development Servers

#### Option A: Using npm scripts

```bash
# Terminal 1: Start API server
cd apps/api
npm run dev

# Terminal 2: Start Web server
cd apps/web
npm run dev
```

#### Option B: Using docker-compose

```bash
docker-compose up
```

#### Option C: From root with Turborepo

```bash
npm run dev
```

### 5. Access the Application

- **Web**: http://localhost:3000
- **API**: http://localhost:5000
- **API Health**: http://localhost:5000/health

---

## Project Structure

```
fateful-chat/
├── apps/
│   ├── api/                    # Express.js API server
│   │   ├── src/
│   │   │   ├── config/         # Configuration management
│   │   │   ├── middleware/     # Express middleware
│   │   │   ├── models/         # MongoDB schemas
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── utils/          # Helper functions
│   │   │   ├── validators/     # Input validation
│   │   │   └── index.ts        # Entry point
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── web/                    # Next.js frontend
│       ├── src/
│       │   ├── app/            # Next.js app directory
│       │   ├── components/     # React components
│       │   └── (other Next.js structure)
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── bazi-core/              # Bazi calculation logic
│   │   ├── calculator.py       # Python calculations
│   │   ├── index.ts            # TypeScript wrapper
│   │   ├── types.ts            # Type definitions
│   │   └── tests/
│   └── ui/                     # Shared UI components
├── docker-compose.yml
├── Dockerfile.api
├── Dockerfile.web
└── package.json
```

---

## API Endpoints

### Authentication
```
POST   /api/auth/register          - Register new user
POST   /api/auth/login             - Login user
```

### Bazi Calculation
```
POST   /api/bazi                   - Calculate bazi (requires auth + credits)
```

### User Management
```
GET    /api/user/profile           - Get user profile (requires auth)
PUT    /api/user/profile           - Update profile (requires auth)
GET    /api/user/stats             - Get user stats (requires auth)
DELETE /api/user/account           - Delete account (requires auth)
```

### Payment
```
POST   /api/payment/create-intent  - Create Stripe payment intent (requires auth)
POST   /api/payment/confirm        - Confirm payment (requires auth)
POST   /api/stripe/webhook         - Stripe webhook endpoint
```

---

## Development Commands

### API Commands

```bash
cd apps/api

# Start dev server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Format code
npm run format
```

### Web Commands

```bash
cd apps/web

# Start dev server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint
```

### Root Commands

```bash
# Install all dependencies
npm install

# Run dev for all workspaces
npm run dev

# Build all workspaces
npm run build

# Format all code
npm run format
```

---

## Testing

### Python Tests (Bazi Calculator)

```bash
cd packages/bazi-core

# Run tests
python -m pytest tests/

# With coverage
python -m pytest tests/ --cov=.
```

### Node.js/TypeScript Tests

```bash
cd apps/api

# Run tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

---

## Debugging

### VS Code Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "API Debug",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/apps/api/dist/index.js",
      "restart": true,
      "console": "integratedTerminal",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

### Check Logs

```bash
# API logs
docker-compose logs -f api

# Web logs
docker-compose logs -f web

# MongoDB logs
docker-compose logs -f mongodb
```

---

## Common Issues

### MongoDB Connection Fails
```bash
# Check MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker restart fateful-mongodb

# Or restart all services
docker-compose restart mongodb
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

### Dependencies Not Installed
```bash
# Clean install
rm -rf node_modules
npm install
```

### Stripe Webhook Not Working
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login to Stripe
stripe login

# Forward events to localhost
stripe listen --forward-to localhost:5000/api/stripe/webhook
```

---

## Code Quality

### Formatting

```bash
# Format all files
npm run format

# Format specific file
npx prettier --write <file>
```

### Linting

```bash
# Lint all files
npm run lint

# Fix linting issues
npm run lint:fix
```

### Type Checking

```bash
cd apps/api
tsc --noEmit

cd apps/web
tsc --noEmit
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes and commit
git add .
git commit -m "feat: add feature description"

# Push branch
git push origin feature/feature-name

# Create pull request on GitHub
```

---

## Performance Tips

1. **Use Redis caching** for frequently accessed data
2. **Add database indexes** on commonly queried fields
3. **Implement pagination** for large result sets
4. **Monitor API response times** with APM tools
5. **Optimize bundle size** with code splitting

---

## Production Deployment

See [DOCKER_GUIDE.md](./DOCKER_GUIDE.md) for containerization and deployment instructions.

---

## Getting Help

- Check [ARCHITECTURE_REVIEW.md](./ARCHITECTURE_REVIEW.md) for architecture details
- Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
- Check logs: `docker-compose logs -f`
- Open an issue on GitHub

