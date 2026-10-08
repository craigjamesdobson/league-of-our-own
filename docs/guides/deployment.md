# Deployment

How changes are verified and promoted through staging and production.

## Current deployment model

GitHub Actions verifies the Nuxt application and Supabase migrations. For staging pushes and production release tags, it applies migrations first and then deploys the exact verified application artifact to Cloudflare Pages:

- Pushes to `staging` deploy the staging database and application.
- Pushes to `main` run verification only.
- Tags matching `v*` deploy production after checking that the tagged commit belongs to `main`.

The workflow builds the application with `pnpm build:cloudflare`, producing a Cloudflare Pages artifact in `dist/`, including the Nitro server routes. It uploads the artifact with hidden files included and a name containing the exact commit SHA.

After verification, GitHub Actions validates its Cloudflare configuration and downloads that same artifact before applying Supabase migrations, then deploys it with Wrangler to the matching Cloudflare Pages branch. Cloudflare Pages automatic Git deployments must be disabled so application deployment follows the database update.

After a successful staging or production deployment, the `post-deployment-smoke`
job runs the browser and database API smoke suite against that environment's
`SITE_URL` and Supabase public configuration. Pull requests and verification-only
main pushes do not run deployed smoke tests.

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

The database job starts a clean local Supabase instance and applies all migrations, then runs the pgTAP suite with `supabase test db --local` to verify database lifecycle behavior and permissions.

Require these checks for pull requests into `main`:

- `CI / application`
- `CI / database-migrations`

## Staging promotion

1. Merge the feature branch directly into `staging`, then push `staging`. No pull request is needed for staging testing.
2. GitHub Actions runs both verification jobs against the exact merged commit.
3. After both pass, the workflow applies migrations to the staging Supabase project.
4. The same job deploys the verified application artifact to Cloudflare Pages with `--branch=staging`.
5. Confirm `post-deployment-smoke` passes, then complete feature-specific manual QA.
6. Repeat direct merges into `staging` as the feature develops. Open a pull request into `main` once it is ready for production review.

Database deployment never begins if lint, typechecking, tests, the Nuxt build, or local migration validation fails.

## Production promotion

Promote tested staging changes through a pull request into `main`. Merging that pull request runs verification without deploying. Push a release tag matching `v*` for the tested commit to trigger production deployment. The workflow verifies that the tagged commit belongs to `main`, applies production migrations, then deploys the application artifact with `--branch=main`. Production and staging use separate GitHub environments, with deployments serialized within each environment. All production release tags share a workflow concurrency group covering verification and deployment. Publish one release at a time: GitHub keeps only one pending run per group, and concurrency does not define semantic-version ordering.

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

Deployable builds fail early when one of those public build variables is missing. Configure harmless local or test values in `ci`; it must not depend on private deployment credentials.

Configure Cloudflare Pages runtime bindings separately for Preview (staging) and Production: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NITRO_TURNSTILE_SECRET_KEY`, and `DEPLOYMENT_ENV`. Set `DEPLOYMENT_ENV` to `staging` or `production` respectively. Scheduled sync endpoints also require `SYNC_API_KEY` and `ADMIN_EMAIL`. These runtime secrets are not supplied by the GitHub artifact deployment; keep them in Cloudflare, outside the public build configuration. The Turnstile secret uses `NITRO_TURNSTILE_SECRET_KEY`; the former `TURNSTILE_SECRET_KEY` name is no longer read. Operational application state—including the active Season, current gameweek, site availability, league-data visibility, and team-registration availability—lives in the Supabase `settings` table and can be changed without redeploying. Refer to the configuration reference for the full inventory.

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

### Automated smoke tests

`pnpm test:smoke` runs Playwright tests from `smoke-tests/`. Set `SITE_URL`,
`SUPABASE_URL`, and the public anonymous `SUPABASE_KEY` for the target environment.
Install Chromium once with `pnpm exec playwright install chromium`. CI installs
the browser and its system dependencies automatically.

The suite checks that:

- Operational settings parse correctly and the player/club API and public team
  lookup RPC respond.
- Anonymous users cannot select manager email addresses, edit keys or private
  transfer requests. Permission probes use `limit=0` and never retrieve those
  values.
- The frontend points at the expected database and key routes render without
  application errors in a real browser.
- Login renders and anonymous users cannot open the admin dashboard.
- Manual transfer instructions and clipboard copying work when available, and
  disabled online transfer routes remain gated.

Closed-site and private-league settings are respected: the suite expects the
appropriate redirects instead of opening the site or changing settings. It
does not sign in, submit forms or mutate remote data. Every direct database
probe uses GET, including the public team lookup RPC. PostgREST executes these
requests in read-only transactions, so attempted writes fail at the database
level. The job uses only the public anonymous key, with no service-role key,
database password, database CLI or migration command.

Results, failure screenshots and traces are stored under `.smoke-results/`,
which is ignored by Git. CI uploads the report as `smoke-results-<commit SHA>`.
Transient failures get one retry in CI. A failed smoke job makes the workflow
fail after deployment; it does not roll back the application or database.

### Manual feature QA

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

**Last updated:** 2026-10-08
