# How to Find Your Vercel Project ID and Organization ID

## Method 1: Vercel Dashboard (Easiest)

1. **Go to your Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Click on your project**
   - Look for "cafesnearme" in your projects list
   - Click on it to open the project

3. **Go to Settings**
   - Look for the "Settings" tab at the top of the page
   - Click on it

4. **Find the IDs in General Settings**
   - Scroll down to the "Project Settings" section
   - You'll see:
     ```
     Project Name: cafesnearme
     Project ID: prj_xxxxxxxxxxxxxxxxxx
     ```
   - Below that, you might see:
     ```
     Team: Your Team Name (or your username)
     Team ID: team_xxxxxxxxxxxxxxxxxx
     ```

**Note**: 
- Project ID always starts with `prj_`
- Team ID starts with `team_` (or it might just be your username if using personal account)

## Method 2: Project URL

When you're in your project, check the URL. It might look like:
```
https://vercel.com/your-username/cafesnearme
```
or
```
https://vercel.com/your-team-name/cafesnearme
```

The part after `vercel.com/` and before `/cafesnearme` is your Organization ID.

## Method 3: Vercel CLI (If you have it installed)

```bash
# First, link your project
vercel link

# Then view project info
vercel project ls
```

This will show your projects with their IDs.

## What You Need for GitHub Secrets:

1. **VERCEL_TOKEN**: Get from https://vercel.com/account/tokens
2. **VERCEL_ORG_ID**: Your username or team ID
3. **VERCEL_PROJECT_ID**: The `prj_xxxxx` value

## Example Values:

If you're using a personal account:
```
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxx
VERCEL_ORG_ID=mitchell1972
VERCEL_PROJECT_ID=prj_1234567890abcdef
```

If you're using a team account:
```
VERCEL_TOKEN=xxxxxxxxxxxxxxxxxxxx
VERCEL_ORG_ID=team_1234567890abcdef
VERCEL_PROJECT_ID=prj_1234567890abcdef
```

## Still Can't Find It?

Try this direct link pattern:
1. Go to: https://vercel.com/[your-username]/cafesnearme/settings
2. Replace `[your-username]` with your actual Vercel username

The Project ID will be clearly displayed on that settings page.
