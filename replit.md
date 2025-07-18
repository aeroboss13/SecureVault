# Freshpass - Secure Password Management System

## Overview

Freshpass is a secure password storage and sharing system that allows administrators to securely store credentials and share them with others via time-limited one-time links. The application provides a comprehensive solution for password management with features like password generation, secure sharing, and administrative monitoring.

## System Architecture

### Frontend Architecture
- **Framework**: React 18+ with TypeScript
- **Styling**: TailwindCSS with shadcn/ui component library
- **State Management**: React Query (@tanstack/react-query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom configuration for development and production

### Backend Architecture
- **Runtime**: Node.js 18+ with Express.js server
- **API Design**: RESTful API with JSON responses
- **Authentication**: Session-based auth using Passport.js with local strategy
- **Security**: Password hashing with crypto's scrypt function
- **Session Storage**: PostgreSQL-backed session store

### Database Architecture
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless database adapter
- **Schema Management**: Drizzle migrations in TypeScript
- **Fallback**: In-memory storage option for development/testing

## Key Components

### Authentication System
- **Strategy**: Passport.js with local authentication strategy
- **Password Security**: scrypt-based hashing with random salts
- **Session Management**: Express sessions with PostgreSQL store
- **Authorization**: Role-based access control (admin vs regular users)
- **Security Features**: HTTP-only cookies, CSRF protection, secure session handling

### Password Management
- **Storage**: Encrypted password entries with service metadata
- **Organization**: Multiple services per admin with categorization
- **Password Generation**: Special format password generator (3 lowercase + 4 digits + 3 uppercase + symbol)
- **Auto-generation**: Automatic password generation when selecting any service

### Sharing System
- **One-Time Links**: Secure token-based sharing with expiration
- **Time Limits**: Configurable expiration (default 1 hour)
- **Access Control**: View tracking and single-use enforcement
- **Notifications**: Email recipient tracking and status monitoring
- **Revocation**: Administrative ability to revoke active shares

### Administrative Dashboard
- **Statistics**: Real-time metrics on active shares, daily creation, expiring links
- **Activity Monitoring**: Comprehensive logging of all password operations
- **Share Management**: View, revoke, and monitor active password shares
- **User Interface**: Clean, responsive design with multilingual support

## Data Flow

### Password Creation Flow
1. Admin authenticates and accesses dashboard
2. Creates password entries using form with service details
3. System generates secure passwords or accepts custom ones
4. Entries stored in database with encryption
5. Activity logged for audit trail

### Sharing Flow
1. Admin selects password entries to share
2. System generates unique share token
3. Creates time-limited share record in database
4. Generates secure sharing URL
5. Recipient accesses URL within time limit
6. System tracks access and marks as viewed
7. Optional: Single-use enforcement and auto-revocation

### Data Security
- **Encryption**: Password data encrypted at rest
- **Transport**: HTTPS for all communications
- **Session Security**: Secure cookie configuration
- **Token Security**: Cryptographically secure share tokens
- **Audit Trail**: Complete activity logging

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connectivity
- **drizzle-orm**: Type-safe database ORM
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Frontend Dependencies
- **@radix-ui/***: Accessible UI primitives
- **@tanstack/react-query**: Data fetching and caching
- **react-hook-form**: Form state management
- **zod**: Schema validation
- **tailwindcss**: Utility-first CSS framework

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking
- **tsx**: TypeScript execution
- **esbuild**: Production bundling

## Deployment Strategy

### Development Setup
- **Environment**: NODE_ENV=development
- **Database**: Optional PostgreSQL (falls back to memory store)
- **Build**: `npm run dev` for development server
- **Hot Reload**: Vite HMR for frontend, tsx for backend

### Production Deployment
- **Environment**: NODE_ENV=production
- **Database**: Required PostgreSQL connection via DATABASE_URL
- **Build Process**: 
  1. `npm run build` - Builds frontend and backend
  2. Frontend compiled to `dist/public`
  3. Backend bundled to `dist/index.js`
- **Startup**: `npm start` runs production server
- **Port**: Configurable via PORT environment variable (default 5000)

### Environment Configuration
```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=secure_random_string
DATABASE_URL=postgresql://user:pass@host:port/database
```

### Security Considerations
- Secure session secret generation
- Database connection encryption
- HTTPS enforcement in production
- Secure cookie configuration
- CORS policy configuration

## Recent Changes
- July 12, 2025: Implemented two-phase expiration system for shared links
  - Links are accessible for 2 weeks from creation (initial access period)
  - After first viewing, links remain active for 1 hour, then expire
  - If links are not accessed within 2 weeks, they become permanently unavailable
  - Updated share creation logic to set 2-week initial expiration
  - Modified view logic to set 1-hour timer after first access
  - Updated frontend to show different countdown logic for viewed vs unviewed links
  - Updated expiring shares count to handle both phases appropriately
  - Added live countdown timers to activity history showing remaining time
  - Enhanced history table to display timer type (2 weeks initial vs 1 hour after viewing)
- July 12, 2025: Simplified password generation system
  - Removed customizable password generator options
  - Implemented special format password generation for all services (3 lowercase + 4 digits + 3 uppercase + symbol)
  - Auto-generates special format passwords when selecting any predefined service
  - Updated password generation interface to show format specification
- July 12, 2025: Added new service "Клик"
  - Added Клик service with URL https://qlik.freshauto2.ru/
  - Applied crm\ prefix username formatting similar to AD/терминал
  - Updated username formatter to handle Клик service with domain prefix logic
- July 07, 2025: Added backup/restore functionality
  - Created backup/restore API endpoints with file upload support
  - Implemented BackupRestore component for frontend interface
  - Added multer for file handling with 5MB limit
  - Integrated backup page into navigation and routing
  - Supports JSON export/import of password data

## Changelog
- July 07, 2025. Initial setup
- July 07, 2025. Added file upload functionality to main password creation form for automatic data import
- July 07, 2025. Implemented smart service name matching for uploaded files
- July 07, 2025. Migration from Replit Agent to Replit environment completed with backup/restore feature
- July 07, 2025. Enhanced file naming to use username from first entry plus creation date format
- July 07, 2025. Added domain-specific username formatting (crm\ prefix for ad\терминал, @freshauto.ru suffix for crm)

## User Preferences

Preferred communication style: Simple, everyday language.