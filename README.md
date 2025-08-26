# 🚗 PHV Budget Tracker

> **Premium financial management for private hire vehicle drivers**

A comprehensive, full-stack budget tracking application designed specifically for PHV (Private Hire Vehicle) drivers across Singapore and Southeast Asia, with global expansion capabilities.

[![React Native](https://img.shields.io/badge/React%20Native-0.79-blue.svg)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38B2AC.svg)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black.svg)](https://vercel.com/)

## ✨ Features

### 🎯 **Core Functionality**
- **Real-time Expense Tracking** - Categorized spending with automatic GST calculations
- **Earnings Management** - Multi-platform income tracking (Grab, TADA, Gojek, etc.)
- **OCR Receipt Processing** - Google Cloud Vision API integration
- **Multi-Currency Support** - SGD, MYR, THB, IDR, USD, AUD with live conversion
- **Regional Tax Compliance** - GST, VAT, SST support across supported regions

### 💼 **Advanced Features**
- **Banking Integration** - OAuth 2.0 connections with major regional banks
- **Debt Management** - Multi-debt tracking with payoff projections
- **Analytics Dashboard** - Visual spending insights and earning trends
- **Multi-regional Support** - Singapore, Malaysia, Thailand, Indonesia, US, Australia

### 🎨 **Modern Design**
- **Premium UI** - NativeWind (Tailwind) + React Native Paper
- **Dark/Light Mode** - Automatic theme switching
- **Responsive Design** - Optimized for web and mobile
- **Smooth Animations** - React Native Reanimated v3

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/hashashino/phv-budget-tracker.git
cd phv-budget-tracker

# Setup entire project (installs all dependencies)
npm run setup

# Start development servers
npm run dev
```

This will start:
- **Backend API** on `http://localhost:3000`
- **Frontend Web** on `http://localhost:19006` (Expo web)

### Individual Commands

```bash
# Backend only
npm run dev:backend

# Frontend only  
npm run dev:frontend

# Web version only
npm run dev:web
```

## 📁 Project Structure

```
phv-budget-tracker/
├── 📁 backend/          # Node.js API server
│   ├── api/             # Vercel serverless functions
│   ├── src/             # Source code
│   │   ├── controllers/ # Route controllers
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   ├── prisma/          # Database schema & migrations
│   └── vercel.json      # Vercel deployment config
│
├── 📁 frontend/         # React Native app
│   ├── src/             # Source code
│   │   ├── components/  # Reusable UI components
│   │   ├── screens/     # App screens
│   │   ├── navigation/  # Navigation setup
│   │   ├── hooks/       # Custom React hooks
│   │   ├── store/       # Redux state management
│   │   └── services/    # API services
│   ├── assets/          # Images, fonts, etc.
│   └── tailwind.config.js # Tailwind configuration
│
├── 📁 docs/             # Documentation
├── 📁 scripts/          # Build and utility scripts
└── docker-compose.yml   # Local database setup
```

## 🛠 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both backend and frontend
npm run dev:backend      # Backend only
npm run dev:frontend     # Frontend only

# Building
npm run build            # Build both projects
npm run build:backend    # Backend only
npm run build:frontend   # Frontend only

# Testing
npm run test             # Run all tests
npm run test:coverage    # Test coverage reports

# Code Quality
npm run lint             # Lint all code
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking

# Database
npm run db:migrate       # Run Prisma migrations
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio

# Docker
npm run docker:up        # Start PostgreSQL, Redis, pgAdmin
npm run docker:down      # Stop Docker services

# Deployment
npm run deploy:frontend  # Deploy frontend to Vercel
npm run deploy:backend   # Deploy backend to Vercel
```

### Environment Setup

1. **Backend** (`.env` in `/backend`):
```env
DATABASE_URL=postgresql://username:password@localhost:5432/phv_budget_db
JWT_SECRET=your-super-secure-jwt-secret
GOOGLE_CLOUD_VISION_API_KEY=your-google-vision-api-key
```

2. **Frontend** (`.env` in `/frontend`):
```env
EXPO_PUBLIC_API_URL=https://phv-budget-tracker-backend.vercel.app
API_BASE_URL=https://phv-budget-tracker-backend.vercel.app/api
```

## 🌍 Multi-Regional Support

### Supported Regions
- 🇸🇬 **Singapore** - Primary market
- 🇲🇾 **Malaysia** - GST/SST compliance
- 🇹🇭 **Thailand** - VAT support
- 🇮🇩 **Indonesia** - PPN tax calculations
- 🇺🇸 **United States** - State tax variations
- 🇦🇺 **Australia** - Regional tax compliance

### Banking Integrations
- **Singapore**: DBS, OCBC, UOB, POSB
- **Malaysia**: Maybank, CIMB, Public Bank, Hong Leong
- **Global**: Extensible banking adapter framework

### PHV Platforms
- **Southeast Asia**: Grab, TADA, Gojek
- **Global**: Uber, Lyft, Bolt, local platforms

## 📱 Demo

### Live Applications
- **Web App**: https://phv-budget-tracker.vercel.app
- **API**: https://phv-budget-tracker-backend.vercel.app

### Demo Credentials
```
Email: demo@phvbudget.com
Password: password123
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the PHV driver community in Southeast Asia
- Powered by modern web technologies
- Designed with financial privacy and security in mind

---

<div align="center">
  <strong>Made with ❤️ for PHV drivers everywhere</strong>
</div>