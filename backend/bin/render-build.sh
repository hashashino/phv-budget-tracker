#!/usr/bin/env bash
# exit on error
set -o errexit

# Install dependencies
npm ci

# Build the project
npm run build

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy