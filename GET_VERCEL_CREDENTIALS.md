# How to Get Your Vercel Credentials - Step by Step Guide

## 1. Getting Your VERCEL_TOKEN

### Step 1: Go to Vercel Account Tokens Page
**Direct Link:** https://vercel.com/account/tokens

### Step 2: Create a New Token
1. Click the **"Create"** button
2. Fill in the details:
   - **Token Name:** `GitHub Actions` (or any name you prefer)
   - **Scope:** Select `Full Account`
   - **Expiration:** Choose `No Expiration` (or set a date if you prefer)
3. Click **"Create Token"**

### Step 3: Copy the Token
⚠️ **IMPORTANT:** Copy the token immediately! You won't be able to see it again.
- The token will look something like: `5WXLz3OZtGfHk9LqN2vR8mYx...`
- Save it somewhere secure temporarily

---

## 2. Getting Your VERCEL_ORG_ID and VERCEL_PROJECT_ID

### Method A: From Vercel Dashboard (Easiest)

#### Step 1: Go to Your Vercel Dashboard
**Direct Link:** https://vercel.com/dashboard

#### Step 2: Click on Your Project
- Look for **"cafesnearme"** in your projects list
- Click on it to open the project

#### Step 3: Go to Settings
- Once in your project, click the **"Settings"** tab at the top

#### Step 4: Find Your IDs
Scroll down and you'll see a section that shows:

```
Project Name: cafesnearme
Project ID: prj_xxxxxxxxxxxxxxxxxx    ← This is your VERCEL_PROJECT_ID
```

For the Organization ID, look for one of these:
- If you see **"Personal Account"**, your VERCEL_ORG_ID is your username
- If you see **"Team:"** followed by a name, look for the Team ID below it

### Method B: From the URL

When you're in your project settings, check the URL in your browser:

```
https://vercel.com/[YOUR-ORG-ID]/cafesnearme/settings
                    ↑
            This is your VERCEL_ORG_ID
```

Examples:
- Personal: `https://vercel.com/mitchell1972/cafesnearme/settings`
  - VERCEL_ORG_ID = `mitchell1972`
- Team: `https://vercel.com/mitchells-projects-99699068/cafesnearme/settings`
  - VERCEL_ORG_ID = `mitchells-projects-99699068`

---

## 3. Quick Check - Are These the Right Values?

Your values should look like this:

### VERCEL_TOKEN
- Starts with random letters/numbers
- Usually 24+ characters long
- Example: `5WXLz3OZtGfHk9LqN2vR8mYx`

### VERCEL_ORG_ID
- **Personal account:** Your Vercel username (e.g., `mitchell1972`)
- **Team account:** Team slug or ID (e.g., `team_xxxxxx` or `mitchells-projects-99699068`)

### VERCEL_PROJECT_ID
- Always starts with `prj_`
- Followed by random characters
- Example: `prj_V3tFkL2nR8xY9mZ1qW4s`

---

## 4. Setting These Values Locally

Once you have all three values, set them in your terminal:

```bash
# Replace with your actual values
export VERCEL_ORG_ID="mitchell1972"  # or your team ID
export VERCEL_PROJECT_ID="prj_V3tFkL2nR8xY9mZ1qW4s"
export VERCEL_TOKEN="5WXLz3OZtGfHk9LqN2vR8mYx"
```

Or save them to a `.env` file (don't commit this!):

```bash
# Create .env file
cat > .env << EOF
VERCEL_ORG_ID=mitchell1972
VERCEL_PROJECT_ID=prj_V3tFkL2nR8xY9mZ1qW4s
VERCEL_TOKEN=5WXLz3OZtGfHk9LqN2vR8mYx
EOF
```

---

## 5. Can't Find Them? Alternative Methods

### Use Vercel CLI to Find Project Info

If you have Vercel CLI installed and are logged in:

```bash
# Install Vercel CLI if needed
npm i -g vercel

# Login to Vercel
vercel login

# List your projects
vercel project ls

# This will show your projects with their IDs
```

### Check Existing Deployments

1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Click on any deployment
4. In the deployment URL, you can often see the org ID

---

## 6. Still Need Help?

If you're still having trouble finding these values:

1. **For Project ID:** 
   - Direct link to your project settings: 
   - https://vercel.com/dashboard/cafesnearme/settings
   - The Project ID will be clearly shown there

2. **For Org ID:**
   - Check your Vercel profile: https://vercel.com/account
   - Your username shown there is your Org ID for personal accounts

3. **For Token:**
   - You must create a new one at: https://vercel.com/account/tokens
   - There's no way to retrieve existing tokens

---

## Security Reminder

🔒 **NEVER share your VERCEL_TOKEN publicly!**
- Don't commit it to Git
- Don't post it in issues or forums
- Treat it like a password

If you accidentally expose your token:
1. Go to https://vercel.com/account/tokens
2. Delete the compromised token immediately
3. Create a new one
