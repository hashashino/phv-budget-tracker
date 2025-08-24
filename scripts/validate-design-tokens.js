#!/usr/bin/env node

/**
 * Design Token Validation Script
 * Ensures consistent design system usage across PHV Budget Tracker
 */

const fs = require('fs');
const path = require('path');

// Singapore PHV App Design Tokens
const DESIGN_TOKENS = {
  colors: {
    // PHV Platform Colors
    grab: '#00B14F',      // Grab green
    tada: '#FF6B35',      // TADA orange  
    gojek: '#00AA13',     // Gojek green
    
    // Singapore-specific
    sgRed: '#ED1C24',     // Singapore red
    sgBlue: '#0066CC',    // Official blue
    
    // Functional colors
    success: '#28A745',
    warning: '#FFC107', 
    danger: '#DC3545',
    info: '#007BFF',
    
    // Currency
    positive: '#28A745',  // Green for earnings
    negative: '#DC3545',  // Red for expenses
    gst: '#6C757D'        // Gray for GST amounts
  },
  
  spacing: {
    xs: 4,
    sm: 8, 
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  
  typography: {
    // Driver-friendly font sizes
    caption: 12,
    body: 14,
    subtitle: 16,
    title: 20,
    heading: 24,
    display: 32
  },
  
  // Touch targets for drivers
  touchTargets: {
    minimum: 44,  // iOS/Android accessibility minimum
    recommended: 48
  }
};

function validateDesignTokens() {
  console.log('🎨 Validating design tokens...');
  
  const srcPath = path.join(__dirname, '..', 'src');
  const errors = [];
  
  // Check theme file exists
  const themePath = path.join(srcPath, 'constants', 'theme.ts');
  if (!fs.existsSync(themePath)) {
    errors.push('❌ Missing theme.ts file');
    return reportResults(errors);
  }
  
  // Read and validate theme file
  try {
    const themeContent = fs.readFileSync(themePath, 'utf8');
    
    // Check for required color tokens
    Object.keys(DESIGN_TOKENS.colors).forEach(colorKey => {
      if (!themeContent.includes(colorKey) && !themeContent.includes(DESIGN_TOKENS.colors[colorKey])) {
        errors.push(`⚠️  Missing or incorrect color token: ${colorKey}`);
      }
    });
    
    // Check for PHV platform colors
    if (!themeContent.includes('#00B14F')) {
      errors.push('❌ Missing Grab brand color (#00B14F)');
    }
    
    if (!themeContent.includes('#FF6B35')) {
      errors.push('❌ Missing TADA brand color (#FF6B35)');
    }
    
    // Check for Singapore currency formatting
    if (!themeContent.includes('SGD') && !themeContent.includes('S$')) {
      errors.push('⚠️  Missing Singapore currency configuration');
    }
    
    console.log('✅ Design token validation completed');
    
  } catch (error) {
    errors.push(`❌ Error reading theme file: ${error.message}`);
  }
  
  return reportResults(errors);
}

function reportResults(errors) {
  if (errors.length === 0) {
    console.log('🎉 All design tokens are valid!');
    return true;
  } else {
    console.log('\n📋 Design Token Issues Found:');
    errors.forEach(error => console.log(`  ${error}`));
    console.log(`\n🔧 Found ${errors.length} design token issue(s)`);
    return false;
  }
}

// Run validation
if (require.main === module) {
  const isValid = validateDesignTokens();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateDesignTokens, DESIGN_TOKENS };