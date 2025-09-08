#!/bin/bash
set -e

# This script is run by Vercel during the build step.
# It ensures that the database migration is applied before the Next.js app is built.

echo "Running build script..."

# If a .env file exists (i.e., we are in a local environment), load the variables from it.
if [ -f .env ]; then
  echo "Loading environment variables from .env file for local build..."
  export $(grep -v '^#' .env | xargs)
fi

# Run the database migration. The DATABASE_URL is provided by Vercel's environment variables or the local .env file.
echo "Applying database migrations..."
prisma migrate deploy

# Build the Next.js application.
echo "Building Next.js app..."
next build

echo "Build script completed successfully."
