# Database Restore Scripts

Scripts for safely restoring data across environments. All scripts are **read-only against production** — they use the dedicated `dump_user` PostgreSQL role which has `SELECT`-only privileges. Write access to production is structurally impossible regardless of what commands are run.

## Prerequisites

- Local Supabase running (`supabase start`) for local restores
- `psql` installed (PostgreSQL client tools)
- Supabase CLI installed (`pnpm install` includes it)
- `dump_user` password for production (read-only role — ask the project owner)

## Security Model

Production uses a dedicated **read-only `dump_user` PostgreSQL role**:

- `SELECT` only on `public` and `auth` schemas
- `BYPASSRLS` so dumps capture all rows
- No `INSERT`, `UPDATE`, `DELETE`, `DROP`, or `ALTER` privileges
- Enforced at the PostgreSQL level — not just by trusting the scripts

The `postgres` superuser password **never exists locally**. It lives only in GitHub/Cloudflare secrets and is only used by CI/CD pipelines.

## Scripts

### 1. Restore to Local (`db-restore-local.sh`)

Pull live data into your local Supabase Docker instance for development.

```bash
pnpm db:restore-local \
  --project-id YOUR_PROD_PROJECT_ID \
  --dump-password YOUR_DUMP_USER_PASSWORD
```

If you already have a dump file (`supabase/seed.sql`), skip the dump step:

```bash
pnpm db:restore-local --skip-dump
```

### 2. Restore to Staging (`db-restore-staging.sh`)

Refresh data on an existing staging environment from live. Staging must already have migrations applied (via CI/CD).

```bash
pnpm db:restore-staging \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --prod-dump-password YOUR_DUMP_USER_PASSWORD \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD
```

### 3. Rebuild Staging (`db-rebuild-staging.sh`)

Full rebuild when the staging Supabase project has been deleted and recreated (e.g. after a 90-day pause). Applies migrations first, then restores data.

```bash
pnpm db:rebuild-staging \
  --prod-project-id YOUR_PROD_PROJECT_ID \
  --prod-dump-password YOUR_DUMP_USER_PASSWORD \
  --staging-project-id YOUR_STAGING_PROJECT_ID \
  --staging-db-password YOUR_STAGING_DB_PASSWORD \
  --staging-pooler-host YOUR_STAGING_POOLER_HOST
```

The staging pooler host can be found in: **Supabase dashboard → Settings → Database → Connection pooling**  
(e.g. `aws-1-eu-west-1.pooler.supabase.com`)

## Safety Guarantees

- Production is **never written to** — `dump_user` has no write privileges at the PostgreSQL level
- All scripts require **explicit typed confirmation** before proceeding
- Staging scripts verify the staging project ID **does not match** production
- No credentials are stored in files — all provided as CLI arguments at runtime
- Scripts clean up any temporary Supabase CLI links after use

## WSL2 Notes

These scripts handle the IPv6 connectivity issues in WSL2 environments:

- **Local restores** use `127.0.0.1` (IPv4) — no issue
- **Production dumps** use the Supabase connection pooler — works around IPv6
- **Staging writes** attempt the connection pooler first, then fall back to direct IPv4 resolution

If staging connectivity fails completely, see `docs/guides/database-restore.md` for the manual SQL Editor fallback method.
