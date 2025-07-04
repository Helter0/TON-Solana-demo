#!/bin/bash

echo "🚀 TON-Solana Smart Wallet Deployment Script"
echo "============================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

# Check if user is logged in to Vercel
echo "🔐 Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build and deploy
echo "🏗️  Building and deploying to Vercel..."

# Set working directory to frontend
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
cd ..
vercel --prod

echo "✅ Deployment complete!"
echo "📱 Your app should be available at the URL shown above"
echo ""
echo "🔧 Next steps:"
echo "1. Update TON Connect manifest URL with your Vercel domain"
echo "2. Test TON Connect integration"
echo "3. Configure custom domain (optional)"