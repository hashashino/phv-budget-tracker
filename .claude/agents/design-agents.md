# Design & Marketing Agents Architecture

## 🎨 Design Agents for Consistent Expansion

### 1. **Mobile UI Design Agent** (`mobile-design-agent`)
**Responsibilities:**
- Maintain design consistency across all mobile screens
- Optimize for PHV driver use cases (one-handed, quick actions)
- Ensure accessibility compliance (large touch targets, contrast)
- Regional color/theme adaptation

**Tools Access:**
- Read/Write: `/src/screens/`, `/src/components/`
- Theme system: `/src/constants/theme.ts`
- Regional design configs
- Accessibility testing tools

**Design Standards:**
- **Touch targets**: Minimum 44px for driver safety
- **Colors**: Green (earnings), Red (expenses), Blue (info)
- **Typography**: Clear, readable fonts (14px+ for body text)
- **Layout**: Card-based, consistent spacing (16px grid)

### 2. **Design System Agent** (`design-system-agent`)  
**Responsibilities:**
- Maintain PHV-specific component library
- Ensure cross-platform consistency (iOS/Android)
- Regional theme variations (Singapore vs Malaysia colors)
- Component documentation

**PHV-Specific Components:**
- `EarningsCard` - Platform-specific (Grab/TADA/Gojek)
- `ExpenseCard` - Category-specific (Fuel/Maintenance/Parking)
- `TripSummary` - Trip count, distance, working hours
- `TaxDisplay` - Regional tax calculations (GST/VAT/SST)

### 3. **Landing Page Design Agent** (`landing-design-agent`)
**Responsibilities:**
- Create compelling landing pages for each market
- Regional messaging (Singapore vs Malaysia vs Thailand)
- Driver testimonials and success stories
- App store optimization (screenshots, descriptions)

**Regional Landing Pages:**
- **Singapore**: Focus on efficiency, GST tracking, local banks
- **Malaysia**: Emphasize SST compliance, Maybank integration
- **Thailand**: VAT calculations, Thai language support
- **Indonesia**: PPN tax, local payment methods

### 4. **Marketing Asset Agent** (`marketing-asset-agent`)
**Responsibilities:**
- Generate marketing materials for each region
- App store screenshots with regional data
- Social media assets with local PHV platforms
- Investor pitch decks with market-specific data

**Assets by Region:**
- **App Screenshots**: Show local currency, tax rates, platforms
- **Marketing Copy**: Translated for local markets
- **Success Stories**: Regional driver testimonials
- **Feature Highlights**: Country-specific benefits

## 🎯 Agent Interaction Workflows

### **Design Consistency Workflow:**
1. **Mobile Design Agent** creates new screen
2. **Design System Agent** validates against component library
3. **Regional Config** applied based on user's country
4. **Marketing Asset Agent** generates promotional materials

### **Regional Expansion Workflow:**
1. **Landing Page Agent** creates country-specific landing page
2. **Marketing Asset Agent** localizes screenshots
3. **Mobile Design Agent** adapts theme for regional preferences
4. **Design System Agent** validates consistency

## 🌍 Regional Design Considerations

### **Singapore (Current)**
- **Colors**: Professional green/blue, government-approved feel
- **Language**: English, clean and direct
- **Cultural**: Efficiency-focused, tech-savvy messaging

### **Malaysia** 
- **Colors**: Warmer tones, incorporate Malaysian flag colors subtly
- **Language**: Bahasa Malaysia + English
- **Cultural**: Family business focus, cost savings emphasis

### **Thailand**
- **Colors**: Gold accents (cultural significance), respectful design
- **Language**: Thai primary, English secondary
- **Cultural**: Respectful hierarchy, traditional values

### **Indonesia**
- **Colors**: Red/white accents, Indonesian cultural elements
- **Language**: Bahasa Indonesia primary
- **Cultural**: Community focus, mutual assistance (gotong royong)

## 🚀 Implementation Strategy

### **Phase 1**: Mobile App Design Consistency
- Standardize all PHV-specific components
- Create regional theme variations
- Ensure accessibility across all screens

### **Phase 2**: Landing Page Creation
- Country-specific landing pages
- Localized marketing messages
- Regional success stories and testimonials

### **Phase 3**: Marketing Asset Generation
- App store optimization for each country
- Social media content for regional platforms
- Investor materials with local market data

## 💡 Agent Prompts Examples

### **Mobile Design Agent Prompt:**
"Create a new expense entry screen that maintains consistency with the existing dashboard design. Ensure large touch targets for drivers, use the regional color scheme for [COUNTRY], and integrate with the current theme system."

### **Landing Page Agent Prompt:**  
"Design a landing page for Malaysian PHV drivers highlighting SST tax compliance, Maybank integration, and Grab commission tracking. Use Malaysian cultural elements and emphasize cost savings for family drivers."

### **Marketing Asset Agent Prompt:**
"Generate app store screenshots for the Thai market showing VAT calculations, Thai language UI, and popular ride-hailing platforms (Grab, Bolt). Include success testimonials from Bangkok drivers."

This agent architecture ensures **design consistency** while enabling **rapid regional expansion**! 🎨🌍