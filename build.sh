#!/bin/bash
set -e

# This script is run by Vercel during the build step.
# It ensures that the database migration is applied before the Next.js app is built.

echo "Running Vercel build script..."

# Run the database migration. The DATABASE_URL is provided by Vercel's environment variables.
echo "Applying database migrations..."
prisma migrate deploy

# Build the Next.js application.
echo "Building Next.js app..."
next build

echo "Build script completed successfully."
