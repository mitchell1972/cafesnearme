# Setting Up Database in Vercel

## 🎉 Good News!
Your deployment is connecting to Vercel! Now we just need to set up the database.

## Option 1: Use Vercel Postgres (Easiest)

1. **Go to your Vercel project**
   - https://vercel.com/dashboard
   - Click on your `cafesnearme` project

2. **Create a Postgres database**
   - Click "Storage" tab
   - Click "Create Database"
   - Select "Postgres"
   - Choose a name (e.g., `cafesnearme-db`)
   - Select your region (same as your app: `lhr1` for London)
   - Click "Create"

3. **Connect to your project**
   - Vercel will automatically add the `POSTGRES_*` variables
   - It also adds a `DATABASE_URL` variable

4. **Redeploy**
   - The deployment will automatically restart

## Option 2: Use External Database (Supabase, Neon, etc.)

1. **Create a database** with your provider:
   - [Supabase](https://supabase.com) - Free tier available
   - [Neon](https://neon.tech) - Free tier available
   - [PlanetScale](https://planetscale.com) - Free tier available

2. **Get your connection string**
   - Should look like: `postgresql://user:password@host:port/database`

3. **Add to Vercel Environment Variables**
   - Go to your project settings
   - Click "Environment Variables"
   - Add:
     ```
     Name: DATABASE_URL
     Value: your-connection-string
     Environment: Production
     ```
   - Click "Save"

4. **Redeploy**
   - Go to "Deployments" tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

## After Database Setup

Once your database is connected:

1. **Run migrations** (one-time setup):
   ```bash
   DATABASE_URL=your-connection-string npx prisma db push
   ```

2. **Visit your deployed site**
   - Check the Vercel dashboard for your URL
   - It will be something like: `https://cafesnearme-xxxxx.vercel.app`

3. **Import cafe data**
   - Go to: `https://your-site.vercel.app/admin/import`
   - Upload your cafe data

## Quick Fix for Now

To get past this error and see if everything else works:

1. Go to Vercel project settings
2. Add a temporary DATABASE_URL:
   ```
   Name: DATABASE_URL
   Value: postgresql://temp:temp@localhost:5432/temp
   ```
3. This will let the build complete (the app won't work without a real database, but you'll see if the deployment works)
