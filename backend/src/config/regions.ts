/**
 * Multi-Regional Configuration for PHV Budget Tracker
 * Supports different countries with localized tax, currency, and ride-hailing platforms
 */

export interface RegionalConfig {
  countryCode: string;
  countryName: string;
  currency: {
    code: string;
    symbol: string;
    locale: string;
  };
  tax: {
    name: string;
    rate: number;
    displayName: string;
  };
  phoneNumber: {
    countryCode: string;
    pattern: RegExp;
    placeholder: string;
  };
  postalCode: {
    pattern: RegExp;
    placeholder: string;
  };
  timezone: string;
  languages: string[];
  ridehailingPlatforms: Array<{
    name: string;
    type: string;
    commission: number;
    isActive: boolean;
    regions: string[];
  }>;
  bankingProviders: Array<{
    name: string;
    code: string;
    apiEndpoint?: string;
    oauthSupported: boolean;
    isActive: boolean;
    accountTypes: string[];
  }>;
  paymentMethods: Array<{
    name: string;
    type: string;
    isActive: boolean;
  }>;
  regulatoryInfo: {
    driverLicenseFormat: string;
    vehicleRegistrationFormat: string;
    businessRegistrationRequired: boolean;
  };
}

export const REGIONAL_CONFIGS: Record<string, RegionalConfig> = {
  SG: {
    countryCode: 'SG',
    countryName: 'Singapore',
    currency: {
      code: 'SGD',
      symbol: 'S$',
      locale: 'en-SG'
    },
    tax: {
      name: 'GST',
      rate: 0.09, // 9% as of Jan 2024
      displayName: 'GST (9%)'
    },
    phoneNumber: {
      countryCode: '+65',
      pattern: /^\+65[689]\d{7}$/,
      placeholder: '+65 9123 4567'
    },
    postalCode: {
      pattern: /^\d{6}$/,
      placeholder: '123456'
    },
    timezone: 'Asia/Singapore',
    languages: ['en', 'zh', 'ms', 'ta'],
    ridehailingPlatforms: [
      { name: 'Grab', type: 'GRAB', commission: 0.20, isActive: true, regions: ['SG', 'MY', 'TH', 'ID', 'VN', 'PH'] },
      { name: 'TADA', type: 'TADA', commission: 0.15, isActive: true, regions: ['SG'] },
      { name: 'Gojek', type: 'GOJEK', commission: 0.20, isActive: true, regions: ['SG', 'ID'] },
      { name: 'ComfortDelGro', type: 'OTHER', commission: 0.10, isActive: true, regions: ['SG'] }
    ],
    bankingProviders: [
      { name: 'DBS Bank', code: 'DBS', apiEndpoint: 'https://www.dbs.com/dbsdevelopers', oauthSupported: true, isActive: true, accountTypes: ['savings', 'checking', 'credit'] },
      { name: 'OCBC Bank', code: 'OCBC', apiEndpoint: 'https://api.ocbc.com', oauthSupported: true, isActive: true, accountTypes: ['savings', 'checking', 'credit'] },
      { name: 'UOB Bank', code: 'UOB', apiEndpoint: 'https://developers.uobgroup.com', oauthSupported: true, isActive: true, accountTypes: ['savings', 'checking', 'credit'] },
      { name: 'POSB', code: 'POSB', apiEndpoint: 'https://www.posb.com.sg/api', oauthSupported: true, isActive: true, accountTypes: ['savings', 'checking'] },
      { name: 'Citibank', code: 'CITI', oauthSupported: false, isActive: true, accountTypes: ['savings', 'checking', 'credit'] },
      { name: 'HSBC', code: 'HSBC', oauthSupported: false, isActive: true, accountTypes: ['savings', 'checking', 'credit'] }
    ],
    paymentMethods: [
      { name: 'PayNow', type: 'instant_transfer', isActive: true },
      { name: 'NETS', type: 'debit_card', isActive: true },
      { name: 'GrabPay', type: 'ewallet', isActive: true },
      { name: 'Credit Card', type: 'credit_card', isActive: true }
    ],
    regulatoryInfo: {
      driverLicenseFormat: 'SXXXXXXX[A-Z]', // Singapore driving license format
      vehicleRegistrationFormat: 'S[A-Z]{2}\\d{1,4}[A-Z]', // Singapore vehicle plate format
      businessRegistrationRequired: false // PHV drivers don't need business registration
    }
  },

  MY: {
    countryCode: 'MY',
    countryName: 'Malaysia',
    currency: {
      code: 'MYR',
      symbol: 'RM',
      locale: 'ms-MY'
    },
    tax: {
      name: 'SST',
      rate: 0.06, // 6% Service Tax
      displayName: 'SST (6%)'
    },
    phoneNumber: {
      countryCode: '+60',
      pattern: /^\+60[1-9]\d{7,8}$/,
      placeholder: '+60 12 345 6789'
    },
    postalCode: {
      pattern: /^\d{5}$/,
      placeholder: '50000'
    },
    timezone: 'Asia/Kuala_Lumpur',
    languages: ['ms', 'en', 'zh', 'ta'],
    ridehailingPlatforms: [
      { name: 'Grab', type: 'GRAB', commission: 0.25, isActive: true, regions: ['SG', 'MY', 'TH', 'ID', 'VN', 'PH'] },
      { name: 'MyCar', type: 'OTHER', commission: 0.15, isActive: true, regions: ['MY'] },
      { name: 'SOCAR', type: 'OTHER', commission: 0.20, isActive: true, regions: ['MY'] }
    ],
    bankingProviders: [
      { name: 'Maybank', code: 'MAYBANK', apiEndpoint: 'https://developer.maybank.com.my', oauthSupported: true, isActive: true, accountTypes: ['savings', 'checking', 'credit'] },
      { name: 'CIMB Bank', code: 'CIMB', apiEndpoint: 'https://developer.cimb.com', oauthSupported: true, isActive: true, accountTypes: ['savings', 'checking', 'credit'] },
      { name: 'Public Bank', code: 'PBB', oauthSupported: false, isActive: true, accountTypes: ['savings', 'checking'] },
      { name: 'Hong Leong Bank', code: 'HLB', oauthSupported: false, isActive: true, accountTypes: ['savings', 'checking', 'credit'] }
    ],
    paymentMethods: [
      { name: 'DuitNow', type: 'instant_transfer', isActive: true },
      { name: 'Touch n Go eWallet', type: 'ewallet', isActive: true },
      { name: 'GrabPay', type: 'ewallet', isActive: true },
      { name: 'Boost', type: 'ewallet', isActive: true }
    ],
    regulatoryInfo: {
      driverLicenseFormat: '[A-Z]\\d{8}', // Malaysia driving license format
      vehicleRegistrationFormat: '[A-Z]{1,3}\\d{1,4}[A-Z]?', // Malaysia vehicle plate
      businessRegistrationRequired: true // Malaysia requires e-hailing license
    }
  },

  TH: {
    countryCode: 'TH',
    countryName: 'Thailand',
    currency: {
      code: 'THB',
      symbol: '฿',
      locale: 'th-TH'
    },
    tax: {
      name: 'VAT',
      rate: 0.07, // 7% VAT
      displayName: 'VAT (7%)'
    },
    phoneNumber: {
      countryCode: '+66',
      pattern: /^\+66[1-9]\d{7,8}$/,
      placeholder: '+66 81 234 5678'
    },
    postalCode: {
      pattern: /^\d{5}$/,
      placeholder: '10100'
    },
    timezone: 'Asia/Bangkok',
    languages: ['th', 'en'],
    ridehailingPlatforms: [
      { name: 'Grab', type: 'GRAB', commission: 0.25, isActive: true, regions: ['SG', 'MY', 'TH', 'ID', 'VN', 'PH'] },
      { name: 'Bolt', type: 'OTHER', commission: 0.15, isActive: true, regions: ['TH'] },
      { name: 'InDrive', type: 'OTHER', commission: 0.10, isActive: true, regions: ['TH'] }
    ]
  },

  ID: {
    countryCode: 'ID',
    countryName: 'Indonesia',
    currency: {
      code: 'IDR',
      symbol: 'Rp',
      locale: 'id-ID'
    },
    tax: {
      name: 'PPN',
      rate: 0.11, // 11% PPN (VAT)
      displayName: 'PPN (11%)'
    },
    phoneNumber: {
      countryCode: '+62',
      pattern: /^\+62[1-9]\d{7,10}$/,
      placeholder: '+62 812 3456 789'
    },
    postalCode: {
      pattern: /^\d{5}$/,
      placeholder: '12345'
    },
    timezone: 'Asia/Jakarta',
    languages: ['id', 'en'],
    ridehailingPlatforms: [
      { name: 'Gojek', type: 'GOJEK', commission: 0.20, isActive: true, regions: ['SG', 'ID'] },
      { name: 'Grab', type: 'GRAB', commission: 0.25, isActive: true, regions: ['SG', 'MY', 'TH', 'ID', 'VN', 'PH'] },
      { name: 'Maxim', type: 'OTHER', commission: 0.18, isActive: true, regions: ['ID'] }
    ]
  },

  US: {
    countryCode: 'US',
    countryName: 'United States',
    currency: {
      code: 'USD',
      symbol: '$',
      locale: 'en-US'
    },
    tax: {
      name: 'Sales Tax',
      rate: 0.08, // Average sales tax (varies by state)
      displayName: 'Sales Tax (varies by state)'
    },
    phoneNumber: {
      countryCode: '+1',
      pattern: /^\+1[2-9]\d{2}[2-9]\d{2}\d{4}$/,
      placeholder: '+1 555 123 4567'
    },
    postalCode: {
      pattern: /^\d{5}(-\d{4})?$/,
      placeholder: '12345 or 12345-6789'
    },
    timezone: 'America/New_York', // Default, varies by state
    languages: ['en', 'es'],
    ridehailingPlatforms: [
      { name: 'Uber', type: 'UBER', commission: 0.25, isActive: true, regions: ['US', 'CA', 'AU'] },
      { name: 'Lyft', type: 'LYFT', commission: 0.25, isActive: true, regions: ['US', 'CA'] },
      { name: 'Via', type: 'OTHER', commission: 0.20, isActive: true, regions: ['US'] }
    ]
  },

  AU: {
    countryCode: 'AU', 
    countryName: 'Australia',
    currency: {
      code: 'AUD',
      symbol: 'A$',
      locale: 'en-AU'
    },
    tax: {
      name: 'GST',
      rate: 0.10, // 10% GST
      displayName: 'GST (10%)'
    },
    phoneNumber: {
      countryCode: '+61',
      pattern: /^\+61[2-9]\d{8}$/,
      placeholder: '+61 412 345 678'
    },
    postalCode: {
      pattern: /^\d{4}$/,
      placeholder: '2000'
    },
    timezone: 'Australia/Sydney',
    languages: ['en'],
    ridehailingPlatforms: [
      { name: 'Uber', type: 'UBER', commission: 0.28, isActive: true, regions: ['US', 'CA', 'AU'] },
      { name: 'DiDi', type: 'OTHER', commission: 0.20, isActive: true, regions: ['AU', 'CN'] },
      { name: '13cabs', type: 'OTHER', commission: 0.15, isActive: true, regions: ['AU'] }
    ]
  }
};

export function getRegionalConfig(countryCode: string): RegionalConfig {
  const config = REGIONAL_CONFIGS[countryCode.toUpperCase()];
  if (!config) {
    throw new Error(`Regional configuration not found for country: ${countryCode}`);
  }
  return config;
}

export function formatCurrency(amount: number, countryCode: string): string {
  const config = getRegionalConfig(countryCode);
  return new Intl.NumberFormat(config.currency.locale, {
    style: 'currency',
    currency: config.currency.code
  }).format(amount);
}

export function calculateTax(amount: number, countryCode: string): number {
  const config = getRegionalConfig(countryCode);
  return amount * config.tax.rate;
}

export function getAvailablePlatforms(countryCode: string) {
  const config = getRegionalConfig(countryCode);
  return config.ridehailingPlatforms.filter(platform => 
    platform.regions.includes(countryCode.toUpperCase())
  );
}