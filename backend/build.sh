#!/bin/bash
# Build script for Render deployment

echo "Starting build process..."

# Install dependencies
npm install

# Build TypeScript
echo "Building TypeScript..."
npm run build

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

echo "Build completed successfully!"