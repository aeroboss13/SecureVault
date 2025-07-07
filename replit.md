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
- **Password Generation**: Customizable password generator with strength validation
- **Special Format**: Support for specific password formats (e.g., 3 lowercase + 4 digits + 3 uppercase + symbol)

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

## Changelog
- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.