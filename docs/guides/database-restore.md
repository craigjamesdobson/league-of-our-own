# Database Restoration Guide

**Last updated:** 2026-07-27

This guide covers the data restoration and development reset workflows for the
project. Production dumps use the dedicated `dump_user` PostgreSQL role with
`SELECT`-only privileges. Write access to production is structurally impossible
at the database level.

For full restoration-script documentation, see
[`scripts/README.md`](../../scripts/README.md).

## Security Model

Production uses a dedicated read-only `dump_user` PostgreSQL role:

- `SELECT` only on the `public` and `auth` schemas.
- `BYPASSRLS` so dumps capture all rows regardless of RLS policies.
- No `INSERT`, `UPDATE`, `DELETE`, `DROP`, or `ALTER` privileges.
- The `postgres` superuser password never exists locally; it is managed through
  deployment secrets only.

## Prerequisites

- PostgreSQL client tools (`psql --version`).
- Supabase CLI, installed through `pnpm install`.
- Production project ID from the Supabase dashboard.
- The read-only `dump_user` password.

## Local Database Resets

Use a clean schema with no application data:

```bash
pnpm db:reset:clean
```

Use current first-party FPL clubs, players, and fixtures plus fictional local
league data and two local admin users:

```bash
pnpm db:reset:fpl
```

The FPL-backed reset is the normal local workflow for exercising the application
and rehearsing the Season archive. It does not read from production.

## Workflow 1: Restore Live Data to Local

Pull production data into the local Supabase Docker instance for development.
Local Supabase must already be running.

```bash
pnpm db:restore-local \
  --project-id YOUR_PROD_PROJECT_ID \
  --dump-password YOUR_DUMP_USER_PASSWORD
```

If a recent ignored dump already exists at `supabase/seed.sql`:

```bash
pnpm db:restore-local --skip-dump
```

The script:

1. Dumps production through the read-only `dump_user` and connection pooler.
2. Clears local tables.
3. Restores through `psql` on local IPv4.
4. Verifies row counts.

## Workflow 2: Refresh Staging from Live

Use this only when staging needs a current copy of production data. Staging must
already have the required migrations.

```bash
pnpm db:restore-staging \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --prod-dump-password YOUR_DUMP_USER_PASSWORD \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD
```

The script:

1. Dumps production using the read-only role.
2. Verifies that the staging project ID differs from production.
3. Connects to staging through the pooler, with a direct-IPv4 fallback.
4. Clears and restores staging.
5. Verifies row counts.

## Workflow 3: Full Staging Rebuild

Use this after replacing or recreating the staging Supabase project. Obtain the
regional pooler host from **Supabase → Settings → Database → Connection pooling**.

```bash
pnpm db:rebuild-staging \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --prod-dump-password YOUR_DUMP_USER_PASSWORD \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD \
  --staging-pooler-host YOUR_STAGING_POOLER_HOST
```

The script:

1. Dumps production through the read-only role.
2. Temporarily links the Supabase CLI to staging, never production.
3. Applies every migration.
4. Unlinks the CLI and cleans temporary link state.
5. Clears and restores staging.
6. Verifies row counts.

After recreating staging, update `STAGING_PROJECT_ID` and
`STAGING_DB_PASSWORD` in the GitHub staging environment.

## New-Season Reference Data

For deployed environments, import reference data through the protected
application endpoints in this order:

1. `POST /api/sync-teams` imports exactly 20 clubs.
2. `POST /api/sync-players` imports the current players after their clubs exist.
3. `POST /api/sync-fixtures` validates and imports all 380 Season fixtures.

The focused command performs these calls and validates their counts:

```bash
pnpm season:import -- staging
pnpm season:import -- production
```

The endpoints require the deployed `SYNC_API_KEY`. Teams and players use FPL's
`bootstrap-static` feed; fixtures use the first-party FPL fixtures feed. The
teams and fixtures endpoints are manual rollover tools and are not called by the
scheduled player sync.

## Season Rollover

Follow the committed [Season rollover runbook](../runbooks/season-rollover.md)
against staging first and production second. Backup confirmation, archive,
clear, settings, cron, and smoke-test decisions remain explicit manual steps.
The import command handles only the machine-checkable reference-data import.

## WSL2 and IPv6 Connectivity

The restoration scripts account for common WSL2 IPv6 problems:

| Operation | Connection method | IPv6 issue? |
| --- | --- | --- |
| Production dump | Connection pooler via read-only `dump_user` | No |
| Local restore | `psql` to `127.0.0.1` | No |
| Staging write | Pooler with direct-IPv4 fallback | Handled |

The staging pooler host varies by region and must be supplied explicitly when
rebuilding staging.

### Manual fallback

If staging connectivity fails completely from WSL2:

1. Generate `supabase/seed.sql` with `pnpm db:restore-local`.
2. Split the ignored dump into manageable chunks.
3. Execute the chunks in order using the staging Supabase SQL Editor.

## Safety Guarantees

- Production dumps cannot write because `dump_user` lacks write privileges.
- Restoration scripts require explicit confirmation and reject matching staging
  and production project IDs.
- Credentials are not committed to the repository.
- Scripts clean temporary Supabase link state after use.
- `.gitignore` blocks `.env` variants except `.env.example`.
