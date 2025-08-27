# 🚀 PHV Budget Tracker - Vercel Deployment Guide

## 📋 Overview

You need to deploy **2 separate services** on Vercel:

1. **Backend API** (Node.js/Express + PostgreSQL)
2. **Frontend Web App** (React Native Web via Expo)

## 🛠 Service Breakdown

### Service 1: Backend API
- **Repository**: `/backend` folder
- **Framework**: Node.js/Express with TypeScript
- **Database**: PostgreSQL (Neon/Supabase recommended)
- **Entry Point**: `api/index.ts`
- **URL**: `https://phv-budget-tracker-backend-[hash].vercel.app`

### Service 2: Frontend Web App  
- **Repository**: `/frontend` folder
- **Framework**: React Native Web (Expo)
- **Build**: Static web export
- **Entry Point**: `index.js`
- **URL**: `https://phv-budget-tracker.vercel.app`

## 📦 Deployment Steps

### Step 1: Deploy Backend API

1. **Create new Vercel project**:
   ```bash
   # In /backend directory
   vercel --prod
   ```

2. **Set environment variables in Vercel dashboard**:
   ```env
   NODE_ENV=production
   DATABASE_URL=postgresql://[your-db-connection-string]
   JWT_SECRET=your-super-secret-jwt-key-here
   REDIS_URL=redis://[your-redis-connection]  # Optional
   ```

3. **Database setup**:
   - Use **Neon** (recommended): https://neon.tech
   - Or **Supabase**: https://supabase.com
   - Run migrations: `npx prisma migrate deploy`

### Step 2: Deploy Frontend Web App

1. **Create new Vercel project**:
   ```bash
   # In /frontend directory  
   vercel --prod
   ```

2. **Environment variables** (set in Vercel dashboard):
   ```env
   EXPO_PUBLIC_API_URL=https://your-backend-url.vercel.app
   API_BASE_URL=https://your-backend-url.vercel.app
   ```

3. **Build configuration**:
   - Build Command: `npm run web:build`
   - Output Directory: `dist`
   - Install Command: `npm install --legacy-peer-deps`

## 🔧 Configuration Files

### Backend: `/backend/vercel.json`
```json
{
  "version": 2,
  "name": "phv-budget-tracker-backend",
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["prisma/**", "src/**"]
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/api/index.ts"
    }
  ],
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

### Frontend: `/frontend/vercel.json`
```json
{
  "version": 2,
  "name": "phv-budget-tracker-frontend", 
  "buildCommand": "npm run web:build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 🌍 Environment Variables Required

### Backend Environment Variables
| Variable | Description | Required |
|----------|-------------|-----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `NODE_ENV` | Set to "production" | ✅ |
| `REDIS_URL` | Redis connection (optional) | ❌ |

### Frontend Environment Variables
| Variable | Description | Required |
|----------|-------------|-----------|
| `EXPO_PUBLIC_API_URL` | Backend API URL | ✅ |
| `API_BASE_URL` | Backend API URL (fallback) | ✅ |

## 🗄 Database Setup

### Option 1: Neon (Recommended)
1. Sign up at https://neon.tech
2. Create new project
3. Get connection string
4. Set `DATABASE_URL` in Vercel

### Option 2: Supabase
1. Sign up at https://supabase.com
2. Create new project  
3. Go to Settings → Database
4. Copy connection string
5. Set `DATABASE_URL` in Vercel

### Database Migration
```bash
# After deployment, run migrations
npx prisma migrate deploy

# Seed with initial data (optional)
npx prisma db seed
```

## 🚦 Testing Deployment

### Backend API Test
```bash
curl https://your-backend-url.vercel.app/health
# Should return: {"status": "OK", "timestamp": "..."}
```

### Frontend Test
1. Visit: `https://your-frontend-url.vercel.app`
2. Should load login screen
3. Test login with demo user:
   - Email: `demo@phvbudget.com`
   - Password: `password123`

## 🔄 Automatic Deployments

- **Git Integration**: Connect both projects to GitHub
- **Auto Deploy**: Pushes to `main` branch trigger deployments
- **Preview Deployments**: Pull requests get preview URLs

## 📊 Current Deployment Status

- **Backend**: https://phv-budget-tracker-backend-4tz6mkp26-shalihins-projects.vercel.app
- **Frontend**: https://phv-budget-tracker.vercel.app

## 🐛 Common Issues & Solutions

### Backend Issues
1. **Build Timeout**: Increase function timeout to 30s
2. **Prisma Errors**: Ensure `npx prisma generate` runs in build
3. **CORS Issues**: Check origin URLs in server.ts

### Frontend Issues  
1. **Build Fails**: Use `--legacy-peer-deps` flag
2. **API Connection**: Verify environment variables
3. **Routing**: Ensure all routes redirect to `index.html`

## 🎯 Performance Optimization

- **Cold Start**: Backend functions may have cold starts
- **Database**: Use connection pooling for PostgreSQL
- **Caching**: Implement Redis for session management
- **CDN**: Vercel automatically provides CDN for frontend

---

**🎉 Once deployed, you'll have a fully functional PHV Budget Tracker accessible from anywhere!**