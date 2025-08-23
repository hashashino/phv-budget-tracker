#!/bin/bash

# PHV Budget Tracker Development Setup Script

echo "🚗 Setting up PHV Budget Tracker development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
echo -e "${BLUE}Checking dependencies...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm not found. Please install npm${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${YELLOW}⚠️  Docker not found. Database services will need manual setup${NC}"
fi

echo -e "${GREEN}✅ Dependencies check complete${NC}"

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd backend && npm install
cd ..
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Set up git hooks
echo -e "${BLUE}Setting up git hooks...${NC}"
npx husky install
echo -e "${GREEN}✅ Git hooks configured${NC}"

# Create environment files
echo -e "${BLUE}Creating environment files...${NC}"

# Backend environment
if [ ! -f backend/.env ]; then
    cat > backend/.env << EOF
NODE_ENV=development
DATABASE_URL=postgresql://phv_user:phv_password_dev@localhost:5432/phv_budget_tracker
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret-change-in-production
ENCRYPTION_KEY=your-32-char-encryption-key-here
PORT=3000
FRONTEND_URL=http://localhost:8081

# Storage Configuration
STORAGE_TYPE=local
UPLOAD_PATH=./uploads

# Singapore Configuration
GST_RATE=0.08

# Google Cloud Vision (for OCR)
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEY_FILE=path/to/service-account.json

# Banking API Keys (obtain from respective developer portals)
DBS_API_KEY=your-dbs-api-key
OCBC_API_KEY=your-ocbc-api-key  
UOB_API_KEY=your-uob-api-key

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=PHV Budget Tracker <noreply@phvbudget.com>

LOG_LEVEL=debug
EOF
    echo -e "${GREEN}✅ Backend environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  Backend .env file already exists${NC}"
fi

# Frontend environment  
if [ ! -f .env ]; then
    cat > .env << EOF
# API Configuration
API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_API_URL=http://localhost:3000

# Development Configuration
EXPO_DEVTOOLS=true
EOF
    echo -e "${GREEN}✅ Frontend environment file created${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend .env file already exists${NC}"
fi

echo -e "${GREEN}🎉 Development environment setup complete!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Start database: ${YELLOW}make docker-up${NC} or ${YELLOW}docker compose up -d${NC}"
echo -e "2. Run migrations: ${YELLOW}cd backend && npx prisma migrate dev${NC}"
echo -e "3. Start backend: ${YELLOW}cd backend && npm run dev${NC}"
echo -e "4. Start frontend: ${YELLOW}npm run start${NC}"
echo ""
echo -e "${BLUE}For PHV-specific setup:${NC}"
echo -e "1. Configure banking API credentials in backend/.env"
echo -e "2. Set up Google Cloud Vision for OCR"
echo -e "3. Test with sample receipts and earnings data"
EOF