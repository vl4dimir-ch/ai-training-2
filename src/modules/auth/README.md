# Authentication Module

## Overview
The Authentication Module provides a secure, JWT-based authentication system for the application. It handles user registration, login, and token-based authentication using NestJS's built-in features and industry best practices.

## Features
- User registration with email and username validation
- Login with username/email
- JWT-based authentication
- Password hashing using Argon2
- Case-insensitive username/email matching
- Global JWT guard protection

## Directory Structure
```
auth/
├── constants/
│   └── auth.constants.ts     # Centralized error messages and config
├── decorators/
│   └── public.decorator.ts   # Decorator for public routes
├── dto/
│   └── auth.dto.ts          # Request DTOs for auth endpoints
├── guards/
│   └── jwt-auth.guard.ts    # JWT authentication guard
├── interfaces/
│   ├── auth.interface.ts    # Response interfaces
│   └── user.interface.ts    # User-related interfaces
├── strategies/
│   └── jwt.strategy.ts      # JWT strategy implementation
├── auth.controller.ts       # Auth endpoints
├── auth.module.ts          # Module configuration
└── auth.service.ts         # Business logic
```

## API Endpoints

### Register User
```typescript
POST /auth/register
Body: {
  username: string;    // Required
  email: string;      // Required, valid email
  password: string;   // Required, min length: 8
}
Response: {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
  }
}
```

### Login User
```typescript
POST /auth/login
Body: {
  usernameOrEmail: string;    // Required
  password: string;           // Required, min length: 8
}
Response: {
  accessToken: string;
  user: {
    id: number;
    username: string;
    email: string;
  }
}
```

## Configuration

### Environment Variables
```env
JWT_SECRET=your-jwt-secret-key
```

### JWT Configuration
- Token expiration: 1 day
- Token signing using HS256 algorithm

## Usage

### Protecting Routes
By default, all routes are protected by the JWT guard. To make a route public, use the `@Public()` decorator:

```typescript
import { Public } from './decorators/public.decorator';

@Public()
@Get('public-route')
publicRoute() {
  // This route is accessible without authentication
}
```

### Authentication Flow
1. User registers or logs in through respective endpoints
2. Server validates credentials and returns JWT token
3. Client includes token in Authorization header for subsequent requests:
   ```
   Authorization: Bearer <token>
   ```

## Error Handling

### Registration Errors
- `USER_EXISTS`: Username or email already exists
- Validation errors for invalid email or password format

### Login Errors
- `USER_NOT_FOUND`: User with given username/email not found
- `INVALID_CREDENTIALS`: Password doesn't match

## Security Features
- Passwords are hashed using Argon2 (winner of PHC)
- Case-insensitive username/email matching prevents duplicate accounts
- JWT tokens expire after 24 hours
- Global guard ensures route protection by default
- Environment-based JWT secret configuration

## Testing
The module includes comprehensive test coverage:

```bash
# Run auth module tests
npm test src/modules/auth

# Run specific test file
npm test src/modules/auth/auth.controller.spec.ts
```

## Dependencies
- `@nestjs/jwt`: JWT token generation and validation
- `argon2`: Password hashing
- `class-validator`: DTO validation
- `@prisma/client`: Database operations
