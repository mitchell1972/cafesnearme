# WHERE TO FIND YOUR VERCEL CREDENTIALS - SIMPLE GUIDE

## 1. GET YOUR TOKEN (VERCEL_TOKEN)

### Go to this exact link:
### 👉 https://vercel.com/account/tokens

1. **Click "Create" button** (it's a black button)
2. **Fill in:**
   - Token Name: `GitHub Actions`
   - Scope: `Full Account` (select this option)
   - Expiration: `No Expiration`
3. **Click "Create Token"**
4. **COPY THE TOKEN NOW!** (looks like: `5WXLz3OZtGfHk9LqN2vR8mYx...`)
   - ⚠️ You can't see it again after leaving this page!

---

## 2. GET YOUR ORG ID (VERCEL_ORG_ID)

### Go to this link:
### 👉 https://vercel.com/dashboard

1. **Click on your "cafesnearme" project**
2. **Look at your browser's address bar**
3. **The URL will be:**
   ```
   https://vercel.com/YOUR-ORG-ID-HERE/cafesnearme
   ```

### EXAMPLE:
If your URL is: `https://vercel.com/mitchell1972/cafesnearme`
- Your VERCEL_ORG_ID is: `mitchell1972`

If your URL is: `https://vercel.com/mitchells-projects-99699068/cafesnearme`
- Your VERCEL_ORG_ID is: `mitchells-projects-99699068`

---

## 3. GET YOUR PROJECT ID (VERCEL_PROJECT_ID)

### While still in your project:

1. **Click the "Settings" tab** (at the top of the page)
2. **Scroll down** until you see a section with:
   ```
   Project Name: cafesnearme
   Project ID: prj_xxxxxxxxxxxxxxxxxx
   ```
3. **Copy the Project ID** (starts with `prj_`)

### ALTERNATIVE: Direct Link
Go directly to:
### 👉 https://vercel.com/[YOUR-ORG-ID]/cafesnearme/settings
(Replace [YOUR-ORG-ID] with the org ID you found in step 2)

The Project ID will be shown on this page.

---

## SUMMARY - YOUR THREE VALUES:

After following the steps above, you should have:

1. **VERCEL_TOKEN**: `5WXLz3OZtGfHk9LqN2vR8mYx...` (from tokens page)
2. **VERCEL_ORG_ID**: `mitchell1972` (from the URL)
3. **VERCEL_PROJECT_ID**: `prj_V3tFkL2nR8xY9mZ1qW4s` (from settings page)

---

## WHAT TO DO WITH THESE VALUES:

### For Local Testing:
```bash
export VERCEL_ORG_ID="your-org-id-here"
export VERCEL_PROJECT_ID="prj_your-project-id-here"
export VERCEL_TOKEN="your-token-here"
```

### For GitHub (You already have these set):
Add them as secrets in:
https://github.com/mitchell1972/cafesnearme/settings/secrets/actions

---

## CAN'T FIND SOMETHING?

### Token Not Working?
- You need to CREATE a new token
- Old tokens can't be viewed again
- Go to: https://vercel.com/account/tokens

### Can't Find Org ID?
- It's literally in the URL when you open your project
- Example: vercel.com/**mitchell1972**/cafesnearme
- The bold part is your org ID

### Can't Find Project ID?
- Open your project → Click Settings → Scroll down
- It will say "Project ID: prj_xxxxx"
- Must start with "prj_"
