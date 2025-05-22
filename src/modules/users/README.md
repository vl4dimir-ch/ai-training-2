# Users Module

This module handles user management operations in the application.

## Features

- User CRUD operations
- User filtering
- Unique username/email validation

## Structure

```
users/
├── constants/        # Module constants
├── dto/             # Data Transfer Objects
│   └── nested/      # Nested DTOs
├── types/           # Type definitions
├── users.module.ts  # Module definition
├── users.service.ts # Business logic
└── users.controller.ts # HTTP endpoints
```

## API Endpoints

### POST /users
Creates a new user

### GET /users
Lists all users with optional filters

### GET /users/:id
Gets a specific user by ID

### PATCH /users/:id
Updates specific fields of a user

### PUT /users/:id
Replaces all user data

### DELETE /users/:id
Removes a user

## DTOs

- `CreateUserDto`: Validates user creation data
- `UpdateUserDto`: Validates partial user updates
- `ReplaceUserDto`: Validates complete user replacement
- `FilterUserDto`: Validates user filtering options

## Types

- `UserResponse`: Defines the structure of user responses

## Constants

- `userSelect`: Defines the Prisma select object for user queries 