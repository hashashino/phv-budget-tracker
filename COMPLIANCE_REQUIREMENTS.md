# PHV Budget Tracker - Compliance & Financial Requirements

## 🇸🇬 Singapore ACRA Compliance Framework

### **Company Registration & Filing Requirements**
- **Entity Type**: Private Limited Company (Pte Ltd)
- **ACRA Registration**: Required before business operations
- **UEN Number**: Unique Entity Number for all official documents
- **Registered Address**: Singapore business address mandatory

### **Mandatory ACRA Filings**
| Filing Type | Deadline | Description |
|------------|----------|-------------|
| **Annual Return (AR)** | Within 30 days of AGM | Company details, directors, shareholders |
| **Financial Statements** | Within 5 months of FY-end | P&L, Balance Sheet, Cash Flow, Notes |
| **Audited Accounts** | If revenue > SGD 10M | Independent auditor's report required |
| **AGM Notice** | Within 6 months of FY-end | Annual General Meeting mandatory |

### **Small Company Financial Reporting Standard (SFRS)**
- **Applicable**: Companies with revenue < SGD 10M and assets < SGD 10M
- **Simplified Reporting**: Reduced disclosure requirements
- **Audit Exemption**: Available if revenue < SGD 5M and assets < SGD 10M

## 💰 Revenue Recognition & Subscription Billing Compliance

### **SFRS Revenue Recognition Rules**
```typescript
interface RevenueRecognitionRules {
  subscriptionFees: {
    method: 'monthly_recognition',
    period: 'over_subscription_term',
    currency: 'functional_currency', // SGD for Singapore entity
    timing: 'accrual_basis'
  },
  setupFees: {
    method: 'immediate_recognition',
    condition: 'upon_service_delivery'
  },
  refunds: {
    method: 'reverse_recognition',
    timing: 'when_refund_processed'
  }
}
```

### **Multi-Country Revenue Allocation**
- **Singapore Entity**: Primary revenue booking entity
- **Regional Markets**: Branch offices or subsidiary structure
- **Transfer Pricing**: Arm's length pricing for inter-entity transactions
- **Tax Allocation**: Based on substance and economic activity

## 🧾 Singapore Tax Compliance Requirements

### **Goods & Services Tax (GST) - 9%**
- **Registration Threshold**: Annual turnover > SGD 1,000,000
- **Filing Frequency**: Quarterly returns
- **Payment Due**: 1 month after quarter-end
- **Digital Services**: Subject to GST for Singapore consumers

```typescript
interface GSTCalculation {
  standardRate: 0.09,
  zeroRated: ['exports', 'international_transport'],
  exempt: ['financial_services', 'residential_property'],
  digitalServices: {
    rate: 0.09,
    threshold: 100000, // SGD annual B2C sales
    registration: 'mandatory_if_threshold_exceeded'
  }
}
```

### **Corporate Income Tax (CIT) - 17%**
- **Standard Rate**: 17% on chargeable income
- **Startup Exemption**: First SGD 100,000 fully exempt (first 3 consecutive years)
- **Partial Exemption**: Next SGD 200,000 taxed at 8.5%
- **Filing Deadline**: By 30 November following year of assessment

```typescript
interface CITCalculation {
  standardRate: 0.17,
  startupExemption: {
    amount: 100000,
    rate: 0,
    eligibility: 'first_3_consecutive_years'
  },
  partialExemption: {
    amount: 200000,
    rate: 0.085,
    condition: 'all_companies'
  }
}
```

## 🔐 Role-Based Financial Access Control

### **Financial Data Classification**
```typescript
enum FinancialAccessLevel {
  PUBLIC = 0,           // Marketing metrics, user counts
  OPERATIONAL = 1,      // Subscription metrics, support data
  CONFIDENTIAL = 2,     // Individual billing, payment methods  
  RESTRICTED = 3,       // Revenue reports, tax filings
  TOP_SECRET = 4        // Profit margins, strategic financials
}
```

### **Admin Role Financial Permissions**
| Role | Financial Access Level | Permissions | Restrictions |
|------|----------------------|-------------|--------------|
| **Super Admin (Owner)** | TOP_SECRET (4) | Full financial access, ACRA filings | None |
| **Finance Manager** | RESTRICTED (3) | Revenue reports, tax calculations | No profit margins/cost structure |
| **Operations Admin** | OPERATIONAL (1) | User management, subscription counts | No financial data |
| **Customer Support** | CONFIDENTIAL (2) | User-specific billing support | No aggregate financials |
| **Technical Admin** | PUBLIC (0) | System health, performance metrics | No financial/user data |

### **Data Masking Rules**
```typescript
interface DataMaskingConfig {
  operations_admin: {
    revenue_data: 'HIDDEN',
    user_payment_methods: 'HIDDEN',
    subscription_amounts: 'COUNT_ONLY'
  },
  customer_support: {
    revenue_data: 'HIDDEN',
    user_payment_methods: 'LAST_4_DIGITS_ONLY',
    subscription_amounts: 'VISIBLE_FOR_SUPPORT_CONTEXT'
  },
  technical_admin: {
    all_financial_data: 'HIDDEN',
    system_performance: 'VISIBLE',
    user_data: 'ANONYMIZED_ONLY'
  }
}
```

## 📊 Audit Trail & Compliance Monitoring

### **ACRA Record Retention Requirements**
- **Accounting Records**: Minimum 5 years after transaction
- **Board Meeting Minutes**: Permanent retention
- **Statutory Registers**: Permanent retention  
- **Contracts & Agreements**: 7 years after expiry
- **Tax Records**: 7 years from assessment date

### **Financial Audit Trail Schema**
```typescript
interface FinancialAuditLog {
  transaction_id: string,
  user_id: string,
  user_role: UserRole,
  timestamp: ISO8601,
  action: AuditAction,
  financial_data_accessed: FinancialDataType,
  data_classification_level: FinancialAccessLevel,
  business_justification: string,
  approval_required: boolean,
  approved_by: string | null,
  ip_address: string,
  user_agent: string,
  session_id: string
}
```

## 🌏 International Expansion Compliance Framework

### **Regional Compliance Requirements**
| Country | Entity Structure | Tax Requirements | Financial Reporting |
|---------|------------------|------------------|-------------------|
| **Malaysia** | Sdn Bhd subsidiary | SST (6%), CIT (24%) | Companies Commission |
| **Thailand** | Thai subsidiary | VAT (7%), CIT (20%) | Ministry of Commerce |
| **Indonesia** | PT subsidiary | PPN (11%), CIT (22%) | Ministry of Law |
| **Australia** | Pty Ltd subsidiary | GST (10%), CIT (30%) | ASIC filing |

### **Cross-Border Transfer Pricing**
```typescript
interface TransferPricingPolicy {
  licensing_fees: {
    rate: '3-5%_of_regional_revenue',
    documentation: 'annual_transfer_pricing_study',
    compliance: 'OECD_guidelines'
  },
  management_fees: {
    rate: '2-4%_of_regional_revenue', 
    services: ['finance', 'hr', 'technology', 'marketing'],
    documentation: 'service_agreements'
  },
  cost_allocation: {
    method: 'activity_based_costing',
    allocation_keys: ['headcount', 'revenue', 'usage_metrics']
  }
}
```

## 🚀 Implementation Validation Commands

### **Daily Compliance Checks**
```bash
# Full compliance validation
npm run compliance:full

# ACRA-specific validation  
npm run validate:acra-compliance
npm run validate:financial-reports
npm run validate:revenue-recognition

# Security and access control
npm run security:validate
npm run validate:rbac-config
npm run validate:audit-trail

# Tax compliance validation
npm run validate:tax-calculations
npm run validate:subscription-pricing
```

### **Pre-Deployment Compliance Hooks**
```bash
# Before any financial feature deployment
.husky/pre-billing-validation

# Before onboarding new admin staff
.husky/post-admin-onboarding

# Monthly financial close process
.husky/monthly-billing-cycle
```

This comprehensive compliance framework ensures **regulatory adherence** while maintaining **financial data security** for all admin roles! 🛡️📊