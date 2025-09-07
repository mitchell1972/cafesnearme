# Double-Check Your GitHub Secrets

The error `--token=` (empty) suggests the VERCEL_TOKEN secret might not be set correctly. Let's verify:

## 1. Check Secret Names (Case Sensitive!)

Go to: https://github.com/mitchell1972/cafesnearme/settings/secrets/actions

Make sure you have these EXACT names:
- `VERCEL_TOKEN` (not `VERCEL_AUTH_TOKEN` or `vercel_token`)
- `VERCEL_ORG_ID` (not `VERCEL_TEAM_ID`)
- `VERCEL_PROJECT_ID` (not `PROJECT_ID`)

## 2. Re-create VERCEL_TOKEN

Sometimes tokens have issues. Try creating a new one:

1. Go to: https://vercel.com/account/tokens
2. Delete the old token (if any)
3. Create a new token:
   - Name: `github-actions-2`
   - Expiration: No expiration
   - Scope: Full Account
4. Copy the token IMMEDIATELY
5. Go to GitHub secrets
6. Update the `VERCEL_TOKEN` secret with the new value

## 3. Test Token Locally

You can test if your token works:

```bash
# Install Vercel CLI locally
npm i -g vercel

# Test the token
VERCEL_TOKEN=your-token-here vercel whoami
```

If it shows your username, the token is valid.

## 4. Common Issues

### ❌ Wrong: Adding quotes in secret value
```
"cld_xxxxxxxxxxxx"  # Don't include quotes
```

### ✅ Correct: Just the token
```
cld_xxxxxxxxxxxx
```

### ❌ Wrong: Extra spaces
```
cld_xxxxxxxxxxxx   # No trailing spaces
```

### ✅ Correct: Clean token
```
cld_xxxxxxxxxxxx
```

## 5. Verify in GitHub

After updating, you should see:
- VERCEL_TOKEN (Updated just now)
- VERCEL_ORG_ID (Updated X minutes ago)
- VERCEL_PROJECT_ID (Updated X minutes ago)

## 6. Alternative: Use Repository Environments

If secrets still don't work, try using environments:

1. Go to Settings → Environments
2. Create "production" environment
3. Add the secrets there
4. Update workflow to use environment:

```yaml
jobs:
  deploy:
    environment: production
    runs-on: ubuntu-latest
```
