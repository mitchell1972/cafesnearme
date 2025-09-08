#!/bin/bash

# Load environment variables from .env file
export $(grep -v '^#' .env | xargs)

# Verify environment variables are set
echo "Checking environment variables..."
if [ -z "$VERCEL_ORG_ID" ]; then
    echo "Error: VERCEL_ORG_ID is not set"
    exit 1
fi

if [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "Error: VERCEL_PROJECT_ID is not set"
    exit 1
fi

if [ -z "$VERCEL_TOKEN" ]; then
    echo "Error: VERCEL_TOKEN is not set"
    exit 1
fi

echo "✓ VERCEL_ORG_ID: $VERCEL_ORG_ID"
echo "✓ VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
echo "✓ VERCEL_TOKEN: [HIDDEN]"

# First, let's link the project
echo ""
echo "Linking Vercel project..."
npx vercel link --yes --token "$VERCEL_TOKEN"

# Now deploy with simpler command
echo ""
echo "Starting Vercel deployment (simplified)..."
npx vercel --prod --token "$VERCEL_TOKEN" --yes
