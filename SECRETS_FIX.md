# Environment Secrets vs Repository Secrets

## The Issue

You've added your secrets to an **Environment** called "production", not to the **Repository secrets**. These are different!

- **Environment Secrets**: Specific to an environment (like production, staging)
- **Repository Secrets**: Available to all workflows in the repo

## Option 1: Keep Using Environment Secrets (Recommended)

I've updated all workflows to use the production environment. Just push the changes:

```bash
git add -A
git commit -m "Fix workflows to use production environment secrets"
git push
```

## Option 2: Move to Repository Secrets

If you prefer, you can move your secrets to repository level:

1. Go to: https://github.com/mitchell1972/cafesnearme/settings/secrets/actions
2. Click "New repository secret" (not environment!)
3. Add the same three secrets:
   - VERCEL_TOKEN
   - VERCEL_ORG_ID
   - VERCEL_PROJECT_ID

## Why Environment Secrets are Better

- More secure (only available when deploying to production)
- Can have different values for different environments
- Better for production deployments

## After Pushing

Your workflows will now correctly access the environment secrets and deployment should work!
