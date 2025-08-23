# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a PHV Budget Tracker - a mobile-first budget tracking application designed specifically for Private Hire Vehicle (PHV) drivers in Singapore. The application uses a full-stack TypeScript architecture with React Native frontend and Node.js backend.

## Development Commands

### Quick Start
```bash
# Setup entire development environment
make setup

# Start all development servers
make start
# OR npm run dev (starts both backend and mobile)

# Start services individually
make dev-backend    # Backend API on port 3000
make dev-mobile     # Mobile app with Expo
```

### Essential Commands
```bash
# Testing
npm run test              # Run all tests
make test-backend        # Backend tests only
make test-mobile         # Mobile tests only
npm run test:coverage    # Test coverage report

# Code Quality
npm run lint             # Lint all code
make lint-fix           # Fix linting issues
npm run type-check      # TypeScript type checking
npm run prettier        # Format code

# Database Management
make db-migrate         # Run Prisma migrations
make db-seed           # Seed database with sample data
cd backend && npx prisma studio  # Database GUI

# Docker Operations
make docker-up         # Start PostgreSQL, Redis, pgAdmin
make docker-down       # Stop Docker services
make docker-logs       # View Docker logs

# Production Build
npm run build          # Build all applications
make build-backend     # Backend only
make build-mobile      # Mobile app only
```

## Architecture Overview

### Monorepo Structure
- **Root**: Shared configuration and orchestration
- **`/backend`**: Node.js/Express API server with Prisma ORM
- **`/src`**: React Native mobile application (root level for Expo compatibility)
- **`/mobile`**: Additional mobile-specific configurations

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with secure middleware
- **File Storage**: Local filesystem with S3 support
- **Caching**: Redis for session management
- **APIs**: RESTful endpoints with comprehensive validation

### Frontend Architecture  
- **Framework**: React Native with Expo
- **State Management**: Redux Toolkit with Redux Persist
- **Navigation**: React Navigation v6 with stack/tab navigation
- **UI Components**: React Native Paper with custom theming
- **Forms**: Formik with Yup validation

### Key Features
- **OCR Processing**: Google Cloud Vision API for receipt/earnings screenshot extraction
- **Banking Integration**: OAuth 2.0 connections with DBS, OCBC, UOB, POSB
- **PHV-Specific**: Earnings tracking for Grab, TADA, Gojek platforms
- **Debt Management**: Multi-debt tracking with payoff projections
- **Singapore Focus**: SGD currency, GST calculations, local banking APIs

## Database Schema (Prisma)

Core entities include:
- **Users**: PHV driver profiles with license/vehicle info
- **Expenses**: Categorized spending with GST tracking
- **Earnings**: Platform-specific income with commission calculations
- **Receipts**: OCR-processed images with extracted data
- **BankConnections**: Encrypted OAuth tokens for bank APIs
- **Debts**: Multi-debt tracking with payment projections
- **PHVPlatforms**: Platform configurations (Grab, TADA, etc.)

## Development Patterns

### API Structure
- Routes in `/backend/src/routes/` with controller separation
- Middleware pipeline: helmet → cors → auth → validation → rate limiting
- Centralized error handling with structured logging

### Frontend Patterns
- Redux slices for domain-specific state (auth, expenses, earnings)
- Service layer abstraction for API calls
- Persistent storage for auth and settings only
- Screen-based navigation with typed navigation props

### Security Practices
- All financial data encrypted at rest and in transit
- OAuth 2.0 for banking integrations (no credential storage)
- JWT tokens with secure middleware
- Rate limiting and request validation
- Content Security Policy headers

## Environment Setup

### Required Environment Variables
```bash
# Backend (.env in /backend)
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
GOOGLE_CLOUD_VISION_API_KEY=your-api-key
DBS_API_KEY=your-dbs-key
OCBC_API_KEY=your-ocbc-key

# Mobile (.env in root)
API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000
```

### Database Setup
```bash
# Using Docker (recommended)
make docker-up
make db-migrate
make db-seed
```

## Testing Strategy

- **Backend**: Jest with Supertest for API integration tests
- **Frontend**: Jest with React Native Testing Library
- **Database**: Test database with Prisma migrations
- **E2E**: Run `npm run test:coverage` for comprehensive coverage reports

## Common Development Tasks

### Adding New API Endpoints
1. Create controller in `/backend/src/controllers/`
2. Add route in `/backend/src/routes/`
3. Update Prisma schema if needed and run migration
4. Add corresponding frontend service in `/src/services/`

### Adding Mobile Screens
1. Create screen component in `/src/screens/`
2. Add to navigation in `/src/navigation/`
3. Create Redux slice if state management needed
4. Add API service calls as needed

### Database Changes
1. Modify `/backend/prisma/schema.prisma`
2. Run `cd backend && npx prisma migrate dev`
3. Generate new Prisma client with `npx prisma generate`
4. Update seed file if needed

## OCR and Banking Integration

### OCR Processing
- Google Cloud Vision API for receipt text extraction
- Structured data extraction for amounts, merchants, dates
- Automatic expense categorization based on merchant patterns

### Banking APIs
- OAuth 2.0 flow implementation for secure bank connections
- Transaction categorization and real-time balance updates
- Encrypted token storage with automatic refresh handling