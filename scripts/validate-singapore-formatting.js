#!/usr/bin/env node

/**
 * Singapore-Specific Formatting Validation
 * Ensures proper Singapore localization for PHV drivers
 */

const fs = require('fs');
const path = require('path');

const SINGAPORE_STANDARDS = {
  currency: {
    symbol: 'S$',
    code: 'SGD',
    locale: 'en-SG'
  },
  
  gst: {
    rate: 0.09,          // 9% GST as of January 1, 2024
    displayName: 'GST'
  },
  
  dateTime: {
    timezone: 'Asia/Singapore',
    locale: 'en-SG'
  },
  
  phoneNumber: {
    countryCode: '+65',
    pattern: /^\+65[689]\d{7}$/  // Singapore mobile numbers
  },
  
  postalCode: {
    pattern: /^\d{6}$/   // 6-digit postal codes
  }
};

function validateSingaporeFormatting() {
  console.log('🇸🇬 Validating Singapore formatting standards...');
  
  const srcPath = path.join(__dirname, '..', 'src');
  const errors = [];
  
  // Check utils files for Singapore formatting
  const utilsPath = path.join(srcPath, 'utils');
  if (fs.existsSync(utilsPath)) {
    const utilsFiles = fs.readdirSync(utilsPath);
    
    utilsFiles.forEach(file => {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        const filePath = path.join(utilsPath, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Check for currency formatting
        if (content.includes('currency') && !content.includes('SGD')) {
          errors.push(`⚠️  ${file}: Missing SGD currency code`);
        }
        
        // Check for timezone handling
        if (content.includes('Date') && content.includes('timezone') && !content.includes('Asia/Singapore')) {
          errors.push(`⚠️  ${file}: Should use Asia/Singapore timezone`);
        }
      }
    });
  }
  
  // Check components for Singapore-specific patterns
  const componentsPath = path.join(srcPath, 'components');
  if (fs.existsSync(componentsPath)) {
    checkDirectoryForSingaporePatterns(componentsPath, errors);
  }
  
  // Check screens for Singapore-specific patterns
  const screensPath = path.join(srcPath, 'screens');
  if (fs.existsExists(screensPath)) {
    checkDirectoryForSingaporePatterns(screensPath, errors);
  }
  
  return reportResults(errors);
}

function checkDirectoryForSingaporePatterns(dirPath, errors) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true });
  
  files.forEach(file => {
    if (file.isDirectory()) {
      checkDirectoryForSingaporePatterns(path.join(dirPath, file.name), errors);
    } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
      const filePath = path.join(dirPath, file.name);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Check for hardcoded currency symbols
      if (content.includes('$') && !content.includes('S$') && content.includes('amount')) {
        errors.push(`⚠️  ${file.name}: Use S$ instead of $ for Singapore currency`);
      }
      
      // Check for GST mentions without proper rate
      if (content.includes('GST') && (content.includes('0.07') || content.includes('0.08'))) {
        errors.push(`❌ ${file.name}: GST rate should be 0.09 (9%) for Singapore as of 2024`);
      }
      
      // Check phone number validation
      if (content.includes('phone') && content.includes('validation') && !content.includes('+65')) {
        errors.push(`⚠️  ${file.name}: Should validate Singapore phone numbers (+65)`);
      }
      
      // Check for PHV-specific terminology
      if (content.includes('taxi') && !content.includes('PHV')) {
        errors.push(`💡 ${file.name}: Consider using 'PHV' instead of 'taxi' for Singapore context`);
      }
    }
  });
}

function reportResults(errors) {
  if (errors.length === 0) {
    console.log('🎉 All Singapore formatting is correct!');
    return true;
  } else {
    console.log('\n📋 Singapore Formatting Issues Found:');
    errors.forEach(error => console.log(`  ${error}`));
    console.log(`\n🔧 Found ${errors.length} Singapore formatting issue(s)`);
    
    console.log('\n💡 Singapore Standards Reference:');
    console.log('  • Currency: S$ (SGD)');
    console.log('  • GST Rate: 9% (0.09)');
    console.log('  • Timezone: Asia/Singapore');
    console.log('  • Phone: +65 format');
    console.log('  • Postal Code: 6 digits');
    
    return false;
  }
}

// Run validation
if (require.main === module) {
  const isValid = validateSingaporeFormatting();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateSingaporeFormatting, SINGAPORE_STANDARDS };