# Vercel Setup Instructions

The GitHub Actions workflow is failing because the Vercel secrets haven't been configured yet. Follow these steps to set up Vercel deployment:

## Step 1: Deploy to Vercel First (Manual Initial Deploy)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `mitchell1972/cafesnearme`
4. Click "Deploy" (use default settings for now)

## Step 2: Get Your Vercel Credentials

### Get Vercel Token:
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click "Create"
3. Name it: "GitHub Actions"
4. Expiration: No expiration (or set as needed)
5. Scope: Full Account
6. Click "Create Token"
7. Copy the token immediately (you won't see it again!)

### Get Organization and Project IDs:
1. Go to your Vercel dashboard
2. Click on your `cafesnearme` project
3. Go to Settings (gear icon)
4. In the General section, you'll find:
   - **Project ID**: Something like `prj_xxxxxxxxxxxx`
   - **Team ID** (Organization ID): Something like `team_xxxxxxxxxxxx` or your username if personal account

## Step 3: Add Secrets to GitHub

1. Go to your GitHub repository: https://github.com/mitchell1972/cafesnearme
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Add these repository secrets:

### VERCEL_TOKEN
- Click "New repository secret"
- Name: `VERCEL_TOKEN`
- Value: The token you copied from Vercel
- Click "Add secret"

### VERCEL_ORG_ID
- Click "New repository secret"
- Name: `VERCEL_ORG_ID`
- Value: Your Team ID from Vercel (or username if personal account)
- Click "Add secret"

### VERCEL_PROJECT_ID
- Click "New repository secret"
- Name: `VERCEL_PROJECT_ID`
- Value: Your Project ID from Vercel
- Click "Add secret"

## Step 4: Add Environment Variables in Vercel

1. In your Vercel project settings
2. Go to "Environment Variables"
3. Add these variables:

```
DATABASE_URL = your_postgresql_connection_string
NEXT_PUBLIC_APP_URL = https://your-project-name.vercel.app
```

For database, you can use:
- Vercel Postgres (Storage → Create Database)
- Supabase (free tier)
- Neon (free tier)
- Any PostgreSQL provider

## Step 5: Re-run the Failed Workflow

1. Go to your GitHub repository
2. Click "Actions" tab
3. Find the failed workflow
4. Click "Re-run all jobs"

## Alternative: Deploy Using Vercel CLI Locally

If you want to test the deployment locally first:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### If you see "Project not found":
- Make sure you've deployed to Vercel at least once manually
- Check that VERCEL_PROJECT_ID matches your project

### If you see "Invalid token":
- Regenerate the token in Vercel
- Update the GitHub secret

### If build fails:
- Check that DATABASE_URL is set in Vercel environment variables
- Ensure Prisma can connect to your database
