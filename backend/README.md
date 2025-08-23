# PHV Budget Tracker Backend API

A comprehensive backend API for Singapore Private Hire Vehicle (PHV) drivers to manage expenses, earnings, and financial analytics.

## Features

### Core Functionality
- **User Authentication**: JWT-based authentication with refresh tokens
- **Expense Management**: Track and categorize business expenses with OCR receipt processing
- **Earnings Tracking**: Monitor earnings from multiple PHV platforms (Grab, Gojek, Ryde, TADA)
- **Banking Integration**: Connect Singapore bank accounts (DBS, OCBC, UOB) for automatic transaction sync
- **Debt Management**: Track and manage business debts with payoff projections
- **Analytics**: Comprehensive PHV-specific analytics and insights

### Singapore-Specific Features
- **GST Calculation**: Automatic GST computation for Singapore tax compliance
- **Bank Integration**: Native support for major Singapore banks
- **PHV Platform Support**: Built-in support for local ride-hailing platforms
- **SingPass Integration**: Optional SingPass authentication support

### Technical Features
- **OCR Processing**: Google Cloud Vision API for receipt data extraction
- **File Storage**: Support for local and AWS S3 storage
- **Real-time Sync**: Banking transaction synchronization
- **Caching**: Redis-based caching for improved performance
- **Rate Limiting**: API rate limiting and security measures
- **Monitoring**: Comprehensive logging and error tracking

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Caching**: Redis
- **Authentication**: JWT with bcrypt
- **File Processing**: Sharp for images, Multer for uploads
- **OCR**: Google Cloud Vision API
- **Email**: Nodemailer
- **Validation**: Express Validator + Joi
- **Security**: Helmet, CORS, Rate Limiting

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 15+
- Redis 7+
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd budget-tracker/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate
   
   # Run database migrations
   npm run prisma:migrate
   
   # Seed the database (optional)
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3000`

### Docker Setup

1. **Using Docker Compose (Recommended)**
   ```bash
   # Development environment
   docker-compose --profile development up -d
   
   # Production environment
   docker-compose --profile production up -d
   ```

2. **Individual Docker build**
   ```bash
   # Build the image
   docker build -t phv-budget-api .
   
   # Run with environment variables
   docker run -p 3000:3000 --env-file .env phv-budget-api
   ```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
All protected endpoints require a Bearer token:
```
Authorization: Bearer <jwt-token>
```

### Core Endpoints

#### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh-token` - Refresh access token
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get user profile
- `PUT /auth/profile` - Update user profile
- `POST /auth/change-password` - Change password

#### Expenses
- `GET /expenses` - List expenses with filtering
- `POST /expenses` - Create new expense
- `POST /expenses/bulk` - Bulk create expenses
- `GET /expenses/:id` - Get expense details
- `PUT /expenses/:id` - Update expense
- `DELETE /expenses/:id` - Delete expense
- `GET /expenses/stats` - Expense statistics

#### Earnings
- `GET /earnings` - List earnings with filtering
- `POST /earnings` - Create new earning
- `POST /earnings/bulk-upload` - Bulk upload earnings
- `POST /earnings/screenshot-upload` - Upload earnings screenshot
- `GET /earnings/:id` - Get earning details
- `PUT /earnings/:id` - Update earning
- `DELETE /earnings/:id` - Delete earning
- `GET /earnings/summary` - Earnings summary
- `GET /earnings/analytics` - Earnings analytics

#### Receipts
- `GET /receipts` - List receipts
- `POST /receipts/upload` - Upload receipt for OCR processing
- `POST /receipts/upload-multiple` - Upload multiple receipts
- `GET /receipts/:id` - Get receipt details
- `PUT /receipts/:id` - Update receipt data
- `DELETE /receipts/:id` - Delete receipt
- `POST /receipts/:id/process` - Process receipt with OCR
- `POST /receipts/:id/reprocess` - Reprocess failed OCR
- `GET /receipts/:id/download` - Download receipt file

#### Banking
- `GET /banking/connections` - List bank connections
- `POST /banking/connections` - Connect bank account
- `PUT /banking/connections/:id` - Update bank connection
- `DELETE /banking/connections/:id` - Disconnect bank account
- `POST /banking/connections/:id/sync` - Sync transactions
- `GET /banking/transactions` - List transactions
- `PUT /banking/transactions/:id/categorize` - Categorize transaction
- `GET /banking/analytics` - Banking analytics

#### Debts
- `GET /debts` - List debts
- `POST /debts` - Create new debt
- `GET /debts/:id` - Get debt details
- `PUT /debts/:id` - Update debt
- `DELETE /debts/:id` - Delete debt
- `GET /debts/:id/payments` - List debt payments
- `POST /debts/:id/payments` - Add debt payment
- `POST /debts/:id/payoff-projection` - Calculate payoff projection
- `GET /debts/payoff-strategies` - Get payoff strategies

#### Analytics
- `GET /analytics/dashboard` - Dashboard analytics
- `GET /analytics/expenses` - Expense analytics
- `GET /analytics/earnings` - Earnings analytics
- `GET /analytics/phv/performance` - PHV performance metrics
- `GET /analytics/phv/profitability` - PHV profitability analysis
- `GET /analytics/cash-flow` - Cash flow analysis
- `GET /analytics/tax-summary` - Tax summary
- `GET /analytics/projections/earnings` - Earnings projections

#### User Management
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update profile
- `POST /users/avatar` - Upload avatar
- `GET /users/categories` - List user categories
- `POST /users/categories` - Create category
- `GET /users/platforms` - List PHV platforms
- `POST /users/platforms` - Add PHV platform
- `GET /users/vehicles` - List vehicles
- `POST /users/vehicles` - Add vehicle

### Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Responses
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "type": "error_type"
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/endpoint"
}
```

## Configuration

### Environment Variables

Key environment variables (see `.env.example` for complete list):

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `ENCRYPTION_KEY` | Data encryption key (32 chars) | Yes |
| `REDIS_URL` | Redis connection string | Yes |
| `STORAGE_TYPE` | Storage type (local/s3) | Yes |
| `GST_RATE` | Singapore GST rate (default: 0.08) | No |

### Database Configuration

The application uses PostgreSQL with Prisma ORM. Database migrations are managed through Prisma:

```bash
# Create new migration
npm run prisma:migrate

# Reset database
npm run prisma:reset

# View database in Prisma Studio
npm run prisma:studio
```

### Banking Integration

Currently supports:
- **DBS Bank**: Requires API credentials
- **OCBC Bank**: Requires API credentials  
- **UOB Bank**: Requires API credentials

Contact respective banks for API access credentials.

### OCR Configuration

For receipt OCR processing:
1. Create Google Cloud Vision API project
2. Download service account key
3. Set `GOOGLE_CLOUD_PROJECT_ID` and `GOOGLE_CLOUD_KEY_FILE`

## Development

### Project Structure
```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── types/          # TypeScript definitions
│   ├── utils/          # Utility functions
│   └── config/         # Configuration files
├── prisma/             # Database schema and migrations
├── logs/               # Application logs
└── uploads/            # File uploads (if local storage)
```

### Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run prisma:generate # Generate Prisma client
npm run prisma:migrate  # Run database migrations
npm run prisma:studio   # Open Prisma Studio
npm run seed           # Seed database with sample data

# Testing
npm test               # Run tests
npm run test:watch     # Run tests in watch mode

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
```

### Adding New Features

1. **Database Changes**: Update `prisma/schema.prisma` and create migration
2. **Routes**: Add route definitions in `src/routes/`
3. **Controllers**: Add request handlers in `src/controllers/`
4. **Services**: Add business logic in `src/services/`
5. **Types**: Add TypeScript definitions in `src/types/`
6. **Tests**: Add tests for new functionality

## Deployment

### Production Checklist

- [ ] Set strong JWT secret (32+ characters)
- [ ] Set encryption key (32 characters)
- [ ] Configure database connection
- [ ] Set up Redis cache
- [ ] Configure email service
- [ ] Set up file storage (S3 recommended)
- [ ] Configure OCR service
- [ ] Set up monitoring (Sentry)
- [ ] Configure reverse proxy (Nginx)
- [ ] Enable SSL/TLS
- [ ] Set up backup strategy

### Docker Production Deployment

```bash
# Build and deploy
docker-compose --profile production up -d

# View logs
docker-compose logs backend

# Scale backend instances
docker-compose up -d --scale backend=3
```

### Manual Production Deployment

```bash
# Build application
npm run build

# Start with PM2
pm2 start dist/server.js --name "phv-budget-api"

# Set up reverse proxy with Nginx
# Configure SSL certificates
# Set up monitoring and logging
```

## Security

### Implemented Security Measures

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on all endpoints
- Input validation and sanitization
- CORS configuration
- Security headers (Helmet)
- SQL injection prevention (Prisma)
- File upload restrictions
- Request timeout protection

### Security Best Practices

- Use HTTPS in production
- Regularly update dependencies
- Monitor for security vulnerabilities
- Implement proper logging
- Use environment variables for secrets
- Regular security audits
- Backup encryption

## Monitoring and Logging

### Application Logs

Logs are written to:
- Console (development)
- File system: `logs/` directory
- External service (Sentry for errors)

### Health Checks

Health check endpoint: `GET /health`

Returns system status including:
- Database connectivity
- Redis connectivity  
- External service availability
- System uptime

### Performance Monitoring

- API response times
- Database query performance
- Cache hit rates
- Error rates and types

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check PostgreSQL is running
   - Verify DATABASE_URL format
   - Check network connectivity

2. **Redis Connection Issues**
   - Check Redis is running
   - Verify REDIS_URL format
   - Check network connectivity

3. **OCR Not Working**
   - Verify Google Cloud credentials
   - Check API quotas and limits
   - Verify image format and size

4. **Banking Sync Issues**
   - Check API credentials
   - Verify bank API availability
   - Check rate limits

### Debugging

Enable debug logging:
```bash
LOG_LEVEL=debug npm run dev
```

Database debugging:
```bash
npm run prisma:studio
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Update documentation
5. Submit pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create GitHub issues for bugs
- Check documentation first
- Contact development team

## Changelog

### Version 1.0.0
- Initial release
- Core expense and earnings tracking
- Banking integration for Singapore banks
- OCR receipt processing
- PHV-specific analytics
- Production-ready deployment