#!/bin/bash

# Vercel Deployment Debugging Script
# This script helps diagnose Vercel deployment issues

echo "========================================="
echo "Vercel Deployment Diagnostic Tool"
echo "========================================="
echo ""

# Check if we're in GitHub Actions or local
if [ -n "$GITHUB_ACTIONS" ]; then
    echo "✓ Running in GitHub Actions environment"
    echo ""
    echo "GitHub Environment Variables:"
    echo "  GITHUB_REPOSITORY: $GITHUB_REPOSITORY"
    echo "  GITHUB_REF: $GITHUB_REF"
    echo "  GITHUB_SHA: $GITHUB_SHA"
    echo "  GITHUB_ACTOR: $GITHUB_ACTOR"
else
    echo "✓ Running in local environment"
fi

echo ""
echo "========================================="
echo "1. Checking Vercel Environment Variables"
echo "========================================="

# Check environment variables
if [ -n "$VERCEL_ORG_ID" ]; then
    echo "✓ VERCEL_ORG_ID is set: ${VERCEL_ORG_ID}"
else
    echo "✗ VERCEL_ORG_ID is NOT set"
fi

if [ -n "$VERCEL_PROJECT_ID" ]; then
    echo "✓ VERCEL_PROJECT_ID is set: ${VERCEL_PROJECT_ID}"
else
    echo "✗ VERCEL_PROJECT_ID is NOT set"
fi

if [ -n "$VERCEL_TOKEN" ]; then
    echo "✓ VERCEL_TOKEN is set (hidden)"
else
    echo "✗ VERCEL_TOKEN is NOT set"
fi

echo ""
echo "========================================="
echo "2. Testing Vercel API Connection"
echo "========================================="

if [ -n "$VERCEL_TOKEN" ]; then
    echo "Testing API connection..."
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v2/user")
    
    if [ "$response" = "200" ]; then
        echo "✓ Successfully authenticated with Vercel API"
        
        # Get user info
        user_info=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
            "https://api.vercel.com/v2/user")
        username=$(echo "$user_info" | grep -o '"username":"[^"]*' | cut -d'"' -f4)
        email=$(echo "$user_info" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
        
        echo "  Authenticated as: $username ($email)"
    else
        echo "✗ Failed to authenticate with Vercel API (HTTP $response)"
        echo "  This usually means the token is invalid or expired"
    fi
else
    echo "⚠ Skipping API test (no token set)"
fi

echo ""
echo "========================================="
echo "3. Checking Project Configuration"
echo "========================================="

# Check if vercel.json exists
if [ -f "vercel.json" ]; then
    echo "✓ vercel.json found"
    echo "  Content:"
    cat vercel.json | sed 's/^/    /'
else
    echo "✗ vercel.json not found"
fi

echo ""

# Check if .vercel directory exists (indicates project is linked)
if [ -d ".vercel" ]; then
    echo "✓ .vercel directory exists (project appears to be linked)"
    if [ -f ".vercel/project.json" ]; then
        echo "  Project configuration:"
        cat .vercel/project.json | sed 's/^/    /'
    fi
else
    echo "⚠ .vercel directory not found (project may not be linked)"
    echo "  Run 'vercel link' to link this project"
fi

echo ""
echo "========================================="
echo "4. Testing Project Access"
echo "========================================="

if [ -n "$VERCEL_TOKEN" ] && [ -n "$VERCEL_PROJECT_ID" ]; then
    echo "Checking project access..."
    
    # Try to get project info
    project_response=$(curl -s -o /dev/null -w "%{http_code}" \
        -H "Authorization: Bearer $VERCEL_TOKEN" \
        "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID")
    
    if [ "$project_response" = "200" ]; then
        echo "✓ Successfully accessed project $VERCEL_PROJECT_ID"
        
        # Get project details
        project_info=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
            "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID")
        project_name=$(echo "$project_info" | grep -o '"name":"[^"]*' | head -1 | cut -d'"' -f4)
        
        echo "  Project name: $project_name"
    elif [ "$project_response" = "404" ]; then
        echo "✗ Project not found (404)"
        echo "  The project ID may be incorrect or the project doesn't exist"
    elif [ "$project_response" = "403" ]; then
        echo "✗ Access denied (403)"
        echo "  The token doesn't have access to this project"
    else
        echo "✗ Failed to access project (HTTP $project_response)"
    fi
else
    echo "⚠ Skipping project access test (missing token or project ID)"
fi

echo ""
echo "========================================="
echo "5. Checking Node.js and npm"
echo "========================================="

node_version=$(node --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ Node.js version: $node_version"
else
    echo "✗ Node.js not found"
fi

npm_version=$(npm --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✓ npm version: $npm_version"
else
    echo "✗ npm not found"
fi

echo ""
echo "========================================="
echo "6. Testing Minimal Deployment"
echo "========================================="

echo "Would you like to test a minimal deployment? (y/n)"
read -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -n "$VERCEL_TOKEN" ]; then
        echo "Attempting minimal deployment..."
        echo ""
        
        # Try deployment with explicit environment variables
        VERCEL_ORG_ID="$VERCEL_ORG_ID" \
        VERCEL_PROJECT_ID="$VERCEL_PROJECT_ID" \
        npx vercel@latest --token="$VERCEL_TOKEN" --yes 2>&1 | tee vercel-debug.log
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            echo ""
            echo "✓ Deployment succeeded!"
        else
            echo ""
            echo "✗ Deployment failed. Check vercel-debug.log for details"
            echo ""
            echo "Last 20 lines of error log:"
            tail -20 vercel-debug.log
        fi
    else
        echo "Cannot test deployment without VERCEL_TOKEN"
    fi
fi

echo ""
echo "========================================="
echo "Diagnostic Summary"
echo "========================================="

# Count issues
issues=0
warnings=0

[ -z "$VERCEL_ORG_ID" ] && ((issues++))
[ -z "$VERCEL_PROJECT_ID" ] && ((issues++))
[ -z "$VERCEL_TOKEN" ] && ((issues++))
[ ! -f "vercel.json" ] && ((warnings++))
[ ! -d ".vercel" ] && ((warnings++))

if [ $issues -eq 0 ] && [ $warnings -eq 0 ]; then
    echo "✓ No issues detected. Environment appears to be configured correctly."
    echo ""
    echo "If deployment is still failing, the issue might be:"
    echo "1. Database connection issues (check DATABASE_URL in Vercel)"
    echo "2. Build errors in your application code"
    echo "3. Missing dependencies or configuration"
    echo "4. Vercel service issues (check status.vercel.com)"
elif [ $issues -gt 0 ]; then
    echo "✗ Found $issues critical issue(s) that need to be fixed"
    echo ""
    echo "Please set the missing environment variables and try again"
else
    echo "⚠ Found $warnings warning(s) that might cause issues"
    echo ""
    echo "Consider running 'vercel link' to properly link your project"
fi

echo ""
echo "For more help, see VERCEL_ENV_SETUP.md"
