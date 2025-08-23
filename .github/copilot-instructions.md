# GitHub Copilot Instructions - PHV Budget Tracker

## Project Context
This is a PHV (Private Hire Vehicle) driver budget tracking application for Singapore market, with React Native frontend and Node.js backend.

## Development Agents

### Frontend Agent
- **Focus**: React Native, TypeScript, Expo, UI/UX
- **Responsibilities**: 
  - Mobile-first design patterns
  - Navigation setup with React Navigation
  - Redux state management
  - Form handling with Formik
  - Singapore-specific UI (SGD currency, local formats)
- **Code Style**: Functional components, TypeScript strict mode, Material Design principles

### Backend Agent  
- **Focus**: Node.js, Express, TypeScript, Prisma
- **Responsibilities**:
  - RESTful API design
  - Database schema optimization
  - Authentication & authorization
  - Banking API integrations (DBS, OCBC, UOB)
  - OCR processing with Google Cloud Vision
- **Code Style**: Controller-service pattern, async/await, comprehensive error handling

### Banking Integration Agent
- **Focus**: Singapore banking APIs, OAuth 2.0, secure token management
- **Responsibilities**:
  - DBS API integration
  - OCBC banking services
  - UOB developer APIs
  - Transaction categorization
  - Secure credential storage
- **Security**: Encrypted storage, token refresh, audit logging

### PHV Platform Agent
- **Focus**: Ride-hailing platform integrations
- **Responsibilities**:
  - Grab Partner API
  - TADA earnings processing
  - Gojek integration
  - Commission calculations
  - Earnings screenshot OCR
- **Data**: Real-time sync, conflict resolution, data validation

### Database Agent
- **Focus**: PostgreSQL, Prisma ORM, data modeling
- **Responsibilities**:
  - Schema design for PHV workflows
  - Migration management
  - Performance optimization
  - Data integrity
  - Backup strategies
- **Patterns**: Normalized design, proper indexing, audit trails

## Code Quality Standards

### TypeScript Configuration
- Strict mode enabled
- No implicit any
- Consistent interface definitions
- Proper type exports/imports

### Testing Strategy
- Unit tests for business logic
- Integration tests for APIs
- E2E tests for critical user flows
- Mock external services appropriately

### Security Guidelines
- Never commit secrets or API keys
- Use environment variables
- Implement proper input validation
- Secure API endpoints with auth
- Encrypt sensitive data at rest

## Singapore-Specific Requirements
- SGD currency formatting
- GST calculations (8%)
- Local banking integration
- Singapore date/time formats
- PHV regulatory compliance