# PHV Budget Tracker - Installation Guide

## Quick Start

```bash
# Clone and setup the project
git clone <repository-url> phv-budget-tracker
cd phv-budget-tracker

# Run the setup script (recommended)
make setup
# OR manually:
npm run setup
```

## Prerequisites

### Required Software
1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
2. **Git** - Download from [git-scm.com](https://git-scm.com/)
3. **PostgreSQL 13+** - Install locally or use Docker

### Optional (Recommended)
4. **Docker & Docker Compose** - For database containerization
5. **Make** - For using the Makefile commands (Windows: via WSL/Git Bash)

## Installation Methods

### Method 1: Automated Setup (Recommended)

```bash
# Using Makefile (Linux/macOS/WSL)
make setup

# Using PowerShell (Windows)
powershell -ExecutionPolicy Bypass -File ./scripts/setup.ps1

# Using Bash (Linux/macOS/Git Bash)
chmod +x ./scripts/setup.sh && ./scripts/setup.sh

# Using npm directly
npm run setup
```

### 🚀 **Recommended: WSL2 + Docker Setup**

For **optimal performance** and **easy portability**, use WSL2 with Docker:

```bash
# 1. Move project to WSL2 (best performance)
mkdir -p ~/projects
cd ~/projects
git clone <repository-url> budget-tracker
cd budget-tracker

# 2. Stop any local PostgreSQL to avoid conflicts
sudo systemctl stop postgresql
sudo systemctl disable postgresql

# 3. Start Docker databases (portable across machines)
sudo docker-compose up -d postgres redis

# 4. Install dependencies
npm install
cd backend && npm install
cd ../mobile && npm install && cd ..

# 5. Setup database
cd backend && npm run db:migrate && npm run db:seed && cd ..

# 6. Start development
npm run dev
```

**Why WSL2 + Docker is best:**
- ✅ **3-5x faster** performance than Windows filesystem
- ✅ **Portable** - same setup on any machine with `docker-compose up -d`
- ✅ **No conflicts** with system PostgreSQL installations
- ✅ **Team consistency** - everyone gets identical environment
- ✅ **Easy cleanup** - `docker-compose down -v` for fresh start

### Method 2: Manual Installation

#### Step 1: Install Root Dependencies
```bash
npm install
```

#### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
cd ..
```

#### Step 3: Install Mobile Dependencies
```bash
cd mobile  
npm install
cd ..
```

#### Step 4: Setup Environment Files
```bash
# Copy environment templates
cp .env.example .env
cp backend/.env.example backend/.env
cp mobile/.env.example mobile/.env
```

#### Step 5: Configure Environment Variables
Edit the `.env` files with your specific configuration:

**backend/.env**
```bash
DATABASE_URL=postgresql://phv_user:phv_password@localhost:5432/phv_budget_tracker
JWT_SECRET=your-super-secure-jwt-secret-32-chars-minimum
GOOGLE_CLOUD_VISION_API_KEY=your-google-cloud-api-key
```

**mobile/.env**
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_GOOGLE_CLOUD_VISION_API_KEY=your-google-cloud-api-key
```

#### Step 6: Setup Database

**Option A: Using Docker (Recommended for WSL2)**
```bash
# If you have local PostgreSQL running, stop it first to avoid port conflicts
sudo systemctl stop postgresql
sudo systemctl disable postgresql

# Start Docker databases
sudo docker-compose up -d postgres redis

# Verify containers are running
docker-compose ps

# Expected output: postgres and redis containers should be "Up"
```

**Option B: Local PostgreSQL Installation (Not recommended for WSL2)**
```bash
# Create database
createdb phv_budget_tracker

# Or using psql
psql -c "CREATE DATABASE phv_budget_tracker;"
```

**⚠️ Port Conflict Resolution:**
If you get "port 5432 already in use" error:
```bash
# Check what's using port 5432
sudo lsof -i :5432

# If PostgreSQL is running locally:
# COMMAND  PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
# postgres 477 postgres    5u  IPv4   7426      0t0  TCP localhost:postgresql (LISTEN)

# Stop local PostgreSQL (recommended for Docker approach)
sudo systemctl stop postgresql
sudo systemctl disable postgresql

# Then start Docker containers
sudo docker-compose up -d postgres redis
```

#### Step 7: Run Database Migrations
```bash
cd backend

# Run Prisma migrations to create tables
npm run db:migrate
# OR manually: npx prisma migrate dev --name initial

# Seed database with initial PHV data
npm run db:seed  
# OR manually: npx prisma db seed

cd ..
```

**Expected Output:**
- Database tables created for users, expenses, earnings, receipts, debts
- Sample PHV categories seeded (fuel, ERP, maintenance, etc.)
- Singapore-specific data initialized (GST rates, PHV platforms)

## Environment Configuration

### Database Setup

#### PostgreSQL (Local Installation)

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Windows:**
Download installer from [postgresql.org](https://www.postgresql.org/download/windows/)

#### Redis (Local Installation)

**Ubuntu/Debian:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS (Homebrew):**
```bash
brew install redis
brew services start redis
```

**Windows:**
Use Windows Subsystem for Linux (WSL) or download from [redis.io](https://redis.io/download)

### API Keys Configuration

#### Google Cloud Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Vision API
4. Create service account and download JSON key
5. Set `GOOGLE_CLOUD_VISION_API_KEY` in your `.env` files

#### Singapore Banking APIs

**DBS Bank API:**
1. Register at [DBS Developer Portal](https://www.dbs.com/dbsdevelopers)
2. Create application and get API keys
3. Set `DBS_API_KEY`, `DBS_CLIENT_ID`, `DBS_CLIENT_SECRET`

**OCBC Bank API:**
1. Register at [OCBC API Store](https://api.ocbc.com/store)
2. Subscribe to required APIs
3. Set `OCBC_API_KEY`, `OCBC_CLIENT_ID`, `OCBC_CLIENT_SECRET`

**UOB Bank API:**
1. Register at [UOB Developer Portal](https://developers.uobgroup.com/)
2. Apply for API access
3. Set `UOB_API_KEY`, `UOB_CLIENT_ID`, `UOB_CLIENT_SECRET`

## Development Setup

### Mobile Development

#### Install Expo CLI
```bash
npm install -g @expo/cli
```

#### Install Expo Go App
- **iOS**: Download from App Store
- **Android**: Download from Google Play Store

### Code Editor Setup

#### VS Code Extensions (Recommended)
```bash
# Install recommended extensions
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension Prisma.prisma
```

#### VS Code Settings
Add to `.vscode/settings.json`:
```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "eslint.validate": ["typescript", "typescriptreact"],
  "prisma.showPrismaDataPlatformNotification": false
}
```

## Running the Application

### Start All Services
```bash
# Using Makefile
make start

# Using npm scripts
npm run dev
```

### Start Individual Services

**Backend Only:**
```bash
npm run dev:backend
# Backend will run on http://localhost:3000
```

**Mobile Only:**
```bash
npm run dev:mobile
# Expo dev server will provide QR code for mobile testing
```

### Access Points

**Backend API:** http://localhost:3000
**API Documentation:** http://localhost:3000/api-docs
**Mobile App:** Scan QR code with Expo Go app

## Testing the Installation

### Backend Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Mobile App Test
1. Open Expo Go app on your mobile device
2. Scan the QR code from the terminal
3. App should load with the PHV Budget Tracker dashboard

### Database Test
```bash
cd backend
npx prisma studio
```
Opens Prisma Studio at http://localhost:5555

## Troubleshooting

### Common Issues

**Node.js Version Error:**
```bash
# Check Node.js version
node --version
# Should be 18.x or higher
```

**PostgreSQL Connection Error:**
```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql
# Or check the connection
psql -U phv_user -d phv_budget_tracker -c "SELECT 1;"
```

**Port Already in Use:**
```bash
# Kill process using port 3000
sudo lsof -t -i tcp:3000 | xargs kill -9
```

**Expo CLI Issues:**
```bash
# Clear Expo cache
expo start --clear
# Or reinstall Expo CLI
npm uninstall -g @expo/cli && npm install -g @expo/cli
```

**NPM Installation Timeout:**
```bash
# Increase npm timeout
npm config set timeout 60000
# Or try yarn
npm install -g yarn && yarn install
```

### Reset Installation

**Clean Reset:**
```bash
make clean
# OR manually:
rm -rf node_modules backend/node_modules mobile/node_modules
rm -rf backend/dist mobile/dist
npm run setup
```

**Database Reset:**
```bash
cd backend
npx prisma migrate reset --force
```

## Docker Installation (Alternative)

### Full Docker Setup
```bash
# For WSL2 users (recommended approach)
sudo docker-compose up -d postgres redis

# For full Docker development (backend also in container)
docker-compose --profile development up -d

# Initialize database (if using full Docker setup)
docker-compose exec backend npm run db:migrate
docker-compose exec backend npm run db:seed
```

### Services URLs (Docker)
- **Backend:** http://localhost:3000
- **PostgreSQL:** localhost:5432
- **Redis:** localhost:6379  
- **pgAdmin:** http://localhost:5050 (admin@admin.com / admin)

### Docker Management Commands
```bash
# Start only databases (recommended for WSL2)
sudo docker-compose up -d postgres redis

# Stop all containers
docker-compose down

# Stop and remove all data (fresh start)
docker-compose down -v

# View container logs
docker-compose logs postgres
docker-compose logs redis

# Check container status
docker-compose ps
```

## Production Deployment

### Build for Production
```bash
# Backend build
npm run build:backend

# Mobile build (requires Expo account)
cd mobile
expo build:android
expo build:ios
```

### Environment Variables (Production)
Make sure to set production values:
- Use strong, unique JWT secrets
- Configure production database URLs
- Set up SSL certificates
- Configure production API keys

### Health Monitoring
Set up monitoring for:
- Application uptime
- Database connectivity
- API response times
- Error rates

## Next Steps

After successful installation:

1. **Configure Banking APIs** - Add your Singapore banking credentials
2. **Setup OCR Service** - Configure Google Cloud Vision API
3. **Test Core Features** - Create expenses, upload receipts, test calculations
4. **Setup Deployment** - Configure production environment
5. **Enable Monitoring** - Set up logging and error tracking

## Support

For installation issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review logs in `backend/logs/app.log`
3. Check GitHub issues for known problems
4. Create a new issue with detailed error information

**Log Locations:**
- Backend: `backend/logs/app.log`
- Mobile: Expo DevTools console
- Database: PostgreSQL logs (varies by system)