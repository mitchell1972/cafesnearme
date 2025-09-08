#!/bin/bash

echo "Running build script..."

# Check if we're running on Vercel
if [ -n "$VERCEL" ]; then
    echo "Running on Vercel - generating Prisma client"
    # Generate Prisma client (DATABASE_URL should be set by Vercel)
    npx prisma generate
else
    echo "Running locally"
    # Set default DATABASE_URL if not provided for local development
    if [ -z "$DATABASE_URL" ]; then
        echo "DATABASE_URL not set, using default SQLite database"
        export DATABASE_URL="file:./dev.db"
    fi
    
    # Apply database migrations for local development
    echo "Applying database migrations..."
    npx prisma migrate deploy
fi

echo "Building Next.js application..."
next build

echo "Build complete!"
