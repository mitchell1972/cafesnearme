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

# Run the Vercel deployment
echo ""
echo "Starting Vercel deployment..."
npx vercel@25.1.0 --prod \
  -t "$VERCEL_TOKEN" \
  -m githubCommitSha=06a1d46d9b7cb061a494750da3a7974e12c763d7 \
  -m githubCommitAuthorName=mitchell1972 \
  -m githubCommitAuthorLogin=mitchell1972 \
  -m githubDeployment=1 \
  -m githubOrg=mitchell1972 \
  -m githubRepo=cafesnearme \
  -m githubCommitOrg=mitchell1972 \
  -m githubCommitRepo=cafesnearme \
  -m githubCommitMessage="fix: make build script compatible with local and Vercel environments" \
  -m githubCommitRef=main
