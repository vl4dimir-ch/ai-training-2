# Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Set environment variables
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code and prisma
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Set environment variables
ENV DATABASE_URL=$DATABASE_URL
ENV JWT_SECRET=$JWT_SECRET
ENV PORT=$PORT

# Copy necessary files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy and make the initialization script executable
COPY scripts/init-db.sh ./scripts/
RUN chmod +x ./scripts/init-db.sh

# Install wait-on globally for database check
RUN npm install -g wait-on

# Expose application port
EXPOSE 3000

# Start the application with database initialization
CMD ["sh", "-c", "./scripts/init-db.sh && npm run start:prod"] 