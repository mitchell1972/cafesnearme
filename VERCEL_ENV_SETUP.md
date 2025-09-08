# Vercel Environment Variables Setup Guide

## Quick Setup for Local Deployment

### Step 1: Get Your Vercel Credentials

1. **Get Vercel Token:**
   ```
   https://vercel.com/account/tokens
   ```
   - Click "Create Token"
   - Name: "GitHub Actions" or "Local Deploy"
   - Scope: Full Account
   - Copy the token immediately

2. **Get Organization and Project IDs:**
   ```
   https://vercel.com/dashboard
   ```
   - Click on your `cafesnearme` project
   - Go to Settings tab
   - Find and copy:
     - **Project ID**: `prj_xxxxxxxxxxxx`
     - **Organization ID**: Your username or `team_xxxxxxxxxxxx`

### Step 2: Set Environment Variables

Choose one of these methods:

#### Option A: Quick Export (Temporary - Current Session Only)
```bash
export VERCEL_ORG_ID="your-username-or-team-id"
export VERCEL_PROJECT_ID="prj_your_project_id"
export VERCEL_TOKEN="your_vercel_token"
```

#### Option B: Add to .env File (Project-Specific)
```bash
# Add to your .env file
echo 'VERCEL_ORG_ID=your-username-or-team-id' >> .env
echo 'VERCEL_PROJECT_ID=prj_your_project_id' >> .env
echo 'VERCEL_TOKEN=your_vercel_token' >> .env
```

#### Option C: Add to Shell Profile (Permanent)
```bash
# For macOS/Linux (zsh)
echo 'export VERCEL_ORG_ID="your-username-or-team-id"' >> ~/.zshrc
echo 'export VERCEL_PROJECT_ID="prj_your_project_id"' >> ~/.zshrc
echo 'export VERCEL_TOKEN="your_vercel_token"' >> ~/.zshrc
source ~/.zshrc

# For bash
echo 'export VERCEL_ORG_ID="your-username-or-team-id"' >> ~/.bashrc
echo 'export VERCEL_PROJECT_ID="prj_your_project_id"' >> ~/.bashrc
echo 'export VERCEL_TOKEN="your_vercel_token"' >> ~/.bashrc
source ~/.bashrc
```

### Step 3: Deploy Using the Script

```bash
# Make the script executable (if not already)
chmod +x vercel-deploy.sh

# Run the deployment script
./vercel-deploy.sh
```

The script will:
- Check if environment variables are set
- Offer to help you set them interactively if missing
- Deploy to Vercel with appropriate settings

## For GitHub Actions

If you're setting up GitHub Actions deployment:

### 1. Add Secrets to GitHub Repository

Go to: `https://github.com/mitchell1972/cafesnearme/settings/secrets/actions`

Add these repository secrets:
- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your organization/username
- `VERCEL_PROJECT_ID`: Your project ID (prj_xxx)

### 2. The workflow will automatically use these secrets

The `.github/workflows/deploy.yml` file is already configured to use these secrets.

## Troubleshooting

### Error: "Unexpected error. Please try again later"
**Possible causes:**
1. **Missing or incorrect environment variables**
   - Verify all three variables are set correctly
   - Check that Project ID starts with `prj_`
   
2. **Invalid token**
   - Token might be expired or revoked
   - Create a new token at https://vercel.com/account/tokens

3. **Project not linked**
   - Make sure you've deployed to Vercel at least once manually
   - Or run `vercel link` to link the project

### Error: "Project not found"
- Verify VERCEL_PROJECT_ID matches your actual project
- Check you're using the correct organization ID

### Error: "Invalid token"
- Regenerate token at https://vercel.com/account/tokens
- Make sure you're copying the entire token

### Build Failures
- Check that DATABASE_URL is set in Vercel Environment Variables
- Ensure all required environment variables are configured in Vercel dashboard

## Verify Your Setup

Run this command to check if variables are set:
```bash
echo "VERCEL_ORG_ID: ${VERCEL_ORG_ID:-NOT SET}"
echo "VERCEL_PROJECT_ID: ${VERCEL_PROJECT_ID:-NOT SET}"
echo "VERCEL_TOKEN: ${VERCEL_TOKEN:+SET}"
```

## Manual Vercel CLI Commands

If you prefer to use Vercel CLI directly:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login (first time only)
vercel login

# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Deploy with token (no login needed)
vercel --token=$VERCEL_TOKEN --prod
```

## Example Values

For reference, your environment variables should look similar to:

```bash
# Personal account example
VERCEL_ORG_ID="mitchell1972"
VERCEL_PROJECT_ID="prj_V3tFkL2nR8xY9mZ1qW4s"
VERCEL_TOKEN="5WXLz3OZtGfHk9LqN2vR8mYx"

# Team account example
VERCEL_ORG_ID="team_V3tFkL2nR8xY9mZ1qW4s"
VERCEL_PROJECT_ID="prj_A7bC3dE9fG2hJ5kL8mN"
VERCEL_TOKEN="5WXLz3OZtGfHk9LqN2vR8mYx"
```

## Security Notes

⚠️ **NEVER commit your VERCEL_TOKEN to git!**
- Add `.env` to `.gitignore` if not already there
- Use GitHub Secrets for CI/CD
- Rotate tokens regularly
- Use environment-specific tokens when possible
