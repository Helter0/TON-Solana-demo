# Deployment Guide

## Vercel Deployment

### Quick Deploy
1. Go to [vercel.com](https://vercel.com)
2. Login with GitHub
3. Click "New Project"
4. Select "Helter0/TON-Solana-demo" repository
5. Configure:
   - **Root Directory**: `./frontend`
   - **Framework**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
6. Click "Deploy"

### Environment Variables
Add these in Vercel dashboard:
```
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_PROGRAM_ID=9WmFfBdBMNQSBGkMxgJK4QKoNJEgkEGjLwGzn3TfDQ5c
NEXT_PUBLIC_JUPITER_API_URL=https://quote-api.jup.ag/v6
```

### Troubleshooting

#### Build fails with workspace errors:
- Make sure Root Directory is set to `./frontend`
- Check that Build Command is `npm run build`

#### TON Connect not working:
- Update manifest URL in environment variables
- Check that `tonconnect-manifest.json` is accessible

#### React version conflicts:
- Project uses React 18.2 for compatibility
- All dependencies should resolve correctly

### Custom Domain (Optional)
1. In Vercel dashboard, go to project settings
2. Click "Domains"
3. Add your custom domain
4. Update `tonconnect-manifest.json` with new domain

## Backend Deployment (Optional)

### Railway.app
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Select `backend` folder
4. Add environment variables:
   ```
   NODE_ENV=production
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   PROGRAM_ID=9WmFfBdBMNQSBGkMxgJK4QKoNJEgkEGjLwGzn3TfDQ5c
   PAYER_SECRET_KEY=your_solana_private_key
   REDIS_URL=redis://your-redis-url
   ```

### Vercel Serverless (Alternative)
1. Move backend files to `api/` folder in frontend
2. Convert to Vercel serverless functions
3. Deploy with frontend

## Solana Program Deployment

### Prerequisites
```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor
npm install -g @coral-xyz/anchor-cli
```

### Deploy to Devnet
```bash
cd programs/ton-smart-wallet
anchor build
anchor deploy --provider.cluster devnet
```

### Deploy to Mainnet
```bash
anchor deploy --provider.cluster mainnet
# Update PROGRAM_ID in environment variables
```

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] TON Connect works
- [ ] All pages accessible
- [ ] Responsive design works
- [ ] Console has no critical errors
- [ ] Backend API responds (if deployed)
- [ ] Solana program deployed (if needed)
- [ ] Analytics configured (optional)

## URLs Structure

After deployment, your app will have:
- `/` - Landing page with TON Connect
- `/dashboard` - Smart account management
- `/swap` - Jupiter DEX interface
- `/history` - Transaction history

## Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- Monitor performance and usage

### Error Tracking
Consider adding:
- Sentry for error tracking
- LogRocket for user sessions
- Google Analytics for usage