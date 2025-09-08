#!/bin/bash

echo "Running build script..."

# Set default DATABASE_URL if not provided (for Vercel deployment)
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL not set, using default SQLite database"
    export DATABASE_URL="file:./dev.db"
fi

# Only run migrations if not in Vercel (Vercel doesn't need local SQLite migrations)
if [ -z "$VERCEL" ]; then
    echo "Running locally - applying database migrations..."
    npx prisma migrate deploy
else
    echo "Running on Vercel - skipping local database migrations"
    # Just generate the Prisma client
    npx prisma generate
fi

echo "Building Next.js application..."
next build

echo "Build complete!"
