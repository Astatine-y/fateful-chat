# FATEFUL Deployment Setup Script (Windows)
# Run this in PowerShell

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          FATEFUL - Deployment Setup Wizard                ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

# Check prerequisites
Write-Host "`nChecking prerequisites..." -ForegroundColor Yellow

$vercel = Get-Command vercel -ErrorAction SilentlyContinue
$railway = Get-Command railway -ErrorAction SilentlyContinue

if (-not $vercel) {
    Write-Host "Vercel CLI not found. Run: npm i -g vercel" -ForegroundColor Red
    exit 1
}
if (-not $railway) {
    Write-Host "Railway CLI not found. Run: npm i -g @railway/cli" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Prerequisites OK" -ForegroundColor Green

# Setup Railway
Write-Host "`nSetting up Railway (Backend)..." -ForegroundColor Yellow
$RAILWAY_TOKEN = Read-Host "Enter your Railway API Token"
$RAILWAY_PROJECT_ID = Read-Host "Enter your Railway Project ID"

$env:RAILWAY_TOKEN = $RAILWAY_TOKEN

# MongoDB Setup
Write-Host "`nMongoDB Setup..." -ForegroundColor Yellow
$MONGODB_URI = Read-Host "Enter MongoDB Atlas connection string (mongodb+srv://...)"

# JWT Secret
Write-Host "`nGenerating JWT Secret..." -ForegroundColor Yellow
$JWT_SECRET = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "Generated JWT Secret (save this!): $JWT_SECRET" -ForegroundColor Cyan

# API Keys
Write-Host "`nEnter API Keys (press Enter to skip):" -ForegroundColor Yellow
$OPENAI_API_KEY = Read-Host "OpenAI API Key (sk-...)"
$STRIPE_SECRET_KEY = Read-Host "Stripe Secret Key (sk_live_...)"
$STRIPE_PUBLISHABLE_KEY = Read-Host "Stripe Publishable Key (pk_live_...)"
$STRIPE_WEBHOOK_SECRET = Read-Host "Stripe Webhook Secret (whsec_...)"
$STRIPE_MONTHLY_PRICE_ID = Read-Host "Stripe Monthly Price ID (price_...)"
$STRIPE_YEARLY_PRICE_ID = Read-Host "Stripe Yearly Price ID (price_...)"
$GOOGLE_CLIENT_ID = Read-Host "Google Client ID"
$GOOGLE_CLIENT_SECRET = Read-Host "Google Client Secret"

# Set Railway Variables
Write-Host "`nSetting Railway environment variables..." -ForegroundColor Yellow

$variables = @{
    "MONGODB_URI" = $MONGODB_URI
    "JWT_SECRET" = $JWT_SECRET
    "OPENAI_API_KEY" = $OPENAI_API_KEY
    "STRIPE_SECRET_KEY" = $STRIPE_SECRET_KEY
    "STRIPE_PUBLISHABLE_KEY" = $STRIPE_PUBLISHABLE_KEY
    "STRIPE_WEBHOOK_SECRET" = $STRIPE_WEBHOOK_SECRET
    "STRIPE_MONTHLY_PRICE_ID" = $STRIPE_MONTHLY_PRICE_ID
    "STRIPE_YEARLY_PRICE_ID" = $STRIPE_YEARLY_PRICE_ID
    "GOOGLE_CLIENT_ID" = $GOOGLE_CLIENT_ID
    "GOOGLE_CLIENT_SECRET" = $GOOGLE_CLIENT_SECRET
}

foreach ($key in $variables.Keys) {
    if ($variables[$key]) {
        railway variables set $key="$($variables[$key])" --token="$RAILWAY_TOKEN" 2>$null
    }
}

# Deploy
Write-Host "`nDeploying to Railway..." -ForegroundColor Yellow
railway up --token="$RAILWAY_TOKEN"

Write-Host "`n╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    Deployment Complete!                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "1. Configure your domain in Vercel and Railway dashboards"
Write-Host "2. Set NEXT_PUBLIC_API_URL in Vercel to your Railway domain"
Write-Host "3. Push to main branch to trigger automatic deployments"
