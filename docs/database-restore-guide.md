# Database Restoration Guide: Live to Development

This guide documents the proven method for safely restoring live database data to development database when network connectivity issues prevent direct database connections.

## Problem Statement

**WSL2 IPv6 Connectivity Issues**: Direct psql connections to remote Supabase databases fail in Windows Subsystem for Linux 2 (WSL2) environments due to IPv6 network configuration problems.

**Specific Error**:
```bash
psql: error: connection to server at "db.YOUR_DEV_PROJECT_ID.supabase.co" (2a05:d01c:30c:9d03:c0f7:5424:becb:f4d0), port 5432 failed: Network is unreachable
```

**Root Cause**: WSL2's virtualized networking layer attempts IPv6 connections first, but the IPv6 stack is not properly configured, causing "Network is unreachable" errors. The system tries to connect via IPv6 addresses that aren't accessible from the WSL2 environment.

**Failed Solutions Attempted**:
- Direct psql connections (IPv6 timeout)
- `npx supabase db reset --db-url` (same IPv6 issue)
- DNS resolution works but returns unreachable IPv6 addresses
- Installing Windows PostgreSQL tools in WSL2 not feasible

## Solution: SQL Editor Method

Use Supabase's web-based SQL Editor to execute split SQL files, bypassing all network connectivity issues.

### Prerequisites

1. **Live database dump** in `supabase/seed.sql` (generated via `npx supabase db dump --linked --data-only`)
2. **Development database** access via Supabase web dashboard
3. **Working directory**: Create `temp/` folder for split files

### Step 1: Split the Database Dump

Split the large seed.sql file into manageable chunks for SQL Editor execution:

```bash
# Create temporary directory
mkdir temp/

# Split by table sections (adjust line numbers based on your dump structure)
sed -n '1,1969p' supabase/seed.sql > temp/part1_auth.sql
sed -n '1970,2707p' supabase/seed.sql > temp/part2_auth_users.sql
sed -n '2708,3529p' supabase/seed.sql > temp/part3_teams_players.sql
sed -n '3530,4441p' supabase/seed.sql > temp/part4_drafted_data.sql
sed -n '4442,5032p' supabase/seed.sql > temp/part5_statistics.sql
```

**Key Split Points** (find these in your dump):
- Line ~25: `INSERT INTO "auth"."audit_log_entries"`
- Line ~1970: `INSERT INTO "auth"."users"`
- Line ~2708: `INSERT INTO "public"."drafted_teams"`
- Line ~3530: `INSERT INTO "public"."drafted_players"`
- Line ~4442: `INSERT INTO "public"."player_statistics"`

### Step 2: Create Clear Script

Create `temp/clear.sql` to safely remove existing data:

```sql
-- CLEAR SCRIPT: Run this FIRST to clear all existing data in dev database
SET session_replication_role = replica;

-- Clear auth tables (in reverse dependency order)
TRUNCATE TABLE auth.mfa_amr_claims CASCADE;
TRUNCATE TABLE auth.refresh_tokens CASCADE;
TRUNCATE TABLE auth.sessions CASCADE;
TRUNCATE TABLE auth.users CASCADE;
TRUNCATE TABLE auth.audit_log_entries CASCADE;

-- Clear public tables (in reverse dependency order)
TRUNCATE TABLE public.weekly_statistics CASCADE;
TRUNCATE TABLE public.player_statistics CASCADE;
TRUNCATE TABLE public.drafted_transfers CASCADE;
TRUNCATE TABLE public.drafted_players CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.fixtures CASCADE;
TRUNCATE TABLE public.players CASCADE;
TRUNCATE TABLE public.teams CASCADE;
TRUNCATE TABLE public.drafted_teams CASCADE;

-- Reset sequences (only public schema - auth sequences are protected)
ALTER SEQUENCE public.drafted_players_id_seq RESTART WITH 1;
ALTER SEQUENCE public.drafted_teams_team_id_seq RESTART WITH 1;
ALTER SEQUENCE public.drafted_transfers_id_seq RESTART WITH 1;
ALTER SEQUENCE public.fixtures_id_seq RESTART WITH 1;
ALTER SEQUENCE public.player_statistics_id_seq RESTART WITH 1;
ALTER SEQUENCE public.weekly_statistics_id_seq RESTART WITH 1;

-- Note: auth.refresh_tokens_id_seq cannot be reset due to permissions

SET session_replication_role = DEFAULT;

-- Verification: Check that tables are empty
SELECT 'auth.audit_log_entries' as table_name, count(*) as row_count FROM auth.audit_log_entries
UNION ALL
SELECT 'auth.users', count(*) FROM auth.users
UNION ALL
SELECT 'public.drafted_teams', count(*) FROM public.drafted_teams
UNION ALL
SELECT 'public.players', count(*) FROM public.players;
```

### Step 3: Add Headers to Part Files

Add proper SQL headers to each part file:

```sql
-- PART X: Description
SET session_replication_role = replica;

-- (existing INSERT statements follow)
```

### Step 4: Execute via SQL Editor

1. **Access Dev Database**: Go to development Supabase project → SQL Editor
2. **Execute in Order**:
   - `clear.sql` (verify tables show 0 rows)
   - `part1_auth.sql`
   - `part2_auth_users.sql`
   - `part3_teams_players.sql`
   - `part4_drafted_data.sql`
   - `part5_statistics.sql`

### Step 5: Verify Success

Run verification query in SQL Editor:

```sql
SELECT
    'auth.users' as table_name, count(*) as rows FROM auth.users
UNION ALL
SELECT 'public.drafted_teams', count(*) FROM public.drafted_teams
UNION ALL
SELECT 'public.players', count(*) FROM public.players
UNION ALL
SELECT 'public.fixtures', count(*) FROM public.fixtures
UNION ALL
SELECT 'public.player_statistics', count(*) FROM public.player_statistics
ORDER BY table_name;
```

## Common Issues and Solutions

### Permission Errors on Sequences

**Error**: `must be owner of sequence refresh_tokens_id_seq`

**Solution**: Skip auth schema sequence resets - they're protected by Supabase. Only reset public schema sequences.

### SQL Editor Timeouts

**Solution**: Split large files further if needed. Most files under 1000 lines execute successfully.

### IPv6 Network Issues

**Solution**: This method completely bypasses network connectivity by using the web interface.

## File Organization

```
temp/
├── clear.sql              # Data clearing script
├── part1_auth.sql         # Auth audit logs (~1969 lines)
├── part2_auth_users.sql   # Users & sessions (~741 lines)
├── part3_teams_players.sql # Teams & players (~825 lines)
├── part4_drafted_data.sql # Draft data (~915 lines)
├── part5_statistics.sql   # Statistics & sequences (~594 lines)
└── README.md              # File documentation
```

## Safety Guarantees

✅ **Live database never modified** - only read from during dump creation
✅ **Development database clearly targeted** - different hostnames prevent confusion
✅ **Reversible operations** - can clear and restore again anytime
✅ **Network-independent** - uses web interface instead of direct connections

---

**Last Updated**: September 2025
**Verified Working**: Supabase projects with 5000+ line database dumps
**Environment**: WSL2 with IPv6 connectivity issues