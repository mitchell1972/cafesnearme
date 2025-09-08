# Vercel Deployment Troubleshooting Guide

## Error: "Unexpected error. Please try again later"

This error typically occurs when there's a mismatch between your local project configuration and Vercel's expectations. Here's how to fix it:

## Quick Fix Steps

### 1. Verify Your GitHub Secrets are Correct

Since you already have the secrets configured in GitHub (as shown in your screenshot), verify they match your Vercel project:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your `cafesnearme` project
3. Go to Settings → General
4. Verify:
   - **Project ID** matches `VERCEL_PROJECT_ID` in GitHub
   - **Team/Org ID** matches `VERCEL_ORG_ID` in GitHub

### 2. Link Your Project Locally (Required First Time)

The project needs to be linked at least once. Run locally:

```bash
# Set your environment variables first
export VERCEL_ORG_ID="your-org-id"
export VERCEL_PROJECT_ID="prj_your_project_id"
export VERCEL_TOKEN="your_token"

# Link the project
./vercel-link.sh

# Or use Vercel CLI directly
npx vercel link --yes --token=$VERCEL_TOKEN
```

### 3. Test Deployment Locally First

Before pushing to GitHub, test the deployment locally:

```bash
# Run the debug script to check configuration
./vercel-debug.sh

# Try a test deployment
npx vercel --token=$VERCEL_TOKEN
```

### 4. Fix the GitHub Actions Workflow

The error in your output shows the deployment is failing at the Vercel step. Update your workflow to ensure environment variables are properly passed:

```yaml
- name: Deploy to Vercel
  env:
    VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
  run: |
    npx vercel@latest pull --yes --environment=production --token=${{ secrets.VERCEL_TOKEN }}
    npx vercel@latest build --prod --token=${{ secrets.VERCEL_TOKEN }}
    npx vercel@latest deploy --prebuilt --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## Common Issues and Solutions

### Issue 1: Project Not Found
**Symptom:** Error mentions project cannot be found
**Solution:** 
- Ensure you've deployed to Vercel at least once manually through the dashboard
- Verify VERCEL_PROJECT_ID starts with `prj_`

### Issue 2: Invalid Token
**Symptom:** Authentication failures
**Solution:**
- Regenerate token at https://vercel.com/account/tokens
- Update GitHub secret with new token
- Ensure token has full account scope

### Issue 3: Organization Mismatch
**Symptom:** Deployment works locally but not in GitHub Actions
**Solution:**
- For personal accounts: Use your username as VERCEL_ORG_ID
- For team accounts: Use the team ID (starts with `team_`)
- Check the exact value in Vercel Dashboard → Settings

### Issue 4: Missing .vercel Directory
**Symptom:** "Project not linked" errors
**Solution:**
```bash
# Create the .vercel directory manually
mkdir -p .vercel
echo '{
  "projectId": "'$VERCEL_PROJECT_ID'",
  "orgId": "'$VERCEL_ORG_ID'"
}' > .vercel/project.json
```

## Debugging Commands

### Check Current Configuration
```bash
# Show environment variables (safely)
echo "VERCEL_ORG_ID: ${VERCEL_ORG_ID:-NOT SET}"
echo "VERCEL_PROJECT_ID: ${VERCEL_PROJECT_ID:-NOT SET}"
echo "VERCEL_TOKEN: ${VERCEL_TOKEN:+SET}"

# Test Vercel API
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v2/user
```

### Test Project Access
```bash
# Check if token can access the project
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects/$VERCEL_PROJECT_ID"
```

### Force Re-deployment
```bash
# Sometimes you need to force a fresh deployment
npx vercel --force --token=$VERCEL_TOKEN
```

## GitHub Actions Specific Issues

### Environment Not Set
Make sure your workflow uses the correct environment:

```yaml
jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production  # This line is crucial!
```

### Secrets Not Available
If secrets aren't being read:
1. Check they're in the correct environment (Production)
2. Verify no typos in secret names
3. Ensure workflow has permission to access secrets

## Alternative Deployment Method

If the standard deployment continues to fail, try this alternative approach:

```bash
# In your GitHub Actions workflow
- name: Deploy to Vercel (Alternative)
  run: |
    npm install -g vercel@latest
    vercel pull --yes --environment=production \
      --token=${{ secrets.VERCEL_TOKEN }} \
      --scope=${{ secrets.VERCEL_ORG_ID }}
    vercel build --prod --token=${{ secrets.VERCEL_TOKEN }}
    vercel deploy --prebuilt --prod \
      --token=${{ secrets.VERCEL_TOKEN }} \
      --scope=${{ secrets.VERCEL_ORG_ID }}
```

## Still Having Issues?

1. **Check Vercel Status**: https://status.vercel.com
2. **Review Build Logs**: In Vercel Dashboard → Your Project → Functions tab
3. **Enable Debug Mode**: Add `--debug` flag to Vercel commands
4. **Check GitHub Actions Logs**: Look for specific error messages in the workflow run

## Contact Support

If none of the above solutions work:
1. Vercel Support: https://vercel.com/support
2. GitHub Actions Support: https://support.github.com

Include in your support request:
- The exact error message
- Your project ID and organization ID (not the token!)
- Steps you've already tried
- Whether it works locally but not in CI/CD
