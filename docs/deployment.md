# Deployment Guide

This guide covers first-time deployment using a new MongoDB Atlas account and a new Vercel account. The repository has these branches:

- main (production environment)
- staging (staging environment - mirrored production setup)
- feature/\* (feature branches - preview deployments)

## Prerequisites

- GitHub repository access with the deployment, staging, and feature branches available
- Vercel account with permission to create projects and set environment variables
- MongoDB Atlas account with permission to create clusters, database users, and network access rules

## 1. Create MongoDB Atlas resources

### 1.1 Create a project and cluster

1. Sign in to MongoDB Atlas.
2. Create a new project, e.g. "ORUK".
3. Create a new cluster (M0 free tier is fine for staging; use a paid tier for production).
4. Choose a cloud provider and region that is closest to your users.

### 1.2 Create a database user

1. Go to Database Access.
2. Create a new user with password authentication.
3. Grant the user the "Read and write to any database" role (or a scoped role if you prefer).
4. Store the username and password securely.

### 1.3 Configure network access

1. Go to Network Access.
2. Add an IP access rule.
3. For Vercel, add `0.0.0.0/0` to allow all IPs (recommended only if you cannot provide a stable allowlist). If you use this, restrict the database user permissions and rotate credentials regularly.
4. For local development, add your local IP address.

### 1.4 Create databases

Use separate databases for staging and production to avoid cross-contamination.

- Production database name: `oruk_prod`
- Staging database name: `oruk_staging`

### 1.5 Get the connection string

1. Go to the cluster overview.
2. Click Connect -> Drivers.
3. Copy the connection string.
4. Replace `<password>` and `<db>` placeholders.

Example:

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
```

## 2. Create the Vercel project

### 2.1 Import the GitHub repository

1. In Vercel, click Add New -> Project.
2. Import the GitHub repository.
3. Framework preset should auto-detect Next.js.

### 2.2 Configure build settings

Defaults should work, but confirm:

- Build Command: `yarn build`
- Output Directory: `.next`
- Install Command: `yarn install`

### 2.3 Set up production and staging branches

In Project Settings -> Git:

- Production Branch: `main`

The staging branch will automatically create a preview deployment bound to the staging environment configuration you set in the next step. Feature branches will create their own preview deployments using Preview environment variables.

### 2.4 Add environment variables

Add environment variables for **Production** and **Preview** environments separately. Since the staging branch has its own production-like environment, you can configure it with either:

Option A: Use Preview environment variables with branch-specific overrides for the `staging` branch.

Option B: Create a separate Staging environment in your workflow by using Vercel's Git integration to deploy the staging branch to a dedicated Staging environment (if using Vercel Teams).

For most setups, use Option A:

1. Set Production environment variables (for `main` branch)
2. Set Preview environment variables (for `staging` and `feature/*` branches)
3. Override Preview variables for the `staging` branch only if needed

Required:

- `MONGODB_URI`
- `MONGODB_DB`
- `OPENAPI_VALIDATOR_ENDPOINT`
- `NEXTAUTH_URL`

Optional (only needed if service registration uses GitHub issue creation):

- `GITHUB_CLIENT_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_INSTALLATION_ID`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_ISSUE_ASSIGNEES`

Feature flags (set explicitly for each environment):

- `USE_COOKIES`
- `USE_NAV`
- `USE_NOWARRANTY`

Notes:

- **Production**: Use `MONGODB_DB=oruk_prod` and point to your production MongoDB database.
- **Staging**: Use `MONGODB_DB=oruk_staging` and point to your staging MongoDB database.
- **Feature branches**: Can share the staging database or use a separate `oruk_preview` database.
- **NEXTAUTH_URL**: Set to the full URL of each deployment (e.g., `https://staging.example.org` for staging).

### 2.5 Configure domains

- Production domain should point to the `deployment` branch.
- Create a separate staging domain (e.g. `staging.example.org`) and point it at the `staging` branch preview deployment.

## 3. Branch and environment behavior

Vercel behavior with the current branch structure:

- **main** → Production deployment
- **staging** → Staging deployment (uses its own environment mirroring Production)
- **feature/\*** → Preview deployments (use Preview environment variables or staging database)

When you push to the staging branch, Vercel deploys it to a preview URL with staging environment variables. If you configure a custom staging domain, that preview deployment can be accessed via that domain (similar to production).

If you need the staging branch to use different environment variables from feature branches:

1. Add Preview environment variables in Vercel for staging.
2. Use the "Custom Environment Variables" option and scope those values to the `staging` branch only.

## 4. Configure GitHub app (optional)

Service registration can create GitHub issues. If you need this feature:

1. Create a GitHub App in your GitHub organization.
2. Grant it permission to create issues in the target repository.
3. Install the app on the repository.
4. Set the following env vars in Vercel:

- `GITHUB_CLIENT_ID`
- `GITHUB_APP_PRIVATE_KEY`
- `GITHUB_INSTALLATION_ID`
- `GITHUB_REPO_OWNER`
- `GITHUB_REPO_NAME`
- `GITHUB_ISSUE_ASSIGNEES`

## 5. Deployment checklist

- MongoDB Atlas cluster and database user created
- Network access configured
- `MONGODB_URI` and `MONGODB_DB` set in Vercel:
  - Production (main): `MONGODB_DB=oruk_prod`
  - Staging (staging branch): `MONGODB_DB=oruk_staging`
  - Preview (feature branches): `MONGODB_DB=oruk_staging` or separate preview database
- External service endpoints configured
- Domains set for production and staging
- `main` branch set as production branch
- Staging branch environment variables configured separately

## 6. Smoke checks

After each deployment, check:

- Home page loads without errors
- Validator endpoints respond
- Dashboard data loads
- Registration flow (if enabled) creates an issue

## 7. Rollback

- Re-deploy the previous successful build in Vercel.
- If a database change caused the issue, revert it or point `MONGODB_DB` to a previous snapshot restore.
