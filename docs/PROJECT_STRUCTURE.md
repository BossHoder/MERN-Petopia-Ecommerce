# Petopia Store - Project Structure

## Overview
This document explains the comprehensive folder structure and organization of the Petopia Store MERN (MongoDB, Express.js, React, Node.js) application, following industry best practices for scalable web applications.

## 📁 Complete Project Structure

```
Petopia_Store/
├── 📄 docker-compose.yml          # Docker orchestration
├── 📄 package.json               # Root package configuration
├── 📄 README.md                  # Project documentation
├── 📄 .env                       # Environment variables
├── 📄 .gitignore                 # Git ignore rules
├── 📄 .dockerignore              # Docker ignore rules
│
├── 📂 client/                    # Frontend React Application
│   ├── 📄 package.json
│   ├── 📂 docker/
│   │   ├── 📄 Dockerfile
│   │   └── 📄 default.conf
│   ├── 📂 public/
│   │   ├── 📄 index.html
│   │   ├── 📄 favicon.ico
│   │   ├── 📄 manifest.json
│   │   └── 📄 robots.txt
│   └── 📂 src/
│       ├── 📄 App.js
│       ├── 📄 index.js
│       ├── 📄 index.css
│       ├── 📂 assets/            # Static Assets
│       │   ├── 📂 images/
│       │   ├── 📂 icons/
│       │   └── 📂 fonts/
│       ├── 📂 components/        # Reusable Components
│       │   ├── 📂 Footer/
│       │   ├── 📂 Loader/
│       │   ├── 📂 Message/
│       │   ├── 📂 MessageForm/
│       │   ├── 📂 MessageList/
│       │   └── 📂 Navbar/
│       ├── 📂 config/            # Client Configuration
│       ├── 📂 constants/         # Application Constants
│       ├── 📂 context/           # React Context Providers
│       ├── 📂 data/              # Static/Mock Data
│       ├── 📂 hoc/               # Higher-Order Components
│       │   ├── 📄 requireAdmin.js
│       │   └── 📄 requireAuth.js
│       ├── 📂 hooks/             # Custom React Hooks
│       ├── 📂 layout/            # Layout Components
│       │   └── 📄 Layout.js
│       ├── 📂 lib/               # Third-party Library Configs
│       ├── 📂 pages/             # Page Components
│       │   ├── 📂 Admin/
│       │   ├── 📂 Home/
│       │   ├── 📂 Login/
│       │   ├── 📂 NotFound/
│       │   ├── 📂 Profile/
│       │   ├── 📂 Register/
│       │   └── 📂 Users/
│       ├── 📂 services/          # API Services
│       ├── 📂 store/             # Redux State Management
│       │   ├── 📄 types.js
│       │   ├── 📂 actions/
│       │   └── 📂 reducers/
│       ├── 📂 styles/            # Global Styles
│       ├── 📂 types/             # TypeScript Definitions
│       └── 📂 utils/             # Utility Functions
│
├── 📂 server/                    # Backend Node.js Application
│   ├── 📄 package.json
│   ├── 📂 docker/
│   │   ├── 📄 Dockerfile
│   │   └── 📂 mongo-data/
│   ├── 📂 public/
│   │   └── 📂 images/
│   ├── 📂 security/
│   │   └── 📄 req.cnf
│   └── 📂 src/
│       ├── 📄 index.js
│       ├── 📄 test.js
│       ├── 📂 config/            # Server Configuration
│       ├── 📂 constants/         # Server Constants
│       ├── 📂 controllers/       # Business Logic Controllers
│       ├── 📂 database/          # Database Management
│       │   ├── 📂 migrations/
│       │   └── 📂 seeders/
│       ├── 📂 dto/               # Data Transfer Objects
│       ├── 📂 email/             # Email Services
│       │   └── 📂 templates/
│       ├── 📂 helpers/           # Server Helper Functions
│       ├── 📂 jobs/              # Background Jobs
│       ├── 📂 middleware/        # Express Middleware
│       │   ├── 📄 requireJwtAuth.js
│       │   └── 📄 requireLocalAuth.js
│       ├── 📂 models/            # Database Models
│       │   ├── 📄 Message.js
│       │   └── 📄 User.js
│       ├── 📂 routes/            # API Routes
│       │   ├── 📄 index.js
│       │   ├── 📄 facebookAuth.js
│       │   ├── 📄 googleAuth.js
│       │   ├── 📄 localAuth.js
│       │   └── 📂 api/
│       │       ├── 📄 index.js
│       │       ├── 📄 messages.js
│       │       └── 📄 users.js
│       ├── 📂 services/          # Business Services
│       │   ├── 📄 facebookStrategy.js
│       │   ├── 📄 googleStrategy.js
│       │   ├── 📄 jwtStrategy.js
│       │   ├── 📄 localStrategy.js
│       │   └── 📄 validators.js
│       ├── 📂 uploads/           # File Upload Handling
│       ├── 📂 utils/             # Server Utilities
│       │   ├── 📄 constants.js
│       │   ├── 📄 seed.js
│       │   └── 📄 utils.js
│       └── 📂 validations/       # Input Validation
│
├── 📂 docs/                      # Project Documentation
├── 📂 screenshots/               # Application Screenshots
├── 📂 tests/                     # Testing Suite
│   ├── 📂 unit/                  # Unit Tests
│   ├── 📂 integration/           # Integration Tests
│   ├── 📂 e2e/                   # End-to-End Tests
│   └── 📂 fixtures/              # Test Data
├── 📂 scripts/                   # Build/Deployment Scripts
├── 📂 logs/                      # Application Logs
├── 📂 backups/                   # Database/File Backups
└── 📂 temp/                      # Temporary Files
```

## 🚀 Server-Side Architecture (`/server/src/`)

### Core Directories

#### **`config/`** - Configuration Management
- Database connection settings
- Authentication configurations
- Environment-specific settings
- Third-party service configurations

#### **`controllers/`** - Business Logic Controllers
- Handle HTTP requests and responses
- Coordinate between services and models
- Implement business rules and logic
- Return standardized API responses

#### **`models/`** - Data Models
- MongoDB/Mongoose schemas
- Data validation rules
- Model relationships and associations
- Database query methods

#### **`routes/`** - API Route Definitions
- HTTP endpoint definitions
- Route middleware application
- Request routing to appropriate controllers
- API versioning structure

#### **`middleware/`** - Express Middleware
- Authentication and authorization
- Request validation and sanitization
- Error handling and logging
- CORS and security headers

#### **`services/`** - Business Services
- External API integrations
- Authentication strategies (JWT, OAuth)
- Email and notification services
- File processing and validation

### Supporting Directories

#### **`dto/`** - Data Transfer Objects
- Standardize API response formats
- Transform database objects for client consumption
- Ensure consistent data structure across endpoints

#### **`validations/`** - Input Validation
- Request payload validation schemas
- Data sanitization and transformation
- Custom validation rules and messages

#### **`database/`** - Database Management
- Database connection utilities
- Migration scripts for schema changes
- Seed data for development and testing

#### **`helpers/`** - Server Utilities
- Common server-side utility functions
- Data transformation helpers
- Reusable business logic components

#### **`email/`** - Email System
- Email service configuration
- HTML email templates
- Notification and marketing emails

#### **`jobs/`** - Background Processing
- Scheduled tasks and cron jobs
- Queue-based job processing
- Long-running background operations

#### **`uploads/`** - File Management
- File upload handling utilities
- Image processing and optimization
- File validation and security

## 🎨 Client-Side Architecture (`/client/src/`)

### Core Directories

#### **`components/`** - Reusable UI Components
- Small, focused, reusable React components
- Shared UI elements across pages
- Component-specific styles and logic

#### **`pages/`** - Page-Level Components
- Route-specific page components
- Page layouts and structures
- Integration of multiple components

#### **`store/`** - State Management (Redux)
- Global application state
- Actions for state modifications
- Reducers for state updates
- Store configuration and middleware

#### **`services/`** - API Integration
- HTTP client configuration (Axios)
- API endpoint functions
- Request/response interceptors
- Authentication token management

### Supporting Directories

#### **`hooks/`** - Custom React Hooks
- Reusable stateful logic
- API data fetching hooks
- Authentication and form hooks
- Local storage and utility hooks

#### **`context/`** - React Context
- Global state without Redux complexity
- Theme and user preference contexts
- Authentication context providers

#### **`assets/`** - Static Resources
- **`images/`** - Application images and graphics
- **`icons/`** - SVG icons and icon components
- **`fonts/`** - Custom font files

#### **`styles/`** - Styling System
- Global CSS variables and themes
- Utility classes and mixins
- Component styling guidelines

#### **`utils/`** - Client Utilities
- Date formatting functions
- Validation helpers
- Local storage utilities
- String and data manipulation

#### **`hoc/`** - Higher-Order Components
- Authentication route protection
- Role-based access control
- Component enhancement and decoration

#### **`constants/`** - Application Constants
- API endpoints and configuration
- Application-wide constant values
- Environment-specific settings

## 🧪 Testing Structure (`/tests/`)

#### **`unit/`** - Unit Tests
- Individual function and component tests
- Isolated testing of business logic
- Mock external dependencies

#### **`integration/`** - Integration Tests
- API endpoint testing
- Database integration tests
- Service integration validation

#### **`e2e/`** - End-to-End Tests
- Full user workflow testing
- Browser automation tests
- Cross-browser compatibility

#### **`fixtures/`** - Test Data
- Sample data for testing
- Mock API responses
- Database seed data for tests

## 📋 Best Practices & Guidelines

### 🏗️ Architecture Principles
1. **Separation of Concerns**: Each folder has a specific responsibility
2. **Modular Design**: Components and services are self-contained
3. **Scalability**: Structure supports growth and team collaboration
4. **Maintainability**: Clear organization for easy code maintenance

### 📝 Naming Conventions
- **Files**: Use camelCase for JavaScript files (`userController.js`)
- **Components**: Use PascalCase for React components (`UserProfile.jsx`)
- **Folders**: Use lowercase with hyphens for multi-word folders
- **Constants**: Use UPPER_SNAKE_CASE for constant values

### 🔧 Code Organization
- Keep components small and focused (< 200 lines)
- Use consistent import ordering (external → internal → relative)
- Group related functionality in the same directory
- Implement proper error handling at each layer

### 🚀 Development Workflow
- Use feature branches for new development
- Write tests for critical business logic
- Document complex functions and components
- Follow consistent code formatting standards

### 📚 Documentation Standards
- README files in major directories
- Inline code comments for complex logic
- API documentation for all endpoints
- Component prop documentation

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport.js
- **Validation**: Joi
- **File Upload**: Multer

### Frontend
- **Library**: React.js
- **State Management**: Redux
- **HTTP Client**: Axios
- **Styling**: CSS3, CSS Modules
- **Build Tool**: Create React App

### DevOps & Tools
- **Containerization**: Docker & Docker Compose
- **Version Control**: Git
- **Package Manager**: npm
- **Code Quality**: ESLint, Prettier

This structure provides a solid foundation for a scalable, maintainable MERN stack application that can grow with your business needs.
