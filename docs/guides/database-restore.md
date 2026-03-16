# Database Restoration Guide

This guide covers the three data restoration workflows for the project. All workflows are **read-only against production** — dumps use the dedicated `dump_user` PostgreSQL role which has `SELECT`-only privileges. Write access to production is structurally impossible at the database level.

For full script documentation, see `scripts/README.md`.

## Security Model

Production uses a dedicated **read-only `dump_user` PostgreSQL role**:

- `SELECT` only on `public` and `auth` schemas
- `BYPASSRLS` so dumps capture all rows regardless of RLS policies
- No `INSERT`, `UPDATE`, `DELETE`, `DROP`, or `ALTER` privileges — enforced by PostgreSQL
- The `postgres` superuser password **never exists locally** — GitHub/CF secrets only

## Prerequisites

- **psql** installed (PostgreSQL client tools) — verify with `psql --version`
- **Supabase CLI** installed (included as dev dependency — `pnpm install`)
- **Production project ID** — available from the Supabase dashboard
- **`dump_user` password** — read-only role password (ask the project owner)

## Workflow 1: Restore Live Data to Local

Pull production data into your local Supabase Docker instance for development.

**When to use:** Setting up a local dev environment with realistic data.

**Prerequisites:** Local Supabase must be running (`supabase start`).

```bash
pnpm db:restore-local \
  --project-id YOUR_PROD_PROJECT_ID \
  --dump-password YOUR_DUMP_USER_PASSWORD
```

If you already have a recent dump (`supabase/seed.sql`):

```bash
pnpm db:restore-local --skip-dump
```

**What happens:**
1. Dumps production data via `dump_user` (read-only, uses connection pooler to bypass IPv6)
2. Clears all local tables
3. Restores dump via `psql` to `127.0.0.1:54322` (IPv4, no connectivity issues)
4. Verifies row counts

## Workflow 2: Refresh Staging from Live

Refresh data on an existing staging environment. The staging project must already have migrations applied (via CI/CD — merge to the `staging` branch).

**When to use:** Staging data is stale or corrupted and needs refreshing.

```bash
pnpm db:restore-staging \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --prod-dump-password YOUR_DUMP_USER_PASSWORD \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD
```

**What happens:**
1. Dumps production data via `dump_user` (read-only)
2. Safety check: verifies staging ID does not match production ID
3. Connects to staging (pooler first, falls back to direct IPv4)
4. Clears staging tables and restores dump
5. Verifies row counts

## Workflow 3: Full Staging Rebuild

Full rebuild when the staging Supabase project has been deleted and recreated (e.g. after a 90-day free-tier pause).

**When to use:** New staging project with no schema or data.

You'll need the staging pooler host from: **Supabase dashboard → Settings → Database → Connection pooling** (e.g. `aws-1-eu-west-1.pooler.supabase.com`)

```bash
pnpm db:rebuild-staging \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --prod-dump-password YOUR_DUMP_USER_PASSWORD \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD \
  --staging-pooler-host YOUR_STAGING_POOLER_HOST
```

**What happens:**
1. Dumps production data via `dump_user` (read-only)
2. Temporarily links Supabase CLI to staging (never production)
3. Applies all migrations via `supabase db push`
4. Unlinks CLI from staging (cleans up `.temp` files)
5. Clears staging tables and restores dump
6. Verifies row counts

**After rebuild, update GitHub Secrets:**
- `STAGING_PROJECT_ID` — new staging project ID
- `STAGING_DB_PASSWORD` — new staging database password

## WSL2 / IPv6 Connectivity

All three scripts handle the IPv6 connectivity issues common in WSL2 environments:

| Operation | Connection method | IPv6 issue? |
|-----------|------------------|-------------|
| Production dump | Connection pooler (port 5432) via `dump_user` | No |
| Local restore | `psql` to `127.0.0.1` (IPv4) | No |
| Staging write | Connection pooler, fallback to direct IPv4 | Handled |

Note: the staging pooler host varies by region — it must be passed explicitly via `--staging-pooler-host` as it cannot be inferred from the project ID alone.

### Manual Fallback (SQL Editor)

If staging connectivity fails completely from WSL2, you can restore data manually via the Supabase SQL Editor:

1. Generate the dump: `pnpm db:restore-local --project-id <ID> --dump-password <PASSWORD>` creates `supabase/seed.sql`
2. Split the file into chunks: `mkdir temp && sed -n '1,2000p' supabase/seed.sql > temp/part1.sql` (etc.)
3. Execute each chunk via the staging project's SQL Editor in the Supabase dashboard

## Safety Guarantees

- Production database is **never written to** — `dump_user` has no write privileges at the PostgreSQL level
- All scripts require **explicit typed confirmation** before proceeding
- Staging scripts verify the staging project ID **does not match** production
- **No credentials are stored** in any file — all provided as CLI arguments
- Scripts clean up temporary CLI links after use
- `.gitignore` blocks all `.env` variants (except `.env.example`)

---

**Last Updated**: March 2026
