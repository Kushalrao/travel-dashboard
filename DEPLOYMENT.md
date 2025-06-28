# 🚀 Production Deployment Guide

This guide covers deploying your Travel Dashboard to popular cloud platforms for production use.

## 🎯 Deployment Options

Choose the platform that best fits your needs:

| Platform | Backend | Frontend | Difficulty | Cost |
|----------|---------|----------|------------|------|
| **Heroku** | ✅ | ✅ | Easy | Free tier available |
| **Vercel** | ✅ | ✅ | Easy | Free tier available |
| **Netlify** | ❌ | ✅ | Easy | Free tier available |
| **Railway** | ✅ | ✅ | Easy | Usage-based pricing |
| **AWS** | ✅ | ✅ | Advanced | Pay-as-you-go |
| **DigitalOcean** | ✅ | ✅ | Intermediate | $5/month+ |

## 🔧 Pre-Deployment Checklist

### 1. Environment Configuration
```bash
# Copy environment template
cp environment.example .env

# Update with production values
nano .env
```

### 2. Production Build (Frontend)
```bash
cd frontend
npm run build
```

### 3. Security Setup
- [ ] Set strong environment variables
- [ ] Configure CORS for production domains
- [ ] Set up HTTPS certificates
- [ ] Configure rate limiting (optional)

## 🌐 Option 1: Heroku Deployment

### Backend Deployment
```bash
# Install Heroku CLI
# Visit: https://devcenter.heroku.com/articles/heroku-cli

# Login to Heroku
heroku login

# Create backend app
heroku create your-travel-dashboard-api

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-domain.com

# Deploy backend
git add .
git commit -m "Deploy to production"
git push heroku main

# View logs
heroku logs --tail
```

### Frontend Deployment
```bash
cd frontend

# Create frontend app
heroku create your-travel-dashboard-frontend

# Set build configuration
heroku config:set NPM_CONFIG_PRODUCTION=false
heroku config:set REACT_APP_API_BASE_URL=https://your-travel-dashboard-api.herokuapp.com

# Add buildpack
heroku buildpacks:set mars/create-react-app

# Deploy frontend
git add .
git commit -m "Deploy frontend"
git push heroku main
```

## ⚡ Option 2: Vercel Deployment

### Backend Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy backend
vercel --prod

# Set environment variables in Vercel dashboard
# Visit: https://vercel.com/dashboard
```

### Frontend Deployment
```bash
cd frontend

# Deploy frontend
vercel --prod

# Set environment variables:
# REACT_APP_API_BASE_URL=https://your-backend.vercel.app
# REACT_APP_GOOGLE_MAPS_API_KEY=your_key
```

## 🚂 Option 3: Railway Deployment

### Full-Stack Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy backend
railway up

# Set environment variables
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-frontend-domain.railway.app

# Deploy frontend separately or use monorepo setup
```

## ☁️ Option 4: AWS Deployment

### Using AWS Elastic Beanstalk
```bash
# Install EB CLI
pip install awsebcli

# Initialize EB application
eb init

# Create environment
eb create production

# Deploy
eb deploy

# Set environment variables
eb setenv NODE_ENV=production FRONTEND_URL=https://your-frontend.com
```

### Using AWS Lambda (Serverless)
```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml configuration
# Deploy with: serverless deploy
```

## 🐳 Option 5: Docker Deployment

### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FRONTEND_URL=http://localhost:3001
    
  frontend:
    build: ./frontend
    ports:
      - "3001:80"
    environment:
      - REACT_APP_API_BASE_URL=http://localhost:3000
```

## 📊 Environment Variables Setup

### Backend (.env)
```bash
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

### Frontend (.env)
```bash
REACT_APP_API_BASE_URL=https://your-backend-domain.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🔒 Security Configuration

### 1. CORS Setup
Update backend for production domains:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
```

### 2. HTTPS Enforcement
```javascript
// Force HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### 3. Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 📈 Monitoring & Analytics

### 1. Health Checks
Your `/health` endpoint is ready for monitoring:
```bash
curl https://your-backend-domain.com/health
```

### 2. Logging
Add structured logging for production:
```bash
npm install winston
```

### 3. Error Tracking
Consider adding error tracking:
- Sentry
- LogRocket
- Bugsnag

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

## 🧪 Testing Production Deployment

### 1. Backend Health Check
```bash
curl https://your-backend-domain.com/health
```

### 2. API Endpoints Test
```bash
# Test dashboard data
curl https://your-backend-domain.com/api/dashboard

# Test booking creation
curl -X POST https://your-backend-domain.com/api/test-booking \
  -H "Content-Type: application/json" \
  -d '{"booking_id": "PROD001", "status": "confirmed", "date": "'$(date +%Y-%m-%d)'", "arrival": {"airport": "DXB"}}'
```

### 3. Frontend Verification
- [ ] Dashboard loads correctly
- [ ] Charts display data
- [ ] Auto-refresh works
- [ ] Mobile responsiveness
- [ ] Error handling

## 🚨 Troubleshooting

### Common Issues

**CORS Errors**
- Check FRONTEND_URL environment variable
- Verify domain configuration
- Ensure HTTPS/HTTP consistency

**Build Failures**
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review build logs for specific errors

**API Connection Issues**
- Verify backend URL in frontend environment
- Check firewall and security group settings
- Ensure backend health endpoint responds

**Slack Integration Problems**
- Validate webhook URL format
- Check Slack app permissions
- Verify JSON message format

## 📞 Support

### Performance Optimization
- Enable gzip compression
- Add CDN for static assets
- Implement caching strategies
- Monitor response times

### Scaling Considerations
- Database migration for persistence
- Load balancing for high traffic
- Microservices architecture
- Auto-scaling configuration

---

**Your travel dashboard is ready for production! 🚀**

*Choose the deployment option that best fits your needs and follow the step-by-step instructions above.* 