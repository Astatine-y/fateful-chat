# FATEFUL - Deployment Guide

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│   Vercel        │     │   Railway       │
│   (Frontend)    │     │   (Backend API) │
│   Next.js       │     │   Express       │
│                 │     │                 │
│  fateful.chat   │────▶│  api.fateful.chat│
└─────────────────┘     └────────┬────────┘
                                │
                                ▼
                         ┌───────────────┐
                         │   MongoDB     │
                         │   Atlas       │
                         └───────────────┘
```

## Prerequisites

1. **GitHub Repository** - Code pushed to GitHub
2. **Vercel Account** - For frontend hosting
3. **Railway Account** - For backend API
4. **MongoDB Atlas** - For database (free tier)
5. **OpenAI Account** - For AI interpretations
6. **Stripe Account** - For payments
7. **Google Cloud Console** - For OAuth (optional)

---

## Step 1: MongoDB Atlas Setup (Free Tier)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Create free account
3. Create cluster (free tier - M0)
4. Create database user:
   - Username: `fateful`
   - Password: Generate strong password
5. Network Access: Add `0.0.0.0/0` (allow all IPs)
6. Get connection string:
   ```
   mongodb+srv://fateful:<password>@cluster0.xxx.mongodb.net/fateful-chat?retryWrites=true&w=majority
   ```

---

## Step 2: Environment Variables

Create `.env.production` for reference:

```bash
# ===================
# DATABASE
# ===================
MONGODB_URI=mongodb+srv://...

# ===================
# AUTH
# ===================
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# ===================
# OPENAI
# ===================
OPENAI_API_KEY=sk-...

# ===================
# STRIPE (Payments)
# ===================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
STRIPE_YEARLY_PRICE_ID=price_...

# ===================
# GOOGLE OAUTH (Optional)
# ===================
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=https://api.fateful.chat/api/auth/google/callback

# ===================
# FRONTEND URL
# ===================
FRONTEND_URL=https://fateful.chat
```

---

## Step 3: GitHub Secrets Setup

Add these secrets to your GitHub repository:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel Personal Access Token |
| `RAILWAY_TOKEN` | Railway API Token |
| `RAILWAY_PROJECT_ID` | Railway Project ID |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Random 32+ char string |
| `OPENAI_API_KEY` | OpenAI API key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret |
| `STRIPE_MONTHLY_PRICE_ID` | Stripe monthly price ID |
| `STRIPE_YEARLY_PRICE_ID` | Stripe yearly price ID |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Google callback URL |
| `FRONTEND_URL` | Your Vercel domain |

---

## Step 4: Vercel Setup (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Set environment variables
vercel env add NEXT_PUBLIC_API_URL production
# Set to: https://your-railway-app.railway.app

vercel env add NEXT_PUBLIC_BASE_URL production  
# Set to: https://fateful.chat

vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
# Set your Stripe publishable key
```

Or via Vercel Dashboard:
1. Import GitHub repo to Vercel
2. Add environment variables in Settings > Environment Variables
3. Deploy

---

## Step 5: Railway Setup (Backend)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Create new project
railway init
# Select "Empty Project"

# Add MongoDB plugin
railway add mongodb

# Set environment variables
railway variables set JWT_SECRET="your-secret"
railway variables set OPENAI_API_KEY="sk-..."
railway variables set MONGODB_URI="mongodb+srv://..."
railway variables set STRIPE_SECRET_KEY="sk_live_..."
# ... add other variables

# Deploy
railway up
```

Or via Railway Dashboard:
1. Import GitHub repo
2. Add MongoDB plugin
3. Set environment variables
4. Deploy

---

## Step 6: Connect Domains

### Vercel (Frontend)
1. Go to Vercel Dashboard > Settings > Domains
2. Add `fateful.chat`
3. Configure DNS records

### Railway (Backend)
1. Go to Railway Dashboard > Your Project > Settings > Domains
2. Add `api.fateful.chat`
3. Point CNAME to Railway

---

## Automatic Deployments

### Push to Deploy

Every push to `main` branch triggers:

1. **CI** - Run tests/lint
2. **Frontend** - Deploy to Vercel  
3. **Backend** - Deploy to Railway

### Manual Deploy

```bash
# Deploy frontend manually
vercel --prod

# Deploy backend manually
railway up
```

---

## Troubleshooting

### Frontend Issues
```bash
# Check build logs
vercel logs fateful-chat

# Check environment variables
vercel env ls
```

### Backend Issues
```bash
# Check Railway logs
railway logs

# Restart Railway
railway up --detach
```

### MongoDB Connection
```bash
# Test connection
mongosh "your-mongodb-uri"
```

---

## Security Checklist

- [ ] JWT_SECRET is 32+ random characters
- [ ] MongoDB has strong password
- [ ] Stripe keys are live (not test)
- [ ] Google OAuth credentials secure
- [ ] Environment variables set in both Vercel and Railway
- [ ] CORS configured for correct domains
