# Freshpass 

Secure password storage system that allows administrators to store and securely share credentials with one-time links.

<p align="center">
  <img src="generated-icon.png" alt="Freshpass Logo" width="200"/>
</p>

## Features

- **Secure Password Storage**: Store login credentials for multiple services simultaneously
- **One-Time Links**: Generate one-time links for sharing passwords that expire after 1 hour
- **Password Generator**: Create strong passwords with customizable parameters
- **Administrative Dashboard**: Monitor password sharing activities and manage shared links
- **User-Friendly Interface**: Clean, minimalist design with multilingual support

## Requirements

- Node.js 18+ or 20+
- PostgreSQL database (optional, can use in-memory storage for testing)
- npm or yarn for package management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/aeroboss13/SecureVault.git
cd SecureVault
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
Create a `.env` file in the root directory with the following variables:
```
NODE_ENV=production
PORT=5000
SESSION_SECRET=your_secure_session_secret

# Database configuration (optional - for PostgreSQL)
DATABASE_URL=postgresql://username:password@localhost:5432/freshpass
```

4. Build the application:
```bash
npm run build
```

5. Start the server:
```bash
npm start
```

The application will be available at http://localhost:5000

## Development Setup

1. Clone and install dependencies as described above

2. Start the development server:
```bash
npm run dev
```

This will start both the backend server and the frontend development server with hot-reloading.

## Database Configuration

The application supports two storage modes:

1. **In-Memory Storage** (default): Perfect for development, testing, or demonstrations. No additional setup required.

2. **PostgreSQL Storage**: For production use with persistent data storage.
   - Ensure PostgreSQL is installed and running
   - Configure the DATABASE_URL in your .env file
   - The application will automatically create the necessary tables

## Usage

### Registration and Authentication

1. Access the application and navigate to the registration page
2. Create an administrator account
3. Log in with your credentials

### Managing Passwords

1. From the dashboard, use the "Create Password" form to store credentials
2. Fill in the service name, URL, username, and password for each service
3. Use the built-in password generator for creating strong passwords

### Sharing Passwords

1. Create a new share with the "Share Password" function
2. Select the services you want to share
3. Specify the recipient's email (links are accessible for 2 weeks, then active for 1 hour after viewing)
4. Copy the generated link to share with the recipient

### Viewing Shared Passwords

1. Recipients can access the shared passwords via the provided link within 2 weeks of creation
2. After first viewing, the link remains active for 1 hour, then expires
3. After viewing, recipients can mark the password as "Confirmed" which deactivates the link

## Security Features

- Passwords are securely stored in the database
- Links accessible for 2 weeks, then active for 1 hour after viewing
- Links become inactive after viewing or after expiry
- Comprehensive activity logging for audit purposes

## License

Copyright © 2023-2025 Pavel Bardin (linux_torvalds). All rights reserved.

This software is proprietary and confidential. Unauthorized copying, redistribution, or use of this software, via any medium, is strictly prohibited without express written permission from the owner.

## Contact

For any questions or assistance, please contact the repository owner.