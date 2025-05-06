# Architecture Overview

## Overview

This project is a password management and sharing application with a full-stack architecture. It allows administrators to store, manage, and securely share password entries with others via temporary access links. The application includes user authentication, password entry management, activity logging, and analytics.

The application is built using a modern React frontend with a Node.js/Express backend. It employs a PostgreSQL database for persistent storage, managed through Drizzle ORM. The project follows a monorepo structure with clear separation between client, server, and shared code.

## System Architecture

The application follows a client-server architecture with the following components:

### Frontend (Client)

- Built with React 
- Uses TailwindCSS for styling with the shadcn/ui component library
- State management with React Query for data fetching
- Client-side routing with Wouter
- Form handling with React Hook Form and Zod validation

### Backend (Server)

- Express.js server
- RESTful API endpoints
- Session-based authentication
- PostgreSQL database with Drizzle ORM
- Server-side rendering support

### Shared Code

- Database schema definitions shared between client and server
- Type definitions for data models
- Validation schemas using Zod

## Key Components

### Authentication System

The application implements session-based authentication:

- Uses `passport.js` with a local strategy
- Password hashing with crypto's scrypt
- Express sessions with PostgreSQL session store
- Role-based authorization (admin vs regular users)

```
Authentication Flow:
1. User submits credentials
2. Server validates and creates a session
3. Session cookie is used for subsequent requests
4. Protected routes check for valid session
```

### Database Schema

The database uses a relational structure with the following key tables:

1. `users` - Stores user information and authentication details
2. `password_entries` - Stores the password information managed by admins
3. `password_shares` - Tracks shared password entries and their access details
4. `share_entries` - Junction table for many-to-many relationship between shares and entries
5. `activity_logs` - Audit trail of all user actions

### API Structure

The API follows RESTful conventions:

1. **Authentication Endpoints**
   - `/api/login` - User login
   - `/api/logout` - User logout

2. **Password Management Endpoints**
   - `/api/passwords` - CRUD operations for password entries

3. **Password Sharing Endpoints**
   - `/api/shares` - Create and manage password shares

4. **Activity and Analytics Endpoints**
   - `/api/logs` - Retrieve activity logs
   - `/api/stats` - Get usage statistics

### Frontend Architecture

The frontend is structured around pages and components:

1. **Pages**
   - `auth-page.tsx` - Login and registration
   - `dashboard.tsx` - Main admin interface
   - `view-password.tsx` - Public password viewing for shared links
   - `history.tsx` - Activity history view

2. **Components**
   - UI components based on shadcn/ui library
   - Feature-specific components (e.g., `CreatePasswordForm`, `ActiveSharesTable`)
   - Custom hooks for shared logic

3. **State Management**
   - React Query for server state
   - Context for global state (auth)
   - Local state for component-specific needs

## Data Flow

### Password Creation and Management

1. Admin creates a password entry through the UI
2. Form validation occurs client-side using Zod schemas
3. Data is sent to the server via a POST request
4. Server validates the request and stores the password entry
5. Activity is logged in the activity_logs table
6. UI is updated to reflect the new entry

### Password Sharing

1. Admin selects passwords to share and specifies recipient details
2. Server generates a secure share token and expiry time
3. Share details are stored in the database
4. Share link is provided to the admin for distribution
5. Recipients can access the shared passwords using the token link
6. Views are tracked and the share can be revoked by the admin

### Security Measures

1. Passwords are stored in encrypted form in the database
2. Shared links have configurable expiration times
3. Access attempts are logged
4. Admin can revoke access at any time
5. Session management with secure cookies

## External Dependencies

### Frontend Dependencies

- **React**: Core UI library
- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI
- **React Query**: Data fetching and caching
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **Wouter**: Lightweight router

### Backend Dependencies

- **Express**: Web server framework
- **Passport**: Authentication middleware
- **Drizzle ORM**: Database ORM
- **connect-pg-simple**: PostgreSQL session store
- **Neon Database**: PostgreSQL connection (@neondatabase/serverless)

## Deployment Strategy

The application is configured for deployment in various environments:

### Development Environment

- Uses Vite development server with hot module replacement
- Express backend with development mode
- Local PostgreSQL database

### Production Environment

- Frontend built with Vite build
- Backend bundled with esbuild
- Static assets served by Express
- Database connection via environment variables

### Deployment Platforms

The application is set up to be deployed on Replit with:
- Automatic build scripts (`npm run build`)
- Start command for production (`npm run start`)
- Port configuration for deployment (port 5000 mapped to 80)
- PostgreSQL database integration

### CI/CD

The `.replit` configuration indicates a CI/CD workflow that:
1. Builds the application
2. Deploys to an autoscaling environment
3. Provides development tooling

## Security Considerations

1. Secure password storage with cryptographic hashing
2. Session management with secure cookies
3. CORS protection
4. Input validation on both client and server
5. Temporary access links with expiration
6. Audit logging of all sensitive operations