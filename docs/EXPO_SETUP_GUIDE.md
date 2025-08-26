# Expo Setup Guide - PHV Budget Tracker

## ✅ **WORKING CONFIGURATION (December 2025)**

This document provides the **exact working setup** for the PHV Budget Tracker Expo/React Native application.

### **Critical Version Compatibility Matrix**

| Component | Version | Status |
|-----------|---------|--------|
| **Node.js** | v22.18.0 | ✅ Compatible |
| **Expo SDK** | ~53.0.22 | ✅ Latest Stable |
| **Expo CLI** | 0.24.21 | ✅ Latest |
| **React** | 19.0.0 | ✅ Compatible |
| **React Native** | 0.79.6 | ✅ Latest Compatible |
| **Metro Bundler** | Auto (from Expo) | ✅ Working |
| **@types/react** | ~19.0.10 | ✅ Required for RN 0.79.6 |

### **🔧 Setup Commands**

#### **1. Initial Setup**
```bash
# Navigate to project root
cd /root/phv-budget-tracker

# Install dependencies with legacy peer deps (required for version conflicts)
npm install --legacy-peer-deps

# Start Expo development server
npx expo start
```

#### **2. Metro Configuration**
Create `metro.config.js` with **minimal configuration**:
```javascript
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
```

**⚠️ IMPORTANT:** Do NOT add custom configurations to metro.config.js until Expo is working. The default config handles all Metro bundler compatibility issues.

### **🚨 Common Issues & Solutions**

#### **Issue 1: `Cannot find module 'metro/src/ModuleGraph/worker/importLocationsPlugin'`**
**Root Cause:** Metro version mismatch between Expo and installed packages
**Solution:**
1. Use exact versions from fresh Expo project
2. Use minimal metro.config.js (no custom transformers initially)
3. Install with `--legacy-peer-deps`

#### **Issue 2: React/React Native Version Conflicts**
**Root Cause:** @types/react version incompatible with React Native 0.79.6
**Solution:**
```json
{
  "react": "19.0.0",
  "react-native": "0.79.6", 
  "@types/react": "~19.0.10"
}
```

#### **Issue 3: Expo CLI Not Found**
**Solution:**
```bash
# Install globally
npm install -g @expo/cli

# Or use npx (recommended)
npx expo start
```

### **📦 Required Package.json Dependencies**

#### **Core Dependencies**
```json
{
  "expo": "~53.0.22",
  "react": "19.0.0",
  "react-native": "0.79.6",
  "@expo/metro-runtime": "~5.0.4"
}
```

#### **Dev Dependencies**
```json
{
  "@types/react": "~19.0.10",
  "typescript": "~5.8.3"
}
```

### **🚀 Development Workflow**

#### **Starting Development**
```bash
# Backend (Terminal 1)
cd backend && npm run dev

# Frontend (Terminal 2) 
npx expo start

# Web version
npx expo start --web

# Mobile (scan QR code with Expo Go app)
npx expo start
```

#### **Testing Full Stack**
1. **Backend**: http://localhost:3000 
2. **Metro Bundler**: http://localhost:8081
3. **Web**: http://localhost:8081 (when using --web)

### **🔍 Troubleshooting Guide**

#### **Step 1: Clean Environment**
```bash
# Clear all caches
rm -rf node_modules
rm -rf ~/.npm/_npx
npm cache clean --force

# Fresh install
npm install --legacy-peer-deps
```

#### **Step 2: Verify Versions**
```bash
# Check versions match the compatibility matrix
node --version          # Should be v22.18.0+
npx expo --version      # Should be 0.24.21+
npm list expo          # Should be ~53.0.22
npm list react-native  # Should be 0.79.6
```

#### **Step 3: Test Metro Separately**
```bash
# Test if Metro starts without errors
npx expo start --clear
```

### **🏗️ Architecture Notes for Agents**

#### **For Development Agents:**
- Always use `npx expo install` instead of `npm install` for Expo packages
- Use `expo install --fix` to automatically resolve version conflicts
- Never modify metro.config.js until basic Expo is working

#### **For Build Agents:**
- Use `expo build` or `eas build` for production builds
- Ensure all environment variables are set in app.json
- Test builds on both iOS and Android before deployment

#### **For Deployment Agents:**
- Use Expo EAS for automated deployments
- Configure different environments in eas.json
- Always run `expo doctor` before deployment

### **📱 Mobile Testing**

#### **Using Expo Go App:**
1. Install Expo Go from App Store/Google Play
2. Scan QR code from `npx expo start`
3. App loads directly on device

#### **Using Physical Device:**
```bash
# iOS
npx expo run:ios

# Android
npx expo run:android
```

### **🌐 Web Testing**

```bash
# Start web version
npx expo start --web

# Access at http://localhost:8081
```

### **✅ Success Indicators**

When Expo is working correctly, you should see:
- ✅ "Starting Metro Bundler" 
- ✅ "Waiting on http://localhost:8081"
- ✅ QR code displayed in terminal
- ✅ No "Cannot find module" errors
- ✅ Metro bundler accessible via browser

### **🔄 Version Update Process**

When updating Expo SDK:
```bash
# Check for updates
npx expo install --fix

# Update to new SDK
npx expo upgrade

# Verify compatibility
npx expo doctor
```

## **Summary for Agents**

**✅ WORKING SETUP:**
- Node.js 22.18.0, Expo SDK 53.0.22, React 19.0.0, React Native 0.79.6
- Use `--legacy-peer-deps` for npm install
- Minimal metro.config.js with no custom configurations
- Backend on port 3000, Metro on port 8081

**🚨 CRITICAL:** Follow exact versions in compatibility matrix. Do not upgrade randomly.