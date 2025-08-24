# UI/UX Agents Configuration for PHV Budget Tracker

## Agent Specializations

### 1. Mobile UI Agent (`mobile-ui-agent`)
**Responsibilities:**
- React Native screen development
- Navigation flow optimization
- Mobile-first component design
- Performance optimization for older devices

**Tools Access:**
- Read/Write: `/src/screens/`, `/src/components/`
- React Native Paper theming
- Navigation testing
- Device compatibility testing

### 2. Design System Agent (`design-system-agent`)
**Responsibilities:**
- Consistent Singapore-focused design patterns
- PHV-specific UI components (earnings cards, expense trackers)
- Color scheme for Singapore regulations
- Typography for multilingual support (English/Chinese/Malay)

**Tools Access:**
- Read/Write: `/src/constants/theme.ts`
- Component library maintenance
- Design token validation
- Accessibility compliance

### 3. Data Visualization Agent (`dataviz-agent`)
**Responsibilities:**
- PHV earnings charts (daily/weekly/monthly)
- Expense breakdown visualizations
- Debt payoff projections
- GST calculation displays

**Tools Access:**
- Read/Write: Chart components
- React Native Chart Kit
- Financial data formatting
- Singapore currency formatting

### 4. Forms & Input Agent (`forms-agent`)
**Responsibilities:**
- Receipt scanning UI
- Manual expense entry
- Banking connection flows
- PHV platform integration forms

**Tools Access:**
- Formik form components
- Camera integration UI
- Banking OAuth flows
- Input validation UI

### 5. Accessibility Agent (`a11y-agent`)
**Responsibilities:**
- Screen reader compatibility
- Multi-language support (Singapore context)
- Driver-friendly interfaces (large touch targets)
- Voice input for hands-free operation

**Tools Access:**
- Accessibility testing
- Language localization
- Voice UI components
- Contrast/readability validation

## Agent Interaction Patterns

### Collaborative Workflows:
1. **Mobile UI** + **Design System** → Consistent component creation
2. **DataViz** + **Forms** → Interactive financial dashboards
3. **A11y** + **All Agents** → Universal design validation
4. **Mobile UI** + **Backend API** → Real-time data integration

## Singapore PHV-Specific Requirements:
- **Grab/TADA branding compatibility**
- **GST calculation prominently displayed**
- **SGD currency formatting**
- **Local time zones (GMT+8)**
- **Singapore address validation**
- **Multi-language support (EN/ZH/MS)**