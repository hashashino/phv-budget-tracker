# PHV Budget Tracker 🚗💰

A full-stack budget tracking application designed specifically for Private Hire Vehicle (PHV) drivers in Singapore.

## 🚀 **Current Status: FULLY DEPLOYED ON VERCEL**

- ✅ **Backend API**: Deployed to Vercel (https://phv-budget-tracker-backend-4tz6mkp26-shalihins-projects.vercel.app)
- ✅ **Frontend (Web)**: Deployed to Vercel (https://phv-budget-tracker.vercel.app)
- ✅ **Mobile App**: React Native with Expo (connects to deployed backend)
- ✅ **Database**: PostgreSQL hosted online
- ✅ **Redis Cache**: Upstash Redis for session management
- ✅ **Full Stack**: End-to-end deployment complete

📋 **Setup Documentation**: See [EXPO_SETUP_GUIDE.md](./EXPO_SETUP_GUIDE.md) for detailed setup instructions and troubleshooting.

## Features

### 📱 Core Functionality
- **Manual Expense Tracking**: Quick entry for fuel, maintenance, tolls, and other PHV expenses
- **Earnings Screenshot Processing**: OCR technology to extract earnings from Grab, TADA, Gojek screenshots
- **Debt Clearing Projections**: Smart algorithms to plan debt payoff strategies
- **Banking Integration**: Connect with DBS, OCBC, UOB, and POSB accounts

### 🇸🇬 Singapore-Specific Features
- SGD currency with GST calculations
- PHV platform integrations (Grab, TADA, Gojek, ComfortDelGro)
- Local fuel station and parking expense categories
- Singapore banking API connectivity

### 🚀 Technology Stack
- **Frontend**: React Native with Expo, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **OCR**: Google Cloud Vision API
- **Authentication**: OAuth 2.0 for banking integrations

## Quick Start

### Prerequisites
- **Node.js 22.18.0+** (tested and working)
- npm or yarn  
- Docker (for PostgreSQL and Redis)
- **No global Expo CLI needed** (use npx)

### **✅ NEW RESTRUCTURED SETUP**

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies  
cd ../frontend && npm install --legacy-peer-deps

# 4. Start backend (Terminal 1)
cd backend && npm run dev

# 5. Start frontend (Terminal 2)
cd frontend && npm start

# OR start both from root:
npm run dev

# Access:
# Backend API: http://localhost:3000 (development)
# Backend API: https://phv-budget-tracker-backend-4tz6mkp26-shalihins-projects.vercel.app (production)
# Frontend (Web): https://phv-budget-tracker.vercel.app (production)
# Frontend (Mobile): http://localhost:8081 (Expo Metro for development)
```

⚠️ **CRITICAL**: Always use `--legacy-peer-deps` for npm install due to React 19/Redux Toolkit compatibility issues.

### Database Setup

```bash
# Using Docker
npm run docker:up

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
```

## Project Structure

```
phv-budget-tracker/
├── frontend/              # React Native/Expo mobile app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # App screens
│   │   ├── services/      # API clients and utilities
│   │   ├── store/         # Redux state management
│   │   └── types/         # TypeScript definitions
│   ├── App.tsx           # Main app component
│   ├── app.json          # Expo configuration
│   └── package.json      # Frontend dependencies
├── backend/              # Node.js API server
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   ├── middleware/   # Express middleware
│   │   └── routes/       # API routes
│   ├── prisma/          # Database schema and migrations
│   └── package.json     # Backend dependencies
├── package.json         # Root orchestration scripts
└── README.md           # This file
```

## Development

### Available Scripts

- `npm run dev` - Start both backend and mobile in development mode
- `npm run build` - Build both applications for production
- `npm run test` - Run all tests
- `npm run lint` - Lint all code
- `npm run type-check` - TypeScript type checking

### Environment Variables

Create `.env` files in both `backend/` and `mobile/` directories:

```bash
# backend/.env
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret
GOOGLE_CLOUD_VISION_API_KEY=your-api-key
DBS_API_KEY=your-dbs-key
OCBC_API_KEY=your-ocbc-key
UOB_API_KEY=your-uob-key

# mobile/.env
API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000
```

## PHV Driver Specific Features

### Earnings Processing
- Screenshot OCR for daily earnings from all major platforms
- Automatic categorization of income vs expenses
- Commission and incentive tracking
- Multi-platform earnings comparison

### Expense Categories
- **Vehicle**: Fuel, maintenance, repairs, insurance
- **Operations**: Tolls, parking, car wash
- **Platform**: Commission fees, rental costs
- **Personal**: Meals, phone bills, other expenses

### Debt Management
- Multiple debt tracking (car loans, credit cards, personal loans)
- Payoff strategy recommendations (avalanche vs snowball)
- Progress tracking with visual projections
- Interest savings calculations

## Banking Integration

### Supported Banks
- **DBS Bank**: Transaction analytics, account balances
- **OCBC Bank**: Account data, payment history
- **UOB Bank**: Real-time notifications, transaction history
- **POSB**: Account integration via OCBC platform

### API Integration Flow
1. OAuth 2.0 authentication with bank
2. Secure token storage and refresh
3. Automatic transaction categorization
4. Real-time balance updates

## Security & Privacy

- All financial data encrypted at rest and in transit
- OAuth 2.0 for secure banking connections
- No storage of banking credentials
- Regular security audits and updates
- GDPR/PDPA compliant data handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For support or feature requests, please create an issue in the GitHub repository.

---

**Built for Singapore PHV drivers, by developers who understand the hustle. 🚗💪**