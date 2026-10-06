# CI and application/database deployments

The `CI` workflow verifies the Nuxt application and Supabase migrations before deploying the database and application together.

## Triggers

- Pull requests targeting `staging` or `main` run verification only.
- Pushes to `staging` verify the merged commit, then deploy staging database migrations and the application.
- Pushes to `main` run verification only.
- Tags matching `v*` verify the tagged commit, confirm it belongs to `main`, then deploy production database migrations and the application.
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
pnpm build:cloudflare
```

The application job reads public build configuration from the `ci`, `staging`, or `production` GitHub environment. No environment secrets are exposed to this job. The build produces `dist/`, which is uploaded as `cloudflare-pages-<commit-sha>` with hidden files included.

### Database migrations

The database job starts local Supabase with the pinned CLI version. Startup applies every migration to a clean local database. Supabase is stopped in an `always()` cleanup step.

## Deployment jobs

Database deployment jobs require both verification jobs to succeed:

- A push to `staging` applies migrations to the `staging` GitHub environment.
- A `v*` release tag pointing to a commit on `main` applies migrations to the `production` GitHub environment.

The deployment jobs are serialized per environment and cannot overlap within that environment. Pull requests, pushes to `main`, and manual workflow runs never receive deployment secrets and never deploy.

The workflow builds a Cloudflare Pages artifact once and stores it against the exact commit SHA. The staging or production deployment job applies Supabase migrations first, then deploys that artifact to Cloudflare Pages. This prevents Cloudflare from serving an application that expects a schema which has not been applied yet.

Cloudflare Pages automatic Git deployments must be disabled for the connected project. The workflow is then the only normal deployment path.

## Required GitHub configuration

Create `staging` and `production` repository environments with these secrets:

- `SUPABASE_ACCESS_TOKEN`
- `SUPABASE_PROJECT_ID`
- `SUPABASE_DB_PASSWORD`
- `CLOUDFLARE_API_TOKEN`

Restrict each project ID and database password to its matching environment. Configure the environments' protection rules independently.

Set `SUPABASE_URL`, `SUPABASE_KEY`, `TURNSTILE_SITE_KEY`, and `SITE_URL` as public variables in the `ci`, `staging`, and `production` environments. Set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_PAGES_PROJECT` as variables in the two deployment environments. The `ci` environment is used for pull requests and verification-only runs.

Require these status checks for pull requests into `main`:

- `CI / application`
- `CI / database-migrations`

## Promotion flow

1. Merge the feature branch directly into `staging` and push that branch. Staging testing does not require a pull request.
2. The push workflow rebuilds and retests the merged commit.
3. If both jobs pass, staging database migrations are applied, then the exact verified artifact is deployed to Cloudflare Pages on the `staging` branch.
4. Test the staging application. Repeat the direct merge and deployment as the feature develops.
5. Open a pull request into `main` when the feature is ready for production review.
6. After the `main` pull request passes verification and is merged, push a `v*` release tag for that commit to deploy production.

## Rollback

Supabase migrations are forward-only deployment artifacts. Prefer a corrective migration to reversing an applied migration. Cloudflare Pages keeps successful production deployments as rollback targets. Use the Cloudflare dashboard to roll back the application if needed. Database migrations remain forward-only; application rollback is safe only when the previous application remains compatible with the already-applied schema.

---

**Last updated:** 2026-10-06
