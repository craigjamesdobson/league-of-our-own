# Deployment

How changes are verified and promoted through staging and production.

## Current deployment model

GitHub Actions verifies both the Nuxt application and Supabase migrations. After verification, it applies database migrations for pushes to protected branches:

- `staging` deploys migrations to the staging Supabase project.
- `main` deploys migrations to the production Supabase project.

The workflow builds the application with `pnpm build`, producing the Nitro application in `.output`. The current Nitro preset is `node-server` because the repository includes server API routes.

Frontend hosting is configured outside this repository or has not yet been recorded here. GitHub Actions does not currently publish `.output`. Confirm the frontend hosting target, build-time environment, and staging URL before relying on a branch merge to update the website.

## Pull-request verification

Pull requests into `staging` or `main` run two required jobs in parallel.

The application job runs:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The database job starts a clean local Supabase instance and applies all migrations.

Configure branch protection to require:

- `CI / application`
- `CI / database-migrations`

## Staging promotion

1. Open a pull request targeting `staging`.
2. Review the change and wait for both required checks.
3. Merge the pull request.
4. GitHub Actions repeats both checks against the exact merged commit.
5. After both pass, the workflow applies migrations to the staging Supabase project.
6. Confirm the frontend hosting platform has deployed the same commit.
7. Complete staging smoke tests and any feature-specific manual QA.

Database deployment never begins if lint, typechecking, tests, the Nuxt build, or local migration validation fails.

## Production promotion

Promote tested staging changes through a pull request into `main`. The same verification gates run before the production database deployment. Production and staging deployment jobs use separate GitHub environments and cannot overlap with another deployment to the same environment.

## GitHub environments and secrets

The repository requires `staging` and `production` GitHub environments.

Database deployment uses:

```text
SUPABASE_ACCESS_TOKEN
STAGING_PROJECT_ID
STAGING_DB_PASSWORD
PRODUCTION_PROJECT_ID
PRODUCTION_DB_PASSWORD
```

Store project IDs and database passwords in the matching GitHub environment. Do not expose deployment secrets to pull-request jobs.

The frontend host is expected to provide the application's runtime and public configuration, including the applicable Supabase URL and key, site URL, Turnstile configuration, email credentials, and service-role credentials. Operational application state—including the active Season, current gameweek, site availability, league-data visibility, and team-registration availability—lives in the Supabase `settings` table and can be changed without redeploying. Refer to the configuration reference for the full inventory.

## Local release verification

Use the repository's pinned Node and pnpm versions, then run:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm preview
```

The preview command serves the generated Nitro application locally.

## Post-deployment checks

For staging and production:

1. Record the deployed commit SHA.
2. Confirm the site loads without browser-console errors.
3. Check public routes such as `/`, `/table`, and `/players`.
4. Verify login and an authenticated route.
5. Verify Supabase reads and writes use the expected environment.
6. Exercise any forms, server API routes, or migrations changed by the release.
7. Check desktop and mobile layouts in light and dark mode for UI changes.

For admin team submission metadata changes:

1. Confirm the metadata permission migration was applied successfully.
2. While signed out, confirm team cards have no submission-history control.
3. While signed in as an administrator, confirm the control shows created,
   last-edited, and edit-count values on `/teams`.
4. Confirm the anonymous Supabase role cannot select `created_at`, `updated_at`,
   or `edited_count` from `drafted_teams`.
5. Confirm the authenticated role can still select those fields.

## Rollback

Frontend rollback depends on the hosting platform. Prefer redeploying the last known-good application artifact or commit.

Do not reverse an applied Supabase migration by deleting its migration file. Create a corrective forward migration unless a documented recovery procedure explicitly requires database restoration. Application changes that accompany schema migrations should remain compatible during staged rollout and rollback.

## Known gap

The repository has no frontend deployment job. To close that gap:

1. Identify the hosting platform and staging URL.
2. Decide which public configuration is embedded at build time.
3. Upload the verified `.output` directory as a workflow artifact on trusted branch pushes.
4. Add a frontend deployment job that consumes that exact artifact.
5. Add an HTTP smoke check against the deployed staging URL.
6. Document the platform-specific rollback procedure.

## See also

- [CI workflow reference](../../.github/workflows/README.md)
- [Configuration reference](../reference/configuration.md)
- [Database reference](../reference/database.md)
- [Troubleshooting guide](troubleshooting.md)

---

**Last updated:** 2026-08-02
