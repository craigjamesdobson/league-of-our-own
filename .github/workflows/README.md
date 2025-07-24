# CI/CD Workflows for Supabase Migrations

This directory contains GitHub Actions workflows for automated testing and deployment of Supabase database migrations.

## Workflows

### 1. CI Workflow (`ci.yml`)
**Triggers:** Pull requests to `main` or `develop` branches
**Purpose:** Validate migrations and run tests

**What it does:**
- Tests that migrations can be applied cleanly
- Runs linting and type checking
- Generates types from local schema
- Ensures code quality before merge

### 2. Staging Deployment (`deploy-staging.yml`)
**Triggers:** Push to `staging` branch
**Purpose:** Deploy migrations to staging environment

**What it does:**
- Applies migrations to staging Supabase project
- Generates updated TypeScript types
- Runs post-deployment validation
- Provides deployment feedback

### 3. Production Deployment (`deploy-production.yml`)
**Triggers:** Push to `main` branch or manual trigger
**Purpose:** Deploy migrations to production environment

**What it does:**
- Creates database backup before deployment
- Applies migrations to production Supabase project
- Generates updated TypeScript types
- Creates release tags
- Includes rollback instructions

## Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

### Environment Variables
- `SUPABASE_ACCESS_TOKEN` - Your Supabase personal access token
- `STAGING_PROJECT_ID` - Staging project reference ID
- `STAGING_DB_PASSWORD` - Staging database password
- `PRODUCTION_PROJECT_ID` - Production project reference ID  
- `PRODUCTION_DB_PASSWORD` - Production database password

### How to Get These Values

1. **SUPABASE_ACCESS_TOKEN**: 
   - Go to [Supabase Dashboard](https://supabase.com/dashboard) → Account → Access Tokens
   - Generate a new token with appropriate permissions

2. **PROJECT_ID**: 
   - Found in your Supabase project URL: `https://supabase.com/dashboard/project/{PROJECT_ID}`

3. **DB_PASSWORD**: 
   - Go to Project Settings → Database → Connection Pooling
   - Use the password you set during project creation

## Environment Setup

### GitHub Repository Environments
1. Create "staging" and "production" environments in GitHub
2. Configure environment-specific secrets
3. Set up protection rules for production environment

### Branch Strategy
- `staging` → Staging deployments
- `main` → Production deployments
- Feature branches → CI testing only

## Usage

### Creating a New Migration
```bash
# Create a new migration file
pnpm migration:new add_new_feature

# Test locally
pnpm db:reset
pnpm generate-types:local

# Commit and push to feature branch
git add .
git commit -m "feat: add new migration for feature"
git push origin feature/new-feature
```

### Deployment Flow
1. **Development**: Create migration locally and test
2. **Pull Request**: CI workflow validates changes
3. **Staging**: Merge to staging triggers staging deployment
4. **Production**: Merge to main triggers production deployment

### Manual Production Deployment
For manual production deployments:
1. Go to Actions tab in GitHub
2. Select "Deploy to Production" workflow
3. Click "Run workflow"
4. Type "DEPLOY" in the confirmation field
5. Click "Run workflow"

## Available Scripts

New package.json scripts for migration management:
- `pnpm generate-types:local` - Generate types from local DB
- `pnpm db:start` - Start local Supabase
- `pnpm db:stop` - Stop local Supabase  
- `pnpm db:reset` - Reset local database with migrations
- `pnpm db:push` - Push migrations to linked project
- `pnpm migration:new <name>` - Create new migration
- `pnpm migration:list` - List all migrations

## Safety Features

### Staging Environment
- Automatic deployment on develop branch
- Type generation and validation
- Safe testing environment

### Production Environment  
- Manual confirmation required for manual deployments
- Database backup before migration
- Post-deployment validation
- Release tagging
- Rollback instructions on failure

## Troubleshooting

### Common Issues
1. **Migration fails**: Check migration syntax and dependencies
2. **Type generation fails**: Ensure database is accessible
3. **Authentication errors**: Verify access tokens and permissions

### Rollback Process
If production deployment fails:
1. Check the backup created before deployment
2. Use `supabase db reset --db-url [backup-url]` if needed
3. Or revert the problematic migration files and redeploy

## Best Practices

1. **Always test locally first**: Use `pnpm db:reset` to test migrations
2. **Use descriptive migration names**: Include ticket numbers or feature names
3. **Review staging deployments**: Verify in staging before merging to main
4. **Monitor production deployments**: Watch for errors after deployment
5. **Keep migrations atomic**: One logical change per migration file