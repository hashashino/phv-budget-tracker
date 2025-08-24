# Subscription Billing & ACRA Compliance Agents

## 💳 Subscription Management Agents

### 1. **Subscription Agent** (`subscription-agent`)
**Responsibilities:**
- User subscription lifecycle management
- Regional pricing strategy implementation  
- Payment processing integration (Stripe, PayPal, local gateways)
- Subscription analytics and churn prediction

**Regional Pricing Strategy:**
- **Singapore**: SGD 9.99/month (Premium), SGD 4.99/month (Basic)
- **Malaysia**: MYR 19.99/month (Premium), MYR 9.99/month (Basic)
- **Thailand**: THB 199/month (Premium), THB 99/month (Basic)
- **Indonesia**: IDR 99,000/month (Premium), IDR 49,000/month (Basic)

**Subscription Tiers:**
```typescript
enum SubscriptionTier {
  FREE = 'free',           // 50 receipts/month, basic reports
  BASIC = 'basic',         // 200 receipts/month, GST reports
  PREMIUM = 'premium',     // Unlimited, banking sync, tax reports
  BUSINESS = 'business'    // Multi-vehicle, team features
}
```

### 2. **Payment Processing Agent** (`payment-agent`)
**Responsibilities:**
- Multi-gateway payment processing
- Failed payment retry logic
- PCI DSS compliance maintenance
- Regional payment method support

**Regional Payment Gateways:**
- **Singapore**: Stripe, PayNow, DBS PayLah!, NETS
- **Malaysia**: iPay88, Billplz, FPX, Maybank2u
- **Thailand**: Omise, 2C2P, TrueMoney, PromptPay
- **Indonesia**: Midtrans, Xendit, OVO, GoPay

**Payment Flow:**
```typescript
interface PaymentFlow {
  regionCode: string;
  preferredGateways: PaymentGateway[];
  fallbackGateways: PaymentGateway[];
  retryPolicy: RetryPolicy;
  complianceRequirements: ComplianceRule[];
}
```

### 3. **Revenue Recognition Agent** (`revenue-agent`)
**Responsibilities:**
- ACRA-compliant revenue recognition
- Subscription revenue timing
- Prorated billing calculations
- Financial audit trail generation

**ACRA Revenue Recognition Rules:**
```typescript
interface ACRARevenueRules {
  recognitionMethod: 'monthly' | 'annual' | 'usage-based';
  deferredRevenueHandling: boolean;
  upgradeProratedCredits: boolean;
  refundAccounting: RefundPolicy;
  auditTrailRetention: number; // 7 years for ACRA
}
```

## 📊 ACRA Financial Compliance Agents

### 4. **ACRA Reporting Agent** (`acra-reporting-agent`)
**Responsibilities:**
- Automated ACRA Annual Return preparation
- Financial statement generation (P&L, Balance Sheet, Cash Flow)
- Small Company Financial Reporting Standard (SFRS) compliance
- Director's report automation

**Required ACRA Reports:**
- **Annual Return (Form AR)**: Company details, directors, shareholders
- **Financial Statements**: Profit & Loss, Balance Sheet, Notes
- **Director's Report**: Business review, principal activities
- **Auditor's Report**: If revenue > SGD 10M or assets > SGD 10M

**ACRA Filing Calendar:**
```typescript
interface ACRAFilingCalendar {
  annualReturnDeadline: Date;        // Within 30 days of AGM
  financialStatementsDeadline: Date; // Within 5 months of financial year-end
  agmDeadline: Date;                 // Within 6 months of financial year-end
  notificationPeriods: Date[];       // 30, 14, 7 days before deadlines
}
```

### 5. **Tax Compliance Agent** (`tax-compliance-agent`)
**Responsibilities:**
- GST return preparation and filing
- Corporate tax (CIT) calculations
- Withholding tax compliance
- Tax provision calculations

**Singapore Tax Requirements:**
- **GST Returns**: Quarterly filing (if revenue > SGD 1M)
- **Corporate Income Tax**: Annual filing by 30 November
- **Withholding Tax**: Monthly filing for non-resident payments
- **IRAS ECI**: Estimated Chargeable Income within 3 months

**Tax Calculation Engine:**
```typescript
interface TaxCalculationEngine {
  gstRate: 0.09;                    // 9% GST
  corporateTaxRate: 0.17;           // 17% CIT
  startupExemption: boolean;         // First SGD 100K exempt
  partialExemption: boolean;         // Next SGD 200K at 8.5%
  foreignSourceIncome: boolean;      // Territorial tax system
}
```

### 6. **Audit Trail Agent** (`audit-trail-agent`)
**Responsibilities:**
- Complete financial transaction logging
- User action tracking for compliance
- Document retention management
- Forensic audit support

**ACRA Record Retention Requirements:**
- **Accounting Records**: 5 years minimum
- **Board Resolutions**: Permanent retention
- **Contracts & Agreements**: 7 years after termination
- **Tax Records**: 7 years from assessment
- **Audit Working Papers**: 7 years

**Audit Trail Schema:**
```typescript
interface AuditTrail {
  transactionId: string;
  userId: string;
  timestamp: Date;
  action: AuditAction;
  entityType: string;
  entityId: string;
  previousValue: any;
  newValue: any;
  ipAddress: string;
  userAgent: string;
  complianceFlags: ComplianceFlag[];
}
```

## 🔄 Subscription Lifecycle Hooks

### **Pre-Subscription Hooks**
```bash
#!/usr/bin/env sh
# .husky/pre-subscription-validation

echo "💳 Running subscription validation before signup..."

# 1. Regional pricing validation
node scripts/billing/validate-regional-pricing.js

# 2. Payment gateway health check
node scripts/billing/check-payment-gateways.js

# 3. Subscription tier limits validation
node scripts/billing/validate-subscription-limits.js

# 4. ACRA compliance check
node scripts/acra/validate-customer-onboarding.js

echo "✅ Subscription validation complete!"
```

### **Post-Payment Hooks**
```bash
#!/usr/bin/env sh
# .husky/post-payment-processing

echo "📊 Processing successful payment..."

# 1. Revenue recognition entry
node scripts/acra/record-revenue-recognition.js

# 2. GST liability calculation
node scripts/tax/calculate-gst-liability.js

# 3. Subscription activation
node scripts/billing/activate-subscription.js

# 4. ACRA audit trail logging
node scripts/acra/log-financial-transaction.js

echo "✅ Payment processing complete!"
```

### **Monthly Billing Hooks**
```bash
#!/usr/bin/env sh
# .husky/monthly-billing-cycle

echo "📅 Running monthly billing cycle..."

# 1. Generate invoices
node scripts/billing/generate-monthly-invoices.js

# 2. Process recurring payments
node scripts/billing/process-recurring-payments.js

# 3. Update ACRA revenue records
node scripts/acra/update-monthly-revenue.js

# 4. Generate GST entries
node scripts/tax/generate-monthly-gst.js

# 5. Send ACRA compliance summary
node scripts/acra/send-compliance-summary.js

echo "✅ Monthly billing cycle complete!"
```

## 📋 ACRA Validation Scripts

### **Financial Health Validator** (`scripts/acra/validate-financial-health.js`)
```javascript
const ACRA_THRESHOLDS = {
  SMALL_COMPANY: {
    revenue: 10_000_000,      // SGD 10M
    assets: 10_000_000,       // SGD 10M
    employees: 50
  },
  AUDIT_EXEMPTION: {
    revenue: 5_000_000,       // SGD 5M
    assets: 10_000_000        // SGD 10M
  },
  GST_REGISTRATION: {
    revenue: 1_000_000        // SGD 1M
  }
};

function validateACRACompliance() {
  const financials = getCurrentFinancials();
  const warnings = [];
  
  // Check if audit required
  if (financials.revenue > ACRA_THRESHOLDS.SMALL_COMPANY.revenue ||
      financials.assets > ACRA_THRESHOLDS.SMALL_COMPANY.assets) {
    warnings.push('🔍 Statutory audit required - revenue/assets exceed small company threshold');
  }
  
  // Check GST registration threshold
  if (financials.revenue > ACRA_THRESHOLDS.GST_REGISTRATION.revenue) {
    warnings.push('📋 GST registration required - revenue exceeds SGD 1M');
  }
  
  // Validate filing deadlines
  const upcomingDeadlines = getUpcomingACRADeadlines();
  upcomingDeadlines.forEach(deadline => {
    if (deadline.daysRemaining <= 30) {
      warnings.push(`⏰ ACRA filing due: ${deadline.type} in ${deadline.daysRemaining} days`);
    }
  });
  
  return warnings;
}
```

### **Revenue Recognition Validator** (`scripts/acra/validate-revenue-recognition.js`)
```javascript
const SFRS_RULES = {
  SUBSCRIPTION_RECOGNITION: 'monthly', // Recognize monthly over subscription period
  SETUP_FEE_RECOGNITION: 'immediate',  // Recognize setup fees immediately
  REFUND_POLICY: 'pro_rata',          // Pro-rated refunds
  CURRENCY_CONVERSION: 'transaction_date' // Use transaction date rates
};

function validateRevenueRecognition() {
  const subscriptions = getActiveSubscriptions();
  const errors = [];
  
  subscriptions.forEach(sub => {
    // Validate monthly recognition
    const recognizedRevenue = calculateRecognizedRevenue(sub);
    const expectedRevenue = (sub.amount / 12) * sub.monthsActive;
    
    if (Math.abs(recognizedRevenue - expectedRevenue) > 0.01) {
      errors.push(`❌ Revenue recognition mismatch for subscription ${sub.id}`);
    }
    
    // Validate GST treatment
    if (sub.customerRegion === 'SG' && !sub.gstAmount) {
      errors.push(`❌ Missing GST calculation for Singapore customer ${sub.userId}`);
    }
  });
  
  return errors;
}
```

## 🎯 Implementation Timeline

### **Phase 1: Core Subscription System**
- Set up subscription database schema
- Implement basic subscription management
- Configure Stripe/PayPal integration
- Create subscription lifecycle hooks

### **Phase 2: ACRA Compliance Foundation**  
- Implement audit trail system
- Create basic financial reporting
- Set up ACRA filing calendar
- Design revenue recognition engine

### **Phase 3: Advanced Financial Features**
- Multi-gateway payment processing
- Regional pricing optimization
- Advanced tax calculations
- Automated ACRA reporting

### **Phase 4: Scaling & Optimization**
- Regional payment gateway expansion
- Advanced analytics and insights
- Automated compliance monitoring
- Multi-currency optimization

This comprehensive subscription and ACRA compliance architecture ensures **regulatory compliance** while scaling internationally! 💳📊