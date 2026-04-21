#!/bin/bash

# FATEFUL Deployment Setup Script
# This script helps set up deployment to Vercel, Railway, and MongoDB

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          FATEFUL - Deployment Setup Wizard                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"

# Check prerequisites
echo -e "\n${YELLOW}Checking prerequisites...${NC}"

command -v vercel >/dev/null 2>&1 || { echo -e "${RED}Vercel CLI not found. Run: npm i -g vercel${NC}"; exit 1; }
command -v railway >/dev/null 2>&1 || { echo -e "${RED}Railway CLI not found. Run: npm i -g @railway/cli${NC}"; exit 1; }

echo -e "${GREEN}✓ Prerequisites OK${NC}"

# Setup Vercel
echo -e "\n${YELLOW}Setting up Vercel (Frontend)...${NC}"
read -p "Enter your Vercel Personal Access Token: " VERCEL_TOKEN
vercel link --yes --token="$VERCEL_TOKEN" 2>/dev/null || true

echo -e "\n${GREEN}Configuring Vercel environment variables...${NC}"

# Railway Setup
echo -e "\n${YELLOW}Setting up Railway (Backend)...${NC}"
read -p "Enter your Railway API Token: " RAILWAY_TOKEN
read -p "Enter your Railway Project ID: " RAILWAY_PROJECT_ID

export RAILWAY_TOKEN
railway link --yes "$RAILWAY_PROJECT_ID" 2>/dev/null || true

# MongoDB Setup
echo -e "\n${YELLOW}MongoDB Setup...${NC}"
read -p "Enter MongoDB Atlas connection string (mongodb+srv://...): " MONGODB_URI

# JWT Secret
echo -e "\n${YELLOW}Generating JWT Secret...${NC}"
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 64 /dev/urandom | xxd -p)
echo "Generated JWT Secret: $JWT_SECRET"

# API Keys
echo -e "\n${YELLOW}Enter API Keys (press Enter to skip):${NC}"
read -p "OpenAI API Key (sk-...): " OPENAI_API_KEY
read -p "Stripe Secret Key (sk_live_...): " STRIPE_SECRET_KEY
read -p "Stripe Publishable Key (pk_live_...): " STRIPE_PUBLISHABLE_KEY
read -p "Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
read -p "Stripe Monthly Price ID (price_...): " STRIPE_MONTHLY_PRICE_ID
read -p "Stripe Yearly Price ID (price_...): " STRIPE_YEARLY_PRICE_ID
read -p "Google Client ID: " GOOGLE_CLIENT_ID
read -p "Google Client Secret: " GOOGLE_CLIENT_SECRET

# Set Railway Variables
echo -e "\n${YELLOW}Setting Railway environment variables...${NC}"
railway variables set MONGODB_URI="$MONGODB_URI" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set JWT_SECRET="$JWT_SECRET" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set OPENAI_API_KEY="$OPENAI_API_KEY" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set STRIPE_PUBLISHABLE_KEY="$STRIPE_PUBLISHABLE_KEY" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set STRIPE_MONTHLY_PRICE_ID="$STRIPE_MONTHLY_PRICE_ID" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set STRIPE_YEARLY_PRICE_ID="$STRIPE_YEARLY_PRICE_ID" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set GOOGLE_CLIENT_ID="$GOOGLE_CLIENT_ID" --token="$RAILWAY_TOKEN" 2>/dev/null || true
railway variables set GOOGLE_CLIENT_SECRET="$GOOGLE_CLIENT_SECRET" --token="$RAILWAY_TOKEN" 2>/dev/null || true

# Deploy
echo -e "\n${YELLOW}Deploying to Railway...${NC}"
railway up --token="$RAILWAY_TOKEN"

echo -e "\n${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Deployment Complete!                   ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}Next Steps:${NC}"
echo "1. Configure your domain in Vercel and Railway dashboards"
echo "2. Set NEXT_PUBLIC_API_URL in Vercel to your Railway domain"
echo "3. Push to main branch to trigger automatic deployments"
