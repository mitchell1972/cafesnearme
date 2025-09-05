# Deployment Guide

This guide covers deploying the Cafes Near Me application to Vercel with GitHub Actions CI/CD.

## Prerequisites

1. GitHub repository (already set up)
2. Vercel account (free tier works)
3. PostgreSQL database (we'll use Vercel Postgres or external provider)

## Step 1: Database Setup

### Option A: Vercel Postgres (Recommended)
1. Go to your Vercel dashboard
2. Navigate to Storage → Create Database → Postgres
3. Create a new database named `cafesnearme`
4. Copy the connection string

### Option B: External Database (Supabase, Neon, etc.)
1. Create a PostgreSQL database with your provider
2. Get the connection string
3. Ensure it's accessible from Vercel's IP ranges

## Step 2: Deploy to Vercel

### Initial Deployment

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository `mitchell1972/cafesnearme`
4. Configure your project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)

5. Add Environment Variables:
   ```
   DATABASE_URL=your_postgres_connection_string
   NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
   ```

6. Click "Deploy"

### Get Vercel Tokens for GitHub Actions

1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Create a new token with full scope
3. Copy the token

4. In your Vercel project settings, copy:
   - Organization ID (in General settings)
   - Project ID (in General settings)

5. Add GitHub Secrets:
   - Go to your GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel token
     - `VERCEL_ORG_ID`: Your Vercel organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel project ID

## Step 3: GitHub Actions Setup

The following workflows are already configured:

### CI Workflow (`.github/workflows/ci.yml`)
- Runs on every push and PR
- Lints code with ESLint
- Type checks with TypeScript
- Runs tests (if configured)
- Builds the application

### Deploy Workflow (`.github/workflows/deploy.yml`)
- Runs on push to main branch
- Deploys to production on Vercel

### Preview Workflow (`.github/workflows/preview.yml`)
- Runs on pull requests
- Creates preview deployments
- Comments the preview URL on the PR

## Step 4: Post-Deployment Setup

1. **Run Database Migrations**:
   ```bash
   # Connect to your production database
   DATABASE_URL=your_production_database_url npx prisma db push
   ```

2. **Import Initial Data**:
   - Visit `https://your-project.vercel.app/admin/import`
   - Upload your cafe data CSV/Excel file

3. **Configure Custom Domain** (Optional):
   - In Vercel project settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

## Continuous Deployment

Now your setup is complete! Here's how it works:

1. **Development**:
   - Create feature branches
   - Push changes
   - CI runs automatically
   - Preview deployments created for PRs

2. **Production**:
   - Merge PR to main branch
   - Automatic deployment to production
   - Zero-downtime deployments

## Environment Variables Reference

Required for production:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: Your production URL

Optional:
- `GOOGLE_MAPS_API_KEY`: For enhanced geocoding
- `NEXT_PUBLIC_MAPBOX_TOKEN`: For map features

## Monitoring

1. **Vercel Dashboard**: Monitor deployments, functions, and errors
2. **GitHub Actions**: Check workflow runs in Actions tab
3. **Database**: Monitor via your database provider's dashboard

## Troubleshooting

### Build Failures
- Check GitHub Actions logs
- Ensure all environment variables are set
- Verify database connection

### Database Issues
- Ensure DATABASE_URL is correct
- Check if database is accessible from Vercel
- Run `npx prisma generate` in build command if needed

### Performance
- Enable ISR for dynamic pages
- Use Vercel Edge Functions for API routes
- Monitor Core Web Vitals in Vercel Analytics
