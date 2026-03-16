# Database Restore Scripts

Scripts for safely restoring data across environments. All scripts are **read-only against production** -- they only perform `pg_dump`/`supabase db dump` operations against the live database.

## Prerequisites

- Local Supabase running (`supabase start`) for local restores
- `psql` installed (PostgreSQL client tools)
- Supabase CLI installed (`pnpm install` includes it)
- Supabase personal access token (generate at https://supabase.com/dashboard/account/tokens)

## Scripts

### 1. Restore to Local (`db-restore-local.sh`)

Pull live data into your local Supabase Docker instance for development.

```bash
./scripts/db-restore-local.sh \
  --project-id YOUR_PROD_PROJECT_ID \
  --access-token YOUR_SUPABASE_ACCESS_TOKEN
```

If you already have a dump file (`supabase/seed.sql`), skip the dump step:

```bash
./scripts/db-restore-local.sh --skip-dump
```

### 2. Restore to Staging (`db-restore-staging.sh`)

Refresh data on an existing staging environment from live. Staging must already have migrations applied (via CI/CD).

```bash
./scripts/db-restore-staging.sh \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --access-token YOUR_SUPABASE_ACCESS_TOKEN \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD
```

### 3. Rebuild Staging (`db-rebuild-staging.sh`)

Full rebuild when the staging Supabase project has been deleted and recreated (e.g. after a 90-day pause). Applies migrations first, then restores data.

```bash
./scripts/db-rebuild-staging.sh \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --access-token YOUR_SUPABASE_ACCESS_TOKEN \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD
```

## Safety Guarantees

- Production database is **never modified** -- only read via `supabase db dump`
- All scripts require **explicit confirmation** before proceeding
- Staging scripts verify the staging project ID does **not** match production
- No credentials are stored in files -- all provided as CLI arguments at runtime
- Scripts clean up any temporary Supabase CLI links after use

## WSL2 Notes

These scripts handle the IPv6 connectivity issues in WSL2 environments:

- **Local restores** use `127.0.0.1` (IPv4) -- no issue
- **Production dumps** use the Supabase management API -- no direct psql needed
- **Staging writes** attempt the connection pooler first, then fall back to direct IPv4 resolution

If staging connectivity fails completely, see `docs/guides/database-restore.md` for the manual SQL Editor fallback method.
