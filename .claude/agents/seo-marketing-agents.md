# SEO & Marketing Agents Architecture

## 🔍 SEO Agents for Regional Landing Pages

### 1. **SEO Content Agent** (`seo-content-agent`)
**Responsibilities:**
- Generate SEO-optimized content for each region
- Keyword research and optimization for PHV/ride-hailing terms
- Meta descriptions and title tags for regional markets
- Local search optimization (Singapore PHV, Malaysia e-hailing, etc.)

**Regional SEO Keywords:**
- **Singapore**: "PHV budget tracker", "Grab driver expenses", "GST calculator Singapore"
- **Malaysia**: "e-hailing budget app", "SST calculator Malaysia", "Grab driver Malaysia"
- **Thailand**: "รถแท็กซี่ แอป งบประมาณ", "Grab driver Thailand", "VAT calculator"
- **Indonesia**: "aplikasi budget driver online", "pajak PPN Indonesia"

### 2. **Technical SEO Agent** (`technical-seo-agent`)
**Responsibilities:**
- Page speed optimization for all regional landing pages
- Mobile-first indexing compliance
- Core Web Vitals optimization
- Schema markup for app downloads and reviews

**Technical Requirements:**
- **Page Speed**: <3 seconds LCP for mobile
- **CLS**: <0.1 cumulative layout shift
- **FID**: <100ms first input delay
- **Mobile Score**: 90+ on Google PageSpeed Insights

### 3. **International SEO Agent** (`international-seo-agent`)
**Responsibilities:**
- hreflang implementation for multi-country targeting
- Regional domain strategy (sg.phvbudget.com, my.phvbudget.com)
- Geo-targeting setup in Google Search Console
- Currency and language markup

**Hreflang Structure:**
```html
<link rel="alternate" hreflang="en-sg" href="https://sg.phvbudget.com" />
<link rel="alternate" hreflang="en-my" href="https://my.phvbudget.com" />
<link rel="alternate" hreflang="ms-my" href="https://my.phvbudget.com/ms" />
<link rel="alternate" hreflang="th-th" href="https://th.phvbudget.com" />
<link rel="alternate" hreflang="id-id" href="https://id.phvbudget.com" />
```

### 4. **Local SEO Agent** (`local-seo-agent`)
**Responsibilities:**
- Google My Business optimization for each region
- Local directory submissions (Singapore Yellow Pages, Malaysia Online, etc.)
- Regional press release distribution
- Local influencer and blogger outreach

**Regional Directories:**
- **Singapore**: Yellow Pages SG, Singapore Business Directory
- **Malaysia**: Malaysia Online, Malaysiakini Business
- **Thailand**: Thai.com, Thailand Business Directory
- **Indonesia**: IndonesiaFinders, Bisnis Indonesia

## 🔗 SEO Hooks & Automation

### **Pre-Deployment SEO Hooks**

#### **1. SEO Content Validation Hook**
```bash
#!/usr/bin/env sh
# .husky/pre-deploy-seo

echo "🔍 Running SEO validation before deployment..."

# Validate meta tags
node scripts/seo/validate-meta-tags.js

# Check content length
node scripts/seo/validate-content-length.js

# Validate schema markup
node scripts/seo/validate-schema.js

# Check internal linking
node scripts/seo/validate-internal-links.js

echo "✅ SEO validation complete!"
```

#### **2. Page Speed Validation Hook**
```bash
#!/usr/bin/env sh
# Check Core Web Vitals before deployment

echo "⚡ Validating page speed metrics..."

# Run Lighthouse CI
npx @lhci/cli@0.11.x autorun

# Check bundle size
npm run analyze-bundle

# Validate image optimization
node scripts/seo/validate-images.js
```

### **SEO Validation Scripts**

#### **Meta Tags Validator** (`scripts/seo/validate-meta-tags.js`)
```javascript
const fs = require('fs');
const path = require('path');

const REQUIRED_META_TAGS = {
  singapore: {
    title: /PHV.*Singapore.*Budget.*Tracker/i,
    description: /track.*expenses.*earnings.*grab.*singapore/i,
    keywords: ["PHV", "Singapore", "Grab", "GST", "budget"]
  },
  malaysia: {
    title: /e-hailing.*Malaysia.*Budget.*App/i,
    description: /budget.*app.*grab.*driver.*malaysia.*sst/i,
    keywords: ["e-hailing", "Malaysia", "Grab", "SST", "budget"]
  }
  // ... other countries
};

function validateMetaTags() {
  const errors = [];
  
  // Check each regional landing page
  Object.keys(REQUIRED_META_TAGS).forEach(country => {
    const htmlPath = `dist/landing/${country}/index.html`;
    if (!fs.existsSync(htmlPath)) {
      errors.push(`❌ Missing landing page for ${country}`);
      return;
    }
    
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const config = REQUIRED_META_TAGS[country];
    
    // Validate title
    const titleMatch = htmlContent.match(/<title>(.*?)<\/title>/);
    if (!titleMatch || !config.title.test(titleMatch[1])) {
      errors.push(`❌ ${country}: Invalid or missing title tag`);
    }
    
    // Validate description
    const descMatch = htmlContent.match(/<meta name="description" content="(.*?)"/);
    if (!descMatch || !config.description.test(descMatch[1])) {
      errors.push(`❌ ${country}: Invalid or missing description`);
    }
    
    // Validate keywords presence
    config.keywords.forEach(keyword => {
      if (!htmlContent.toLowerCase().includes(keyword.toLowerCase())) {
        errors.push(`⚠️  ${country}: Missing keyword "${keyword}"`);
      }
    });
  });
  
  if (errors.length > 0) {
    console.log('🚨 SEO Validation Errors:');
    errors.forEach(error => console.log(error));
    process.exit(1);
  } else {
    console.log('✅ All meta tags validated successfully');
  }
}

validateMetaTags();
```

#### **Schema Markup Validator** (`scripts/seo/validate-schema.js`)
```javascript
const REQUIRED_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "PHV Budget Tracker",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": ["iOS", "Android"],
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "1250"
  }
};

// Regional variations
const REGIONAL_SCHEMA = {
  singapore: {
    ...REQUIRED_SCHEMA,
    "description": "PHV budget tracking app for Singapore drivers. Track Grab earnings, GST calculations, and expenses.",
    "inLanguage": "en-SG",
    "availableInCountry": "SG"
  },
  malaysia: {
    ...REQUIRED_SCHEMA,
    "description": "E-hailing budget app for Malaysia drivers. Track Grab earnings, SST calculations, and expenses.",
    "inLanguage": ["en-MY", "ms-MY"],
    "availableInCountry": "MY"
  }
  // ... other countries
};
```

## 📊 SEO Performance Monitoring

### **Automated SEO Monitoring** (`scripts/seo/monitor-seo.js`)
```javascript
// Daily SEO health check
const SEO_METRICS = {
  pageSpeed: {
    mobile: { target: 90, current: 0 },
    desktop: { target: 95, current: 0 }
  },
  rankings: {
    "phv budget singapore": { target: 3, current: 0 },
    "grab driver expenses": { target: 5, current: 0 },
    "e-hailing budget malaysia": { target: 3, current: 0 }
  },
  traffic: {
    organic: { target: 1000, current: 0 },
    regional: {
      singapore: { target: 500, current: 0 },
      malaysia: { target: 300, current: 0 }
    }
  }
};

// Integration with Google Search Console API
// Integration with Google Analytics 4 API
// Automated reporting to Slack/email
```

## 🎯 Regional SEO Strategy

### **Singapore SEO Focus:**
- **Primary Keywords**: "PHV budget tracker", "Grab driver Singapore", "GST calculator"
- **Content Strategy**: Government compliance, banking integration, efficiency
- **Local Signals**: Singapore address, SGD currency, local testimonials

### **Malaysia SEO Focus:**
- **Primary Keywords**: "e-hailing budget Malaysia", "Grab driver Malaysia", "SST calculator"
- **Content Strategy**: Family business, cost savings, multi-language support
- **Local Signals**: Malaysian address, MYR currency, Bahasa Malaysia content

### **Thailand SEO Focus:**
- **Primary Keywords**: "แอพงบประมาณแท็กซี่", "Grab driver Thailand", "VAT calculator Thailand"
- **Content Strategy**: Respectful, traditional values, Thai language primary
- **Local Signals**: Thai address, THB currency, Thai testimonials

## 🚀 Implementation Timeline

### **Phase 1 (Pre-Launch):**
- Set up SEO hooks and validation scripts
- Create regional landing page templates
- Implement schema markup and meta tags
- Set up Google Search Console for all regions

### **Phase 2 (Post-Singapore Launch):**
- Monitor SEO performance and rankings
- A/B test landing page content
- Optimize for discovered keyword opportunities
- Expand content marketing efforts

### **Phase 3 (Regional Expansion):**
- Launch region-specific SEO campaigns
- Build regional backlink profiles
- Create localized content and resources
- Establish local partnerships for SEO

This SEO agent architecture ensures **maximum visibility** in each regional market! 🔍🚀