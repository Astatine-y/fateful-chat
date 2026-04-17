# Deployment Options & Cost-Free Platforms

## 🎯 Quick Answer: YES - Ready for Docker & Multiple Platforms!

Your application is **production-ready** and can be deployed to several cost-free platforms. Here's the complete deployment guide:

---

## 🐳 Option 1: Docker (Local/Cloud - FREE)

### Local Docker (Already Configured)
```bash
# Start everything locally
docker-compose up -d

# Access:
# Web: http://localhost:3000
# API: http://localhost:5000
# MongoDB: localhost:27017
```

### Docker to Cloud (Free Tiers)
- **Google Cloud Run** (2M requests/month free)
- **AWS Fargate** (Limited free tier)
- **Azure Container Instances** (Limited free)

---

## ⚡ Option 2: Vercel + Railway (RECOMMENDED - 100% FREE)

### Frontend: Vercel (FREE)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd apps/web
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-api-url.up.railway.app/api
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Backend: Railway (FREE)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login & deploy
railway login
railway init
railway up

# Set environment variables in Railway dashboard:
# MONGODB_URI=mongodb://...
# JWT_SECRET=your-secret
# OPENAI_API_KEY=sk-...
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...
```

**Cost**: $0/month (Railway free tier: 512MB RAM, 1GB disk)

---

## 🚀 Option 3: Render (FULLY MANAGED - FREE)

### Single Command Deploy
```bash
# Connect GitHub to Render
# Render auto-detects render.yaml and deploys both services

# Services created:
# - fateful-chat-api (Web Service)
# - fateful-chat-web (Web Service)
# - fateful-chat-db (PostgreSQL - FREE)
```

**Cost**: $0/month (750 hours free, then $7/month)

---

## 🛩️ Option 4: Fly.io (GLOBAL - FREE)

### Deploy API Only
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Deploy
fly launch
fly deploy

# Set secrets
fly secrets set JWT_SECRET=your-secret
fly secrets set OPENAI_API_KEY=sk-...
# ... etc
```

**Cost**: $0/month (3 shared CPUs, 256MB RAM free)

---

## 🗄️ Database Options (FREE)

### MongoDB Atlas (FREE)
```bash
# Create free cluster
# Connection string: mongodb+srv://user:pass@cluster.mongodb.net/fateful-chat
```

### Railway Database (FREE)
- Automatic PostgreSQL with Railway
- Or MongoDB with Railway

### Render Database (FREE)
- PostgreSQL included in render.yaml

---

## 🔄 Stripe Webhook Setup

### For Railway/Render/Fly:
```bash
# 1. Deploy your API first
# 2. Get the deployment URL
# 3. In Stripe Dashboard:
#    - Go to Webhooks
#    - Add endpoint: https://your-api-url.com/api/stripe/webhook
#    - Select events: payment_intent.succeeded, payment_intent.payment_failed
#    - Copy webhook secret to STRIPE_WEBHOOK_SECRET
```

---

## 📋 Complete FREE Stack Setup

### Step 1: Database (MongoDB Atlas - FREE)
1. Create account at mongodb.com
2. Create free cluster
3. Get connection string

### Step 2: Backend (Railway - FREE)
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically

### Step 3: Frontend (Vercel - FREE)
1. Connect GitHub repo
2. Set NEXT_PUBLIC_API_URL to Railway URL
3. Deploy automatically

### Step 4: Stripe Setup
1. Add webhook endpoint
2. Test payment flow

---

## 🧪 Testing Your Deployment

### Health Check
```bash
curl https://your-api-url.com/health
# Should return: {"status":"OK",...}
```

### Test Registration
```bash
curl -X POST https://your-api-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### Test Bazi Calculation
```bash
# Get token from registration/login
curl -X POST https://your-api-url.com/api/bazi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"year":1990,"month":1,"day":15,"hour":8,"longitude":121.47,"latitude":31.23}'
```

---

## 🚨 Important Notes

### Environment Variables Required
```bash
# API (.env.local or platform secrets)
JWT_SECRET=strong-random-key-here
OPENAI_API_KEY=sk-your-key
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
MONGODB_URI=mongodb+srv://...

# Web (.env.local or Vercel env)
NEXT_PUBLIC_API_URL=https://your-api-url.com/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### CORS Configuration
Update allowed origins in API config for production domains.

### Domain Setup
- Vercel: Automatic custom domain
- Railway: Custom domain in settings
- Render: Custom domain support

---

## 🎯 Recommended FREE Stack

| Component | Platform | Cost | Setup Time |
|-----------|----------|------|------------|
| Frontend | Vercel | FREE | 5 min |
| Backend | Railway | FREE | 10 min |
| Database | MongoDB Atlas | FREE | 5 min |
| Payments | Stripe | FREE tier | 10 min |
| AI | OpenAI | Pay per use | 2 min |

**Total Cost**: $0/month
**Total Setup Time**: 30 minutes

---

## 🔧 Troubleshooting

### Railway Issues
```bash
# Check logs
railway logs

# Redeploy
railway up
```

### Vercel Issues
```bash
# Check build logs in dashboard
# Or redeploy
vercel --prod
```

### Database Connection
```bash
# Test connection
mongosh "your-connection-string"
```

---

## 📈 Scaling Up (When Needed)

When you outgrow free tiers:

| Platform | Paid Plan | Cost |
|----------|-----------|------|
| Railway | Hobby | $5/month |
| Render | Starter | $7/month |
| Vercel | Pro | $20/month |
| MongoDB Atlas | M0 → M2 | $9/month |

---

## ✅ Ready to Deploy?

Your application is **100% ready** for deployment! Choose your preferred platform:

- **Quick & Easy**: Vercel + Railway (recommended)
- **Fully Managed**: Render (single config file)
- **Docker Native**: Railway or Render
- **Global**: Fly.io

All configurations are prepared. Just set your environment variables and deploy! 🚀
