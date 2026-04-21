#!/bin/bash
# Deploy script for Fateful Chat

echo "🚀 Fateful Chat Deployment Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Railway CLI is installed
command -v railway >/dev/null 2>&1 || {
    echo "${YELLOW}Installing Railway CLI...${NC}"
    npm install -g @railway/cli
}

# Check if Vercel CLI is installed
command -v vercel >/dev/null 2>&1 || {
    echo "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
}

# Parse arguments
DEPLOY_BACKEND=false
DEPLOY_FRONTEND=false
SKIP_BUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --backend)
            DEPLOY_BACKEND=true
            shift
            ;;
        --frontend)
            DEPLOY_FRONTEND=true
            shift
            ;;
        --all)
            DEPLOY_BACKEND=true
            DEPLOY_FRONTEND=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        *)
            echo "Usage: $0 [--backend] [--frontend] [--all] [--skip-build]"
            echo "  --backend   Deploy backend only (Railway)"
            echo "  --frontend Deploy frontend only (Vercel)"
            echo "  --all     Deploy both"
            echo "  --skip-build Skip building (for local testing)"
            exit 1
            ;;
    esac
done

# Default to all if nothing specified
if [ "$DEPLOY_BACKEND" = false ] && [ "$DEPLOY_FRONTEND" = false ]; then
    DEPLOY_BACKEND=true
    DEPLOY_FRONTEND=true
fi

echo ""
echo "${GREEN}Selected:${NC}"
[ "$DEPLOY_BACKEND" = true ] && echo "  ✓ Backend (Railway)"
[ "$DEPLOY_FRONTEND" = true ] && echo "  ✓ Frontend (Vercel)"
echo ""

# Install dependencies if not skipped
if [ "$SKIP_BUILD" = false ]; then
    echo "${GREEN}Installing dependencies...${NC}"
    npm install
fi

# Deploy Backend
if [ "$DEPLOY_BACKEND" = true ]; then
    echo ""
    echo "${GREEN}Deploying Backend to Railway...${NC}"
    
    railway login --interactive=false
    railway link
    
    if [ -f ".env.production" ]; then
        echo "Loading environment from .env.production..."
        railway env set -f .env.production
    fi
    
    railway up
    railway status
    
    echo ""
    echo "${GREEN}Backend deployment complete!${NC}"
    echo "URL: $(railway domain)"
    
    # Save the URL for frontend
    RAILWAY_URL=$(railway domain)
    echo "$RAILWAY_URL" > .railway-url
fi

# Deploy Frontend
if [ "$DEPLOY_FRONTEND" = true ]; then
    echo ""
    echo "${GREEN}Deploying Frontend to Vercel...${NC}"
    
    # Get Railway URL if available
    if [ -f ".railway-url" ]; then
        RAILWAY_URL=$(cat .railway-url)
        echo "Setting NEXT_PUBLIC_API_URL to https://$RAILWAY_URL/api"
        vercel env add NEXT_PUBLIC_API_URL
        # Note: Manual setup required in Vercel dashboard for production
    fi
    
    vercel --prod
fi

echo ""
echo "================================"
echo "${GREEN}Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set environment variables in Railway/Vercel dashboards"
echo "2. Configure Stripe products"
echo "3. Configure Google OAuth credentials"
echo "4. Test the application"