# CI and database deployments

The `CI` workflow verifies the Nuxt application and Supabase migrations before a protected branch can deploy database changes.

## Triggers

- Pull requests targeting `staging` or `main` run verification only.
- Pushes to `staging` or `main` run verification for the exact merged commit, then deploy database migrations to the matching Supabase environment.
- Manual runs perform verification only; they do not deploy.

Superseded pull-request runs are cancelled. Protected-branch runs are not cancelled so an in-progress deployment cannot be interrupted by a newer push.

## Verification jobs

### Application

The application job uses the Node version in `.nvmrc` and the pnpm version in `package.json`. It runs:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

No environment secrets are exposed to this job.

### Database migrations

The database job starts local Supabase with the pinned CLI version. Startup applies every migration to a clean local database. Supabase is stopped in an `always()` cleanup step.

## Deployment jobs

Database deployment jobs require both verification jobs to succeed:

- A push to `staging` applies migrations to the `staging` GitHub environment.
- A push to `main` applies migrations to the `production` GitHub environment.

The deployment jobs are serialized per environment and cannot overlap. Pull requests and manual workflow runs never receive deployment secrets and never deploy.

The workflow currently deploys Supabase migrations only. The Nuxt application is built and verified in CI, but the repository does not yet define a frontend hosting target or deployment command. Add that job after the hosting platform and staging URL are confirmed.

## Required GitHub configuration

Create `staging` and `production` repository environments with these secrets:

- `SUPABASE_ACCESS_TOKEN`
- `STAGING_PROJECT_ID`
- `STAGING_DB_PASSWORD`
- `PRODUCTION_PROJECT_ID`
- `PRODUCTION_DB_PASSWORD`

Restrict each project ID and database password to its matching environment. Configure the environments' protection rules independently.

Require these status checks in the branch protection rules for `staging` and `main`:

- `CI / application`
- `CI / database-migrations`

## Promotion flow

1. Open a pull request into `staging`.
2. Wait for both required verification jobs.
3. Merge the pull request.
4. The push workflow rebuilds and retests the merged commit.
5. If both jobs pass, staging database migrations are applied.
6. Verify the separately hosted staging application before promoting the same changes to `main`.

## Rollback

Supabase migrations are forward-only deployment artifacts. Prefer a corrective migration to reversing an applied migration. Application rollback depends on the frontend hosting platform and must be documented when frontend deployment is added.

---

**Last updated:** 2026-07-18
