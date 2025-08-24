# Role-Based Access Control (RBAC) & Financial Security Agents

## 🔒 Financial Access Control Framework

### **Role Hierarchy & Financial Access Levels**

#### **1. Super Admin (Owner/Director)**
- **Financial Access**: FULL ACCESS
- **Permissions**: 
  - View all financial reports and ACRA filings
  - Access revenue, profit, and subscription analytics
  - Modify financial settings and tax configurations
  - Export financial data for audits
  - Configure payment gateways and billing

#### **2. Finance Manager**  
- **Financial Access**: OPERATIONAL ACCESS
- **Permissions**:
  - View revenue reports and subscription metrics
  - Generate ACRA compliance reports
  - Process refunds and billing adjustments
  - Access tax calculations and GST reports
  - **Cannot**: View profit margins, cost structure, or strategic financials

#### **3. Operations Admin**
- **Financial Access**: LIMITED OPERATIONAL
- **Permissions**:
  - View subscription status (active/inactive only)
  - Process basic user account management
  - Access support tickets and user communications
  - **Cannot**: View any revenue, financial reports, or billing details

#### **4. Customer Support**
- **Financial Access**: USER-SPECIFIC ONLY
- **Permissions**:
  - View individual user's subscription status
  - Process subscription cancellations (with approval)
  - Access billing history for support purposes
  - **Cannot**: View aggregate financials or other users' data

#### **5. Technical Admin**
- **Financial Access**: SYSTEM HEALTH ONLY
- **Permissions**:
  - Monitor payment gateway connectivity
  - View system performance metrics
  - Access technical logs (sanitized of financial data)
  - **Cannot**: View any financial data or user payment information

## 🛡️ RBAC Security Agents

### 1. **Financial Access Control Agent** (`financial-access-agent`)
**Responsibilities:**
- Enforce role-based financial data access
- Real-time permission validation
- Financial data masking and filtering
- Access attempt logging and monitoring

**Financial Data Classification:**
```typescript
enum FinancialDataLevel {
  PUBLIC = 0,           // Marketing data, feature lists
  OPERATIONAL = 1,      // Subscription counts, user metrics  
  CONFIDENTIAL = 2,     // Individual payment data, billing
  RESTRICTED = 3,       // Revenue reports, financial summaries
  TOP_SECRET = 4        // Profit margins, cost structure, strategic financials
}

interface RolePermissions {
  role: UserRole;
  maxFinancialLevel: FinancialDataLevel;
  allowedOperations: FinancialOperation[];
  restrictedEndpoints: string[];
  auditRequired: boolean;
}
```

### 2. **Data Masking Agent** (`data-masking-agent`)
**Responsibilities:**
- Dynamic financial data masking based on user role
- PII protection for non-authorized roles
- Revenue and financial metric obfuscation
- Secure data transmission filtering

**Masking Rules:**
```typescript
interface MaskingRules {
  customerSupport: {
    userPaymentMethods: 'last_4_digits_only',
    subscriptionAmount: 'visible',
    totalRevenue: 'hidden',
    userPersonalData: 'masked_except_support_fields'
  },
  operationsAdmin: {
    userPaymentMethods: 'hidden',
    subscriptionAmount: 'count_only',
    totalRevenue: 'hidden',
    userPersonalData: 'initials_only'
  },
  financeManager: {
    userPaymentMethods: 'full_except_cvv',
    subscriptionAmount: 'visible',
    totalRevenue: 'visible',
    profitMargins: 'hidden'
  }
}
```

### 3. **Financial Audit Agent** (`financial-audit-agent`)
**Responsibilities:**
- Log all financial data access attempts
- Monitor unauthorized access patterns
- Generate compliance audit trails
- Alert on suspicious financial data access

**Audit Requirements:**
```typescript
interface FinancialAuditLog {
  timestamp: Date;
  userId: string;
  userRole: UserRole;
  accessedData: FinancialDataType;
  dataLevel: FinancialDataLevel;
  endpoint: string;
  ipAddress: string;
  userAgent: string;
  businessJustification?: string;
  approvalRequired: boolean;
  approvedBy?: string;
  accessResult: 'granted' | 'denied' | 'masked';
}
```

## 🔐 Financial API Security Framework

### **Endpoint Security Configuration**
```typescript
// Financial endpoints with role-based access
const FINANCIAL_ENDPOINTS = {
  '/api/revenue/summary': {
    requiredRole: [UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER],
    dataLevel: FinancialDataLevel.RESTRICTED,
    auditRequired: true
  },
  '/api/subscription/metrics': {
    requiredRole: [UserRole.SUPER_ADMIN, UserRole.FINANCE_MANAGER, UserRole.OPERATIONS_ADMIN],
    dataLevel: FinancialDataLevel.OPERATIONAL,
    masking: {
      [UserRole.OPERATIONS_ADMIN]: ['amount', 'revenue', 'profit']
    }
  },
  '/api/acra/reports': {
    requiredRole: [UserRole.SUPER_ADMIN],
    dataLevel: FinancialDataLevel.TOP_SECRET,
    requiresJustification: true,
    approvalRequired: true
  },
  '/api/payment/gateways/config': {
    requiredRole: [UserRole.SUPER_ADMIN, UserRole.TECHNICAL_ADMIN],
    dataLevel: FinancialDataLevel.RESTRICTED,
    masking: {
      [UserRole.TECHNICAL_ADMIN]: ['api_keys', 'secrets', 'financial_metrics']
    }
  }
};
```

### **Middleware Stack for Financial Data Protection**
```typescript
// Authentication → Role Validation → Financial Access Check → Data Masking
const financialSecurityMiddleware = [
  authenticateUser,           // Verify JWT token
  validateUserRole,          // Check role permissions
  checkFinancialAccess,      // Validate financial data access
  logFinancialAccess,        // Audit trail logging
  maskFinancialData,         // Apply role-based masking
  rateLimitFinancialAPI      // Prevent data scraping
];

function checkFinancialAccess(req, res, next) {
  const { user, endpoint } = req;
  const endpointConfig = FINANCIAL_ENDPOINTS[endpoint];
  
  if (!endpointConfig) return next();
  
  // Check role permission
  if (!endpointConfig.requiredRole.includes(user.role)) {
    return res.status(403).json({
      error: 'Insufficient permissions for financial data access',
      required: endpointConfig.requiredRole,
      current: user.role
    });
  }
  
  // Log access attempt
  auditLogger.logFinancialAccess({
    userId: user.id,
    role: user.role,
    endpoint,
    timestamp: new Date(),
    dataLevel: endpointConfig.dataLevel
  });
  
  next();
}
```

## 🚨 Financial Security Hooks

### **Pre-Financial-Access Hook**
```bash
#!/usr/bin/env sh
# .husky/pre-financial-access

echo "🔒 Validating financial access controls..."

# 1. RBAC configuration validation
node scripts/security/validate-rbac-config.js

# 2. Financial endpoint security check
node scripts/security/validate-financial-endpoints.js

# 3. Data masking rules validation
node scripts/security/validate-data-masking.js

# 4. Audit trail integrity check
node scripts/security/validate-audit-trails.js

echo "✅ Financial access control validation complete!"
```

### **Financial Data Access Monitoring Hook**
```bash
#!/usr/bin/env sh
# .husky/post-financial-access

echo "📊 Monitoring financial data access..."

# 1. Detect unusual access patterns
node scripts/security/detect-unusual-access.js

# 2. Generate daily access reports
node scripts/security/generate-access-reports.js

# 3. Check for unauthorized access attempts
node scripts/security/check-unauthorized-attempts.js

# 4. Update security metrics
node scripts/security/update-security-metrics.js

echo "✅ Financial access monitoring complete!"
```

## 👥 Admin Hierarchy & Financial Separation

### **Organizational Structure**
```
🏢 Company Structure
├── 👑 Super Admin (You) - FULL FINANCIAL ACCESS
├── 💰 Finance Manager - OPERATIONAL FINANCIAL ACCESS
├── 🛠️ Operations Admin - NO FINANCIAL ACCESS (User management only)
├── 📞 Customer Support - USER-SPECIFIC BILLING ONLY
└── 🔧 Technical Admin - SYSTEM HEALTH ONLY (No financial data)
```

### **Financial Data Segregation Rules**
1. **Revenue & Profit Data**: Super Admin ONLY
2. **ACRA Reports**: Super Admin + Finance Manager ONLY  
3. **Subscription Metrics**: Super Admin + Finance Manager + Operations (counts only)
4. **Individual Billing**: Support can see specific user billing for support purposes
5. **Payment Gateway Config**: Super Admin + Technical Admin (API keys masked for tech admin)

### **Implementation Example**
```typescript
// Database schema for role-based access
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  role        UserRole @default(USER)
  permissions Json     @default("{}") // Fine-grained permissions
  
  // Financial access tracking
  lastFinancialAccess    DateTime?
  financialAccessLevel   Int       @default(0)
  requiresApproval       Boolean   @default(false)
  approvedBy            String?
  
  @@map("users")
}

enum UserRole {
  USER                // App users
  CUSTOMER_SUPPORT    // Support team - user billing only
  OPERATIONS_ADMIN    // Operations - no financial data
  TECHNICAL_ADMIN     // Tech team - system health only
  FINANCE_MANAGER     // Finance team - operational financial data
  SUPER_ADMIN         // You - full financial access
}
```

This ensures that when you hire admins, they can manage operations effectively while keeping all financial data secure and accessible only to authorized roles! 🔒💰