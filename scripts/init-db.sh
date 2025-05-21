#!/bin/sh

# Wait for database to be ready
echo "Waiting for database to be ready..."
wait-on -t 30000 tcp:db:5432

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Run database seeding
echo "Running database seeding..."
npx prisma db seed

echo "Database initialization completed." 