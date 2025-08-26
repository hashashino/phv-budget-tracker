# PHV Budget Tracker - Deployment Guide 🚀

This guide documents the successful deployment of the PHV Budget Tracker full-stack application to Vercel.

## 📋 **Deployment Summary**

✅ **Status**: Successfully deployed and operational  
🗓️ **Completed**: August 2024  
🏗️ **Platform**: Vercel (both frontend and backend)

## 🌐 **Live URLs**

| Service | URL | Status |
|---------|-----|---------|
| **Frontend (Web)** | https://phv-budget-tracker.vercel.app | ✅ Live |
| **Backend API** | https://phv-budget-tracker-backend-4tz6mkp26-shalihins-projects.vercel.app | ✅ Live |
| **Database** | PostgreSQL (hosted online) | ✅ Connected |
| **Redis Cache** | Upstash Redis | ✅ Connected |

## 🏗️ **Architecture Overview**

### **Backend (Vercel Serverless Functions)**
- **Runtime**: Node.js with Express.js
- **Configuration**: `backend/vercel.json`
- **Entry Point**: `backend/api/index.js`
- **Features**: 
  - RESTful API endpoints
  - Authentication (JWT + Redis sessions)
  - CORS configured for frontend
  - PostgreSQL database connection
  - Redis caching for performance

### **Frontend (Vercel Static Site)**
- **Framework**: React Native (Expo web build)
- **Configuration**: `frontend/vercel.json` 
- **Build Command**: `npm run web:build`
- **Output**: `frontend/dist/`
- **Features**:
  - Single Page Application (SPA)
  - Mobile-responsive design
  - Connects to backend API
  - Environment variables for API URLs

## ⚙️ **Environment Variables**

### **Backend Environment Variables (Vercel)**
```bash
# Database
DATABASE_URL=postgresql://...
PRISMA_CLIENT_ENGINE_TYPE=binary

# Authentication
JWT_SECRET=your-jwt-secret-32-chars-minimum
ENCRYPTION_KEY=your-encryption-key-32-characters

# Redis Cache
REDIS_URL=redis://default:xxx@xxx.upstash.io:6379

# CORS & Security  
FRONTEND_URL=https://phv-budget-tracker.vercel.app
NODE_ENV=production
```

### **Frontend Environment Variables (Vercel)**
```bash
# API Connection
EXPO_PUBLIC_API_URL=https://phv-budget-tracker-backend-4tz6mkp26-shalihins-projects.vercel.app
```

## 🛠️ **Deployment Process**

### **1. Backend Deployment**
1. **Project Structure**: Set Vercel root directory to `backend`
2. **Serverless Function**: Created `backend/api/index.js` as entry point
3. **Configuration**: Updated `backend/vercel.json` with proper routing
4. **Dependencies**: Fixed import paths (removed `@/` aliases for compatibility)
5. **Database**: Connected PostgreSQL with environment variables
6. **Redis**: Integrated Upstash Redis for session management

### **2. Frontend Deployment**  
1. **Project Structure**: Set Vercel root directory to `frontend`
2. **Build Configuration**: Used `npm run web:build` with Expo
3. **Output Directory**: Set to `dist` for built web assets
4. **API Configuration**: Environment variable points to backend URL
5. **SPA Routing**: Configured rewrites for client-side routing

## 🔧 **Key Configuration Files**

### **Backend Configuration (`backend/vercel.json`)**
```json
{
  "version": 2,
  "buildCommand": "",
  "installCommand": "npm install --legacy-peer-deps", 
  "functions": {
    "api/index.js": {
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api/index"
    }
  ]
}
```

### **Frontend Configuration (`frontend/vercel.json`)**
```json
{
  "version": 2,
  "name": "phv-budget-tracker-frontend",
  "buildCommand": "npm run web:build",
  "outputDirectory": "dist",
  "installCommand": "npm install --legacy-peer-deps",
  "framework": null,
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "env": {
    "EXPO_PUBLIC_API_URL": "https://phv-budget-tracker-backend-4tz6mkp26-shalihins-projects.vercel.app"
  }
}
```

## 🐛 **Issues Resolved During Deployment**

### **1. Import Path Issues**
- **Problem**: TypeScript `@/` path aliases not working in Vercel
- **Solution**: Replaced all `@/` imports with relative paths (`../`)

### **2. Vercel Deployment Protection**
- **Problem**: 401 authentication errors due to Vercel's deployment protection
- **Solution**: Disabled deployment protection in Vercel project settings

### **3. Conflicting Entry Points**
- **Problem**: `package.json` main field pointing to old file  
- **Solution**: Updated `"main": "api/index.js"` in backend package.json

### **4. Redis Connection Issues**
- **Problem**: Authentication failing without Redis
- **Solution**: Integrated Upstash Redis with proper environment variables

### **5. CORS Configuration**
- **Problem**: Frontend couldn't connect to backend API
- **Solution**: Configured CORS with proper origins and headers

## 📱 **Mobile App Connection**

The React Native mobile app connects to the deployed backend:
- **Development**: Update `.env` file with production API URL
- **Production**: Environment variables automatically point to deployed backend
- **Testing**: Use Expo Go app with deployed backend for real device testing

## 🔄 **CI/CD Process**

### **Automatic Deployment**
1. **Trigger**: Git push to `master` branch
2. **Backend**: Vercel automatically deploys backend serverless functions
3. **Frontend**: Vercel automatically builds and deploys web app
4. **Environment**: Production environment variables are automatically applied

### **Manual Deployment** 
```bash
# Force redeploy if needed
git commit --allow-empty -m "Force redeploy"
git push origin master
```

## 📊 **Performance & Monitoring**

- **Backend**: Serverless functions with 60-second timeout
- **Frontend**: Static site with optimized React Native web bundle
- **Database**: Connection pooling with Prisma
- **Cache**: Redis for session management and rate limiting
- **Monitoring**: Vercel provides built-in analytics and performance metrics

## 🎯 **Next Steps for Production**

1. **Database Migration**: Set up proper production PostgreSQL with backups
2. **Environment Security**: Use proper secrets management
3. **Custom Domain**: Configure custom domain for both services  
4. **SSL Certificates**: Ensure HTTPS everywhere
5. **Monitoring**: Set up application monitoring and alerting
6. **Performance**: Optimize bundle sizes and API response times

## 📞 **Support & Maintenance**

- **Logs**: Check Vercel function logs for backend issues
- **Monitoring**: Vercel dashboard provides deployment and performance metrics
- **Updates**: Deploy updates by pushing to master branch
- **Rollback**: Use Vercel dashboard to rollback to previous deployments if needed

---

✅ **Deployment Complete**: PHV Budget Tracker is successfully deployed and operational on Vercel!