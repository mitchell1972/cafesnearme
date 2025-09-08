#!/bin/bash

echo "Running build script..."

# Check if we're running on Vercel
if [ -n "$VERCEL" ]; then
    echo "Running on Vercel - generating Prisma client"
    # Generate Prisma client (DATABASE_URL should be set by Vercel)
    npx prisma generate
fi

echo "Building Next.js application..."
npx next build

echo "Build complete!"
