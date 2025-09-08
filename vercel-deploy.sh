#!/bin/bash

# Vercel Deployment Script with Environment Variables
# This script sets up the necessary environment variables and deploys to Vercel

echo "==================================="
echo "Vercel Deployment Setup"
echo "==================================="

# Check if environment variables are already set
if [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ] || [ -z "$VERCEL_TOKEN" ]; then
    echo ""
    echo "⚠️  Missing Vercel environment variables!"
    echo ""
    echo "You need to set the following environment variables:"
    echo "1. VERCEL_ORG_ID - Your Vercel organization/team ID or username"
    echo "2. VERCEL_PROJECT_ID - Your Vercel project ID (starts with prj_)"
    echo "3. VERCEL_TOKEN - Your Vercel authentication token"
    echo ""
    echo "==================================="
    echo "How to find these values:"
    echo "==================================="
    echo ""
    echo "1. VERCEL_TOKEN:"
    echo "   - Go to: https://vercel.com/account/tokens"
    echo "   - Create a new token"
    echo ""
    echo "2. VERCEL_ORG_ID and VERCEL_PROJECT_ID:"
    echo "   - Go to your Vercel dashboard: https://vercel.com/dashboard"
    echo "   - Click on your 'cafesnearme' project"
    echo "   - Go to Settings tab"
    echo "   - Find Project ID (starts with prj_)"
    echo "   - Find Team ID or use your username"
    echo ""
    echo "==================================="
    echo "Set them using one of these methods:"
    echo "==================================="
    echo ""
    echo "Method 1: Export in your terminal (temporary):"
    echo "  export VERCEL_ORG_ID='your-org-id'"
    echo "  export VERCEL_PROJECT_ID='prj_xxxxx'"
    echo "  export VERCEL_TOKEN='your-token'"
    echo ""
    echo "Method 2: Add to .env file (permanent for this project):"
    echo "  echo 'VERCEL_ORG_ID=your-org-id' >> .env"
    echo "  echo 'VERCEL_PROJECT_ID=prj_xxxxx' >> .env"
    echo "  echo 'VERCEL_TOKEN=your-token' >> .env"
    echo ""
    echo "Method 3: Add to ~/.zshrc or ~/.bashrc (permanent globally):"
    echo "  echo 'export VERCEL_ORG_ID=your-org-id' >> ~/.zshrc"
    echo "  echo 'export VERCEL_PROJECT_ID=prj_xxxxx' >> ~/.zshrc"
    echo "  echo 'export VERCEL_TOKEN=your-token' >> ~/.zshrc"
    echo "  source ~/.zshrc"
    echo ""
    
    # Offer to help set them interactively
    read -p "Would you like to set these values now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        read -p "Enter your VERCEL_ORG_ID (username or team_xxx): " org_id
        read -p "Enter your VERCEL_PROJECT_ID (prj_xxx): " project_id
        read -s -p "Enter your VERCEL_TOKEN (hidden): " token
        echo ""
        
        # Export for current session
        export VERCEL_ORG_ID="$org_id"
        export VERCEL_PROJECT_ID="$project_id"
        export VERCEL_TOKEN="$token"
        
        # Ask if they want to save to .env
        echo ""
        read -p "Save these to .env file? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Check if .env exists and has these values
            if [ -f .env ]; then
                # Remove existing values if present
                sed -i '' '/^VERCEL_ORG_ID=/d' .env 2>/dev/null || sed -i '/^VERCEL_ORG_ID=/d' .env
                sed -i '' '/^VERCEL_PROJECT_ID=/d' .env 2>/dev/null || sed -i '/^VERCEL_PROJECT_ID=/d' .env
                sed -i '' '/^VERCEL_TOKEN=/d' .env 2>/dev/null || sed -i '/^VERCEL_TOKEN=/d' .env
            fi
            
            # Add new values
            echo "VERCEL_ORG_ID=$org_id" >> .env
            echo "VERCEL_PROJECT_ID=$project_id" >> .env
            echo "VERCEL_TOKEN=$token" >> .env
            echo "✅ Saved to .env file"
        fi
    else
        echo "Please set the environment variables and run this script again."
        exit 1
    fi
fi

# Load from .env if it exists
if [ -f .env ]; then
    export $(cat .env | grep -E '^VERCEL_' | xargs)
fi

# Verify all variables are set
if [ -z "$VERCEL_ORG_ID" ] || [ -z "$VERCEL_PROJECT_ID" ] || [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Error: Environment variables are still not set properly."
    exit 1
fi

echo ""
echo "==================================="
echo "Environment Variables Set:"
echo "==================================="
echo "VERCEL_ORG_ID: $VERCEL_ORG_ID"
echo "VERCEL_PROJECT_ID: $VERCEL_PROJECT_ID"
echo "VERCEL_TOKEN: [HIDDEN]"
echo ""

# Check if we're in GitHub Actions or local environment
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "Running in GitHub Actions environment"
    
    # Get GitHub metadata
    GITHUB_SHA=${GITHUB_SHA:-$(git rev-parse HEAD)}
    GITHUB_ACTOR=${GITHUB_ACTOR:-$(git log -1 --pretty=format:'%an')}
    GITHUB_REPOSITORY=${GITHUB_REPOSITORY:-"mitchell1972/cafesnearme"}
    GITHUB_REF=${GITHUB_REF:-"refs/heads/main"}
    COMMIT_MESSAGE=$(git log -1 --pretty=format:'%s')
    
    # Deploy with metadata
    echo "Deploying to Vercel with GitHub metadata..."
    npx vercel@25.1.0 --prod \
        -t "$VERCEL_TOKEN" \
        -m "githubCommitSha=$GITHUB_SHA" \
        -m "githubCommitAuthorName=$GITHUB_ACTOR" \
        -m "githubCommitAuthorLogin=$GITHUB_ACTOR" \
        -m "githubDeployment=1" \
        -m "githubOrg=mitchell1972" \
        -m "githubRepo=cafesnearme" \
        -m "githubCommitOrg=mitchell1972" \
        -m "githubCommitRepo=cafesnearme" \
        -m "githubCommitMessage=$COMMIT_MESSAGE" \
        -m "githubCommitRef=${GITHUB_REF##*/}"
else
    echo "Running in local environment"
    
    # Ask for deployment type
    echo ""
    echo "Choose deployment type:"
    echo "1) Production deployment (--prod)"
    echo "2) Preview deployment"
    echo "3) Development deployment with build logs"
    read -p "Enter choice (1-3): " choice
    
    case $choice in
        1)
            echo "Deploying to production..."
            npx vercel@25.1.0 --prod -t "$VERCEL_TOKEN"
            ;;
        2)
            echo "Creating preview deployment..."
            npx vercel@25.1.0 -t "$VERCEL_TOKEN"
            ;;
        3)
            echo "Creating development deployment with build logs..."
            npx vercel@25.1.0 -t "$VERCEL_TOKEN" --build-env NODE_ENV=development --debug
            ;;
        *)
            echo "Invalid choice. Defaulting to preview deployment..."
            npx vercel@25.1.0 -t "$VERCEL_TOKEN"
            ;;
    esac
fi

# Check deployment result
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "Your site should be available at:"
    echo "https://cafesnearme.vercel.app (production)"
    echo "or check the URL provided above for preview deployments"
else
    echo ""
    echo "❌ Deployment failed!"
    echo ""
    echo "Common issues and solutions:"
    echo "1. Invalid token: Regenerate at https://vercel.com/account/tokens"
    echo "2. Wrong project ID: Check at https://vercel.com/dashboard → Settings"
    echo "3. Database not configured: Set DATABASE_URL in Vercel Environment Variables"
    echo "4. Build errors: Check the logs above for specific errors"
    echo ""
    echo "For more help, see VERCEL_SETUP.md"
fi
