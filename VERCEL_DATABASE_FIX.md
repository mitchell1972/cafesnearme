# Fix Database Import Error on Vercel

## The Problem
Your import is failing with: `Environment variable not found: DATABASE_URL`

This happens because:
1. SQLite (`file:./dev.db`) doesn't work properly on Vercel's serverless environment for write operations
2. Vercel needs a proper cloud database for data persistence

## Solution: Set Up a Cloud Database

### Option 1: Vercel Postgres (Recommended - Free Tier Available)

1. **Go to your Vercel Dashboard**
   - https://vercel.com/mitchells-projects-99699068/cafesnearme

2. **Click on "Storage" tab**

3. **Click "Create Database"**
   - Choose **Postgres**
   - Select your project: `cafesnearme`
   - Choose a region close to you
   - Click "Create"

4. **Vercel will automatically:**
   - Create the database
   - Add the `DATABASE_URL` to your project's environment variables
   - The URL will look like: `postgres://user:pass@host/database`

5. **Redeploy your app**
   - Go to Deployments tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

### Option 2: Supabase (Free Tier)

1. **Create account at** https://supabase.com

2. **Create a new project**

3. **Get your database URL:**
   - Go to Settings → Database
   - Copy the "Connection string" (URI)

4. **Add to Vercel:**
   - Go to: https://vercel.com/mitchells-projects-99699068/cafesnearme/settings/environment-variables
   - Add new variable:
     - Name: `DATABASE_URL`
     - Value: Your Supabase connection string
     - Environment: Production, Preview, Development
   - Click "Save"

### Option 3: Neon (Free Tier)

1. **Create account at** https://neon.tech

2. **Create a new project**

3. **Get your connection string**

4. **Add to Vercel** (same as Supabase step 4)

## After Setting Up the Database

### 1. Update your Prisma Schema (if using Postgres)

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite" to "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. Generate and Push Schema

Run locally:
```bash
# Update your local .env with the new DATABASE_URL
export DATABASE_URL="your-postgres-url-here"

# Generate Prisma Client for Postgres
npx prisma generate

# Push schema to the new database
npx prisma db push

# Commit changes
git add -A && git commit -m "feat: switch to PostgreSQL for production" && git push
```

### 3. Test Import Again

After the deployment completes, try importing your CSV file again at:
https://cafesnearme.vercel.app/admin/import

## Quick Fix (Temporary - Display Only)

If you just want to display data without import functionality:

1. Import data locally using SQLite
2. Export the data
3. Use a static JSON file for production

## Why SQLite Doesn't Work on Vercel

- Vercel uses serverless functions that don't have persistent file storage
- Each function invocation gets a fresh filesystem
- SQLite database files can't persist between requests
- You need a cloud database for production use

## Recommended: Use Vercel Postgres

It's the easiest option because:
- Automatic integration with your Vercel project
- Free tier available (5GB storage)
- No need to manage connection strings manually
- Automatic SSL and security
