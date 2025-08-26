# PHV Budget Tracker - Specialized Agent Configurations

This directory contains specialized agent configurations for the PHV Budget Tracker project. Each agent is designed to handle specific domains of the application with deep expertise and focused tool access.

## Available Agents

### 🔧 [Backend API Agent](./backend-api-agent.json)
**Domain**: Express.js API, Business Logic, Authentication
- **Primary Focus**: RESTful API development, PHV business logic implementation
- **Key Expertise**: JWT authentication, multi-regional services, banking integrations
- **Files**: `/backend/src/controllers/`, `/backend/src/routes/`, `/backend/src/services/`

### 💾 [Database Agent](./database-agent.json) 
**Domain**: Prisma ORM, PostgreSQL, Data Modeling
- **Primary Focus**: Database schema design, migrations, query optimization
- **Key Expertise**: Multi-regional data structures, financial transaction modeling
- **Files**: `/backend/prisma/`, migration files, seed scripts

### 🚀 [DevOps Agent](./devops-agent.json)
**Domain**: Vercel Deployment, Docker, CI/CD
- **Primary Focus**: Deployment automation, serverless optimization, monitoring
- **Key Expertise**: Vercel configuration, Docker orchestration, performance monitoring
- **Files**: `vercel.json`, `docker-compose.yml`, deployment scripts

### 🎨 [UI Styling Agent](./ui-styling-agent.json)
**Domain**: React Native, NativeWind, Premium Design
- **Primary Focus**: Component development, styling system, mobile UX
- **Key Expertise**: NativeWind mastery, custom hooks, premium financial UI
- **Files**: `/frontend/src/components/`, `/frontend/src/hooks/`, styling configs

### 🧪 [Testing Agent](./testing-agent.json)
**Domain**: Jest, E2E Testing, Quality Assurance  
- **Primary Focus**: Comprehensive testing strategy, quality metrics
- **Key Expertise**: Financial app testing patterns, PHV business logic validation
- **Files**: `__tests__/`, test configurations, CI/CD test integration

## Agent Collaboration Matrix

| From Agent | To Agent | Handoff Scenarios |
|------------|----------|-------------------|
| **Backend API** → **Database** | Schema changes, complex queries, performance optimization |
| **Backend API** → **DevOps** | Deployment config, environment variables, serverless optimization |
| **Backend API** → **UI Styling** | New API endpoints, response format changes, auth flows |
| **Database** → **Backend API** | Query implementation, service layer integration |
| **Database** → **DevOps** | Production migrations, backup procedures, connection pooling |
| **DevOps** → **Testing** | CI/CD integration, test environments, automated testing |
| **UI Styling** → **Backend API** | API endpoint requirements, data format needs |
| **UI Styling** → **Testing** | Component testing, accessibility testing, visual regression |
| **Testing** → **All Agents** | Test coverage, quality metrics, bug reports |

## Usage Guidelines

### 1. **Agent Selection**
Choose agents based on the primary domain of your task:
- **API development** → `backend-api-agent`
- **Database work** → `database-agent` 
- **Styling/UI** → `ui-styling-agent`
- **Deployment issues** → `devops-agent`
- **Testing needs** → `testing-agent`

### 2. **Tool Access Patterns**
Each agent has restricted tool access for security and focus:
- **Edit/MultiEdit**: Primary for code modification
- **Bash**: Limited to relevant domains (DevOps, Database, Testing)
- **WebFetch**: Only for agents needing external resources

### 3. **Collaboration Protocols**
- Agents should hand off tasks to appropriate specialists
- Document handoff context in TodoWrite
- Cross-domain changes require coordination between agents

## Project Context

### **Technology Stack**
- **Frontend**: React Native + NativeWind + React Native Paper
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL (Neon) + Redis (Upstash)
- **Deployment**: Vercel (frontend + backend) + Docker (local)

### **Domain Specifics**
- **PHV Focus**: Private Hire Vehicle drivers in Singapore/SEA
- **Financial Features**: Multi-regional tax, banking integration, debt management
- **Premium Design**: Navy/Gold/Teal color scheme, glassmorphism, smooth animations

### **Current Phase**
- ✅ **Core Infrastructure**: Authentication, basic CRUD, styling system
- 🔄 **Active Development**: Premium UI components, advanced features
- 📋 **Planned**: Mobile app deployment, advanced analytics, multi-region expansion

## Agent Configuration Updates

To modify agent configurations:

1. **Edit JSON files** directly for capability changes
2. **Update collaboration matrix** when adding new handoff scenarios
3. **Sync with project evolution** as new technologies are added
4. **Test agent effectiveness** and adjust tool access as needed

## Best Practices

### **For Agent Users**
- ✅ Choose the most specialized agent for your task
- ✅ Provide clear context about the current project state
- ✅ Specify handoff requirements for cross-domain work
- ❌ Don't use general-purpose agents for specialized tasks

### **For Agent Maintenance**
- 🔄 Regular review of agent effectiveness
- 📊 Monitor task completion success rates by agent
- 🎯 Refine tool access based on actual usage patterns
- 🤝 Optimize collaboration handoff procedures

---

**Last Updated**: December 2024  
**Project Phase**: Active Development  
**Agent Count**: 5 specialized agents + 1 general-purpose fallback