# Deployment

How changes are verified and promoted through staging and production.

## Current deployment model

GitHub Actions verifies the Nuxt application and Supabase migrations. For pushes to protected branches, it applies migrations first and then deploys the exact verified application artifact to Cloudflare Pages:

- Pushes to `staging` deploy the staging database and application.
- Pushes to `main` run verification only.
- Tags matching `v*` deploy production after checking that the tagged commit belongs to `main`.

The workflow builds the application with `pnpm build:cloudflare`, producing a Cloudflare Pages artifact in `dist/`, including the Nitro server routes. It uploads the artifact with hidden files included and a name containing the exact commit SHA.

After verification, GitHub Actions applies Supabase migrations first, downloads that same artifact, and deploys it with Wrangler to the matching Cloudflare Pages branch. Cloudflare Pages automatic Git deployments must be disabled so application deployment follows the database update.

## Pull-request verification

Pull requests into `staging` or `main` run two required jobs in parallel.

The application job runs:

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm typecheck
pnpm test
pnpm build:cloudflare
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
6. The same job deploys the verified application artifact to Cloudflare Pages with `--branch=staging`.
7. Complete staging smoke tests and any feature-specific manual QA.

Database deployment never begins if lint, typechecking, tests, the Nuxt build, or local migration validation fails.

## Production promotion

Promote tested staging changes through a pull request into `main`. Merging that pull request runs verification without deploying. Push a release tag matching `v*` for the tested commit to trigger production deployment. The workflow verifies that the tagged commit belongs to `main`, applies production migrations, then deploys the application artifact with `--branch=main`. Production and staging use separate GitHub environments, with deployments serialized within each environment.

## GitHub environments and secrets

The repository requires `ci`, `staging`, and `production` GitHub environments. Pull requests and verification-only runs use `ci` for public build configuration.

Database deployment uses:

```text
SUPABASE_ACCESS_TOKEN
SUPABASE_PROJECT_ID
SUPABASE_DB_PASSWORD
CLOUDFLARE_API_TOKEN
```

Store project IDs and database passwords in the matching GitHub environment. Do not expose deployment secrets to pull-request jobs.

Set public variables `SUPABASE_URL`, `SUPABASE_KEY`, `TURNSTILE_SITE_KEY`, and `SITE_URL` in each build environment. Set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_PAGES_PROJECT` in `staging` and `production`.

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

## Deployment ownership

GitHub Actions owns database and application deployment. Confirm the relevant push or tag workflow succeeds, then check the deployed application at the URL recorded in that environment's `SITE_URL`. Manual workflow runs verify changes without deploying them.

## See also

- [CI workflow reference](../../.github/workflows/README.md)
- [Configuration reference](../reference/configuration.md)
- [Database reference](../reference/database.md)
- [Troubleshooting guide](troubleshooting.md)

---

**Last updated:** 2026-10-06
