#!/bin/bash

# Vercel Project Linking Script
# This script helps link your local project to Vercel

echo "========================================="
echo "Vercel Project Linking Tool"
echo "========================================="
echo ""

# Check if .vercel directory exists
if [ -d ".vercel" ]; then
    echo "⚠️  Project appears to be already linked (.vercel directory exists)"
    echo ""
    if [ -f ".vercel/project.json" ]; then
        echo "Current configuration:"
        cat .vercel/project.json | python3 -m json.tool 2>/dev/null || cat .vercel/project.json
        echo ""
    fi
    read -p "Do you want to re-link the project? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing configuration."
        exit 0
    fi
    echo "Removing existing .vercel directory..."
    rm -rf .vercel
fi

# Check for environment variables
echo "Checking environment variables..."
echo ""

if [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ]; then
    echo "⚠️  Missing required environment variables"
    echo ""
    echo "You need to set:"
    echo "  - VERCEL_ORG_ID (your username or team ID)"
    echo "  - VERCEL_PROJECT_ID (starts with prj_)"
    echo ""
    echo "Would you like to set them now? (y/n)"
    read -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter VERCEL_ORG_ID: " org_id
        read -p "Enter VERCEL_PROJECT_ID: " project_id
        export VERCEL_ORG_ID="$org_id"
        export VERCEL_PROJECT_ID="$project_id"
    else
        echo "Please set the environment variables first."
        exit 1
    fi
fi

echo "Using:"
echo "  VERCEL_ORG_ID: $VERCEL_ORG_ID"
echo "  VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
echo ""

# Create .vercel directory
echo "Creating .vercel directory..."
mkdir -p .vercel

# Create project.json
echo "Creating project configuration..."
cat > .vercel/project.json << EOF
{
  "projectId": "$VERCEL_PROJECT_ID",
  "orgId": "$VERCEL_ORG_ID",
  "settings": {
    "createdAt": $(date +%s)000,
    "framework": "nextjs",
    "devCommand": null,
    "installCommand": null,
    "buildCommand": null,
    "outputDirectory": null,
    "rootDirectory": null,
    "directoryListing": false,
    "nodeVersion": "18.x"
  }
}
EOF

echo "✅ Project linked successfully!"
echo ""

# Check if .gitignore includes .vercel
if [ -f ".gitignore" ]; then
    if ! grep -q "^\.vercel" .gitignore; then
        echo "Adding .vercel to .gitignore..."
        echo ".vercel" >> .gitignore
        echo "✅ Added .vercel to .gitignore"
    else
        echo "✅ .vercel is already in .gitignore"
    fi
else
    echo "Creating .gitignore with .vercel..."
    echo ".vercel" > .gitignore
    echo "✅ Created .gitignore"
fi

echo ""
echo "========================================="
echo "Next Steps:"
echo "========================================="
echo ""
echo "1. Test deployment locally:"
echo "   ./vercel-deploy.sh"
echo ""
echo "2. Or deploy directly with Vercel CLI:"
echo "   npx vercel --token=\$VERCEL_TOKEN"
echo ""
echo "3. For production deployment:"
echo "   npx vercel --prod --token=\$VERCEL_TOKEN"
echo ""
echo "Note: Make sure VERCEL_TOKEN is also set for deployment"
