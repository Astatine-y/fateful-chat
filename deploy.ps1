# Fateful Chat Deployment Script (Windows PowerShell)
# Run as: .\deploy.ps1 -Backend -Frontend

param(
    [switch]$Backend,
    [switch]$Frontend,
    [switch]$All,
    [switch]$SkipBuild
)

$Green = "`e[0;32m"
$Yellow = "`e[1;33m"
$NC = "`e[0m"

Write-Host "`n🚀 Fateful Chat Deployment Script" -ForegroundColor $Green
Write-Host "================================`n" -ForegroundColor $Green

# Default to all if nothing specified
if (-not $Backend -and -not $Frontend) {
    $Backend = $true
    $Frontend = $true
}

# Install CLI tools if not present
if (-not (Get-Command railway -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Railway CLI..." -ForegroundColor $Yellow
    npm install -g @railway/cli
}

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor $Yellow
    npm install -g vercel
}

Write-Host "Selected:" -ForegroundColor $Green
if ($Backend) { Write-Host "  ✓ Backend (Railway)" }
if ($Frontend) { Write-Host "  ✓ Frontend (Vercel)" }
Write-Host ""

# Install dependencies
if (-not $SkipBuild) {
    Write-Host "Installing dependencies..." -ForegroundColor $Green
    npm install
}

# Deploy Backend
if ($Backend) {
    Write-Host "`nDeploying Backend to Railway..." -ForegroundColor $Green
    
    railway login --interactive=false
    
    if (Test-Path ".env.production") {
        Write-Host "Loading environment from .env.production..." -ForegroundColor $Yellow
        railway env set -f .env.production
    }
    
    railway up
    
    Write-Host "`nBackend deployment complete!" -ForegroundColor $Green
    $url = railway domain
    Write-Host "URL: $url" -ForegroundColor $Green
    $url | Out-File -FilePath ".railway-url" -Encoding UTF8
}

# Deploy Frontend
if ($Frontend) {
    Write-Host "`nDeploying Frontend to Vercel..." -ForegroundColor $Green
    
    if (Test-Path ".railway-url") {
        $railwayUrl = Get-Content ".railway-url"
        Write-Host "Railway URL: $railwayUrl" -ForegroundColor $Yellow
    }
    
    vercel --prod
}

Write-Host "`n================================" -ForegroundColor $Green
Write-Host "Deployment complete!" -ForegroundColor $Green
Write-Host "`nNext steps:" -ForegroundColor $Yellow
Write-Host "1. Set environment variables in Railway/Vercel dashboards"
Write-Host "2. Configure Stripe products"
Write-Host "3. Configure Google OAuth credentials"
Write-Host "4. Test the application"