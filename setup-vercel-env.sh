#!/bin/bash

# Your Vercel credentials
export VERCEL_TOKEN="B3IhRl1dbDOlmjBHsX4hD8Pu"
export VERCEL_PROJECT_ID="prj_V3tFkL2nR8xY9mZ1qW4s"

# You still need to set VERCEL_ORG_ID
echo "========================================="
echo "Setting up Vercel Environment Variables"
echo "========================================="
echo ""
echo "✓ VERCEL_TOKEN is set"
echo "✓ VERCEL_PROJECT_ID is set"
echo ""
echo "⚠️  You still need VERCEL_ORG_ID!"
echo ""
echo "To find your VERCEL_ORG_ID:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Click on your 'cafesnearme' project"
echo "3. Look at the URL in your browser:"
echo "   https://vercel.com/YOUR-ORG-ID/cafesnearme"
echo ""
echo "Common examples:"
echo "- If URL has 'mitchell1972': VERCEL_ORG_ID=mitchell1972"
echo "- If URL has 'mitchells-projects-99699068': VERCEL_ORG_ID=mitchells-projects-99699068"
echo ""
read -p "Enter your VERCEL_ORG_ID: " org_id

if [ -n "$org_id" ]; then
    export VERCEL_ORG_ID="$org_id"
    
    echo ""
    echo "✅ All environment variables are now set!"
    echo ""
    echo "VERCEL_ORG_ID=$VERCEL_ORG_ID"
    echo "VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID"
    echo "VERCEL_TOKEN=[HIDDEN]"
    
    # Save to .env file
    echo ""
    read -p "Save these to .env file for future use? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cat > .env << EOL
VERCEL_ORG_ID=$VERCEL_ORG_ID
VERCEL_PROJECT_ID=$VERCEL_PROJECT_ID
VERCEL_TOKEN=$VERCEL_TOKEN
DATABASE_URL="file:./dev.db"
EOL
        echo "✅ Saved to .env file"
    fi
    
    echo ""
    echo "Ready to deploy! Run:"
    echo "  ./vercel-deploy.sh"
    echo ""
    echo "Or test the configuration first:"
    echo "  ./vercel-debug.sh"
else
    echo "Please set VERCEL_ORG_ID and try again"
fi
