# Vercel Deployment Guide

## 🚀 Deploy Travel Dashboard to Vercel

### Prerequisites
1. **GitHub Account** - Your code needs to be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **Google Maps API Key** - `AIzaSyA1_RD_0S0nngWZc-GXtGWJvRlM1pXy3E4`

### Step 1: Push to GitHub
```bash
# Initialize git repository (if not already done)
git init
git add .
git commit -m "Initial commit - Travel Dashboard"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR-USERNAME/travel-dashboard.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration from `vercel.json`

### Step 3: Configure Environment Variables
In Vercel dashboard, add these environment variables:

**Required Variables:**
- `REACT_APP_GOOGLE_MAPS_API_KEY` = `AIzaSyA1_RD_0S0nngWZc-GXtGWJvRlM1pXy3E4`
- `NODE_ENV` = `production`

### Step 4: Get Your Deployment URL
After deployment, you'll get a URL like: `https://travel-dashboard-xyz.vercel.app`

### Step 5: Test Your Deployment
1. **Frontend:** Visit your Vercel URL
2. **Backend API:** Test `https://your-url.vercel.app/health`
3. **Slack Webhook:** Use `https://your-url.vercel.app/api/slack-webhook`

## 🔗 API Endpoints (Production)
- **Health Check:** `https://your-url.vercel.app/health`
- **Dashboard Data:** `https://your-url.vercel.app/api/dashboard`
- **Map Data:** `https://your-url.vercel.app/api/map`
- **Slack Webhook:** `https://your-url.vercel.app/api/slack-webhook`

## 📱 Slack Integration Setup
Once deployed, use your Vercel URL as the webhook endpoint in your Slack app:
- Webhook URL: `https://your-url.vercel.app/api/slack-webhook`

## 🔧 Local Development
```bash
# Backend (root directory)
npm start

# Frontend (separate terminal)
cd frontend
PORT=3001 npm start
```

## 📝 Notes
- The app uses in-memory storage (resets on deployment)
- Data persists for the duration of the serverless function lifecycle
- Auto-refreshes every 30 seconds
- Supports real-time Slack webhook integration 