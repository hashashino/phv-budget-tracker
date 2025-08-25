/**
 * Multi-Language Support Framework
 * Ready for international expansion
 */

import { getRegionalConfig } from '../../config/regions';

export interface TranslationKeys {
  // Authentication
  'auth.login': string;
  'auth.register': string;
  'auth.email': string;
  'auth.password': string;
  
  // Dashboard
  'dashboard.totalEarnings': string;
  'dashboard.totalExpenses': string;
  'dashboard.netIncome': string;
  'dashboard.todaysTrips': string;
  
  // Expenses
  'expenses.fuel': string;
  'expenses.maintenance': string;
  'expenses.parking': string;
  'expenses.food': string;
  
  // Earnings
  'earnings.grab': string;
  'earnings.tada': string;
  'earnings.commission': string;
  'earnings.tips': string;
  
  // Tax/GST
  'tax.gst': string;
  'tax.inclusive': string;
  'tax.exclusive': string;
  
  // Currency
  'currency.amount': string;
  'currency.total': string;
  
  // PHV Specific
  'phv.trips': string;
  'phv.distance': string;
  'phv.workingHours': string;
  'phv.platform': string;
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  rtl: boolean;
  currencyPosition: 'before' | 'after';
  numberFormat: 'western' | 'indian' | 'chinese';
}

export const SUPPORTED_LANGUAGES: Record<string, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    rtl: false,
    currencyPosition: 'before',
    numberFormat: 'western'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    rtl: false,
    currencyPosition: 'before',
    numberFormat: 'chinese'
  },
  ms: {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    rtl: false,
    currencyPosition: 'before',
    numberFormat: 'western'
  },
  th: {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    rtl: false,
    currencyPosition: 'after',
    numberFormat: 'western'
  },
  id: {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    rtl: false,
    currencyPosition: 'before',
    numberFormat: 'western'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    rtl: false,
    currencyPosition: 'before',
    numberFormat: 'indian'
  }
};

// Sample translations (framework ready)
export const TRANSLATIONS: Record<string, Partial<TranslationKeys>> = {
  en: {
    'auth.login': 'Login',
    'auth.register': 'Register',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'dashboard.totalEarnings': 'Total Earnings',
    'dashboard.totalExpenses': 'Total Expenses',
    'dashboard.netIncome': 'Net Income',
    'dashboard.todaysTrips': "Today's Trips",
    'expenses.fuel': 'Fuel',
    'expenses.maintenance': 'Maintenance',
    'expenses.parking': 'Parking',
    'expenses.food': 'Food & Beverages',
    'earnings.grab': 'Grab',
    'earnings.tada': 'TADA',
    'earnings.commission': 'Commission',
    'earnings.tips': 'Tips',
    'tax.gst': 'GST',
    'tax.inclusive': 'Incl. Tax',
    'tax.exclusive': 'Excl. Tax',
    'currency.amount': 'Amount',
    'currency.total': 'Total',
    'phv.trips': 'Trips',
    'phv.distance': 'Distance',
    'phv.workingHours': 'Working Hours',
    'phv.platform': 'Platform'
  },
  
  ms: {
    'auth.login': 'Log Masuk',
    'auth.register': 'Daftar',
    'auth.email': 'Emel',
    'auth.password': 'Kata Laluan',
    'dashboard.totalEarnings': 'Jumlah Pendapatan',
    'dashboard.totalExpenses': 'Jumlah Perbelanjaan',
    'dashboard.netIncome': 'Pendapatan Bersih',
    'dashboard.todaysTrips': 'Perjalanan Hari Ini',
    'expenses.fuel': 'Bahan Api',
    'expenses.maintenance': 'Penyelenggaraan',
    'expenses.parking': 'Parkir',
    'expenses.food': 'Makanan & Minuman',
    'earnings.grab': 'Grab',
    'earnings.tada': 'TADA',
    'earnings.commission': 'Komisyen',
    'earnings.tips': 'Tips',
    'tax.gst': 'GST',
    'tax.inclusive': 'Termasuk Cukai',
    'tax.exclusive': 'Tidak Termasuk Cukai',
    'currency.amount': 'Jumlah',
    'currency.total': 'Total',
    'phv.trips': 'Perjalanan',
    'phv.distance': 'Jarak',
    'phv.workingHours': 'Jam Kerja',
    'phv.platform': 'Platform'
  },
  
  zh: {
    'auth.login': '登录',
    'auth.register': '注册',
    'auth.email': '电子邮件',
    'auth.password': '密码',
    'dashboard.totalEarnings': '总收入',
    'dashboard.totalExpenses': '总支出',
    'dashboard.netIncome': '净收入',
    'dashboard.todaysTrips': '今日行程',
    'expenses.fuel': '燃料',
    'expenses.maintenance': '维修',
    'expenses.parking': '停车',
    'expenses.food': '餐饮',
    'earnings.grab': 'Grab',
    'earnings.tada': 'TADA',
    'earnings.commission': '佣金',
    'earnings.tips': '小费',
    'tax.gst': '消费税',
    'tax.inclusive': '含税',
    'tax.exclusive': '不含税',
    'currency.amount': '金额',
    'currency.total': '总计',
    'phv.trips': '行程',
    'phv.distance': '距离',
    'phv.workingHours': '工作时间',
    'phv.platform': '平台'
  }
};

class I18nService {
  private currentLanguage: string = 'en';
  private fallbackLanguage: string = 'en';

  setLanguage(languageCode: string): void {
    if (SUPPORTED_LANGUAGES[languageCode]) {
      this.currentLanguage = languageCode;
    }
  }

  translate(key: keyof TranslationKeys, params?: Record<string, any>): string {
    const translation = TRANSLATIONS[this.currentLanguage]?.[key] || 
                       TRANSLATIONS[this.fallbackLanguage]?.[key] || 
                       key;
    
    if (params) {
      return this.interpolate(translation, params);
    }
    
    return translation;
  }

  private interpolate(text: string, params: Record<string, any>): string {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key] || match;
    });
  }

  getLanguageConfig(languageCode: string): LanguageConfig {
    return SUPPORTED_LANGUAGES[languageCode] || SUPPORTED_LANGUAGES.en;
  }

  getAvailableLanguagesForCountry(countryCode: string): LanguageConfig[] {
    const regionalConfig = getRegionalConfig(countryCode);
    return regionalConfig.languages
      .map(lang => SUPPORTED_LANGUAGES[lang])
      .filter(Boolean);
  }

  formatCurrency(amount: number, currencyCode: string, languageCode?: string): string {
    const lang = languageCode || this.currentLanguage;
    const config = this.getLanguageConfig(lang);
    
    const formatter = new Intl.NumberFormat(lang, {
      style: 'currency',
      currency: currencyCode
    });
    
    return formatter.format(amount);
  }

  formatNumber(number: number, languageCode?: string): string {
    const lang = languageCode || this.currentLanguage;
    return new Intl.NumberFormat(lang).format(number);
  }
}

export const i18nService = new I18nService();
export default i18nService;