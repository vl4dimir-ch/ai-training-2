# Enhanced JSONPlaceholder API

A production-ready REST API that extends the functionality of JSONPlaceholder with full CRUD operations, authentication, and robust data persistence. Built with NestJS, Prisma, and PostgreSQL.

## Features

- 🔐 JWT-based Authentication
- 📝 Full CRUD operations for all resources
- 📊 PostgreSQL persistence
- 🐳 Docker containerization
- 🚀 Easy deployment

## Services

### Authentication Service
- User registration and login
- JWT token generation and validation
- Password hashing and security

### Users Service
- User profile management (CRUD)


## Tech Stack

- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Containerization**: Docker
- **Testing**: Jest

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- npm or yarn

### Environment Variables

If you want to start the application with default environment variables values, you can ignore this step.

Create a `.env` file in the root directory with the following variables:

```env
# Application
PORT=3000                           # Application port (default: 3000)
NODE_ENV=development                # Environment (default: development)

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nest_db?schema=public  (Same as default)
DB_HOST=postgres                    # Database host (default: postgres)
DB_PORT=5432                        # Database port (default: 5432)
DB_NAME=nest_db                     # Database name (default: nest_db)
DB_USER=user                        # Database user (default: user)
DB_PASSWORD=password                # Database password (default: password)

# JWT Authentication
JWT_SECRET=your-secret-key         # JWT secret key (required)
```

### Deployment

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. (OPTIONAL) Create and configure the `.env` file as shown above.

3. Start the application using Docker Compose:
```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL database container
- Run database migrations
- Start the NestJS application
- Set up networking between containers

The API will be available at `http://localhost:3000`.

### Docker Compose Services

```yaml
services:
  api:
    # NestJS application container
    ports: 
      - "3000:3000"
    depends_on:
      - postgres

  postgres:
    # PostgreSQL database container
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:
`http://localhost:3000/api/docs`

## Development

For local development:

1. Install dependencies:
```bash
npm install
```

2. Run database migrations and seeding:
```bash
npx prisma migrate dev
npx prisma db seed
```

3. Start the development server:
```bash
npm run start:dev
```

## Testing

```bash
# Unit tests
npm run test

# Test coverage
npm run test:cov
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
