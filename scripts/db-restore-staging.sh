#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# db-restore-staging.sh
#
# Dumps production data (read-only) and restores it into an existing staging
# Supabase project. Production is never written to. Staging schema must already
# be in place (migrations applied via CI/CD).
#
# Usage:
#   ./scripts/db-restore-staging.sh \
#     --prod-project-id <PROD_ID> \
#     --prod-db-password <PROD_DB_PASSWORD> \
#     --staging-project-id <STAGING_ID> \
#     --staging-db-password <PASSWORD>
#
# Prerequisites:
#   - psql installed
#   - Supabase CLI installed (npx supabase)
# =============================================================================

DUMP_FILE="supabase/seed.sql"

# -----------------------------------------------------------------------------
# Colour helpers
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# -----------------------------------------------------------------------------
# Usage
# -----------------------------------------------------------------------------
usage() {
  cat <<EOF
Usage: $0 --prod-project-id <ID> --prod-db-password <PASSWORD> --staging-project-id <ID> --staging-db-password <PASSWORD>

Dumps production data (read-only) and restores it into an existing staging Supabase project.
Staging must already have migrations applied (via CI/CD).

Options:
  --prod-project-id       Production Supabase project ID (read-only dump)
  --prod-db-password      Production database password
  --staging-project-id    Staging Supabase project ID (write target)
  --staging-db-password   Staging database password
  --skip-dump             Skip the dump step and use existing supabase/seed.sql
  -h, --help              Show this help message
EOF
  exit 0
}

# -----------------------------------------------------------------------------
# Parse arguments
# -----------------------------------------------------------------------------
PROD_PROJECT_ID=""
PROD_DB_PASSWORD=""
STAGING_PROJECT_ID=""
STAGING_DB_PASSWORD=""
SKIP_DUMP=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod-project-id)      PROD_PROJECT_ID="$2"; shift 2 ;;
    --prod-db-password)     PROD_DB_PASSWORD="$2"; shift 2 ;;
    --staging-project-id)   STAGING_PROJECT_ID="$2"; shift 2 ;;
    --staging-db-password)  STAGING_DB_PASSWORD="$2"; shift 2 ;;
    --skip-dump)            SKIP_DUMP=true; shift ;;
    -h|--help)              usage ;;
    *)                      error "Unknown option: $1"; usage ;;
  esac
done

# Validate required arguments
if [[ "$SKIP_DUMP" == false ]]; then
  [[ -z "$PROD_PROJECT_ID" ]]   && { error "Missing: --prod-project-id"; usage; }
  [[ -z "$PROD_DB_PASSWORD" ]]  && { error "Missing: --prod-db-password"; usage; }
fi
[[ -z "$STAGING_PROJECT_ID" ]]    && { error "Missing: --staging-project-id"; usage; }
[[ -z "$STAGING_DB_PASSWORD" ]]   && { error "Missing: --staging-db-password"; usage; }

# Safety: ensure staging and production are different projects
if [[ "$SKIP_DUMP" == false && "$STAGING_PROJECT_ID" == "$PROD_PROJECT_ID" ]]; then
  error "SAFETY CHECK FAILED: Staging project ID matches production project ID!"
  error "This script will NEVER write to production. Aborting."
  exit 1
fi

# -----------------------------------------------------------------------------
# Build staging connection URL
# -----------------------------------------------------------------------------
# Use the direct connection (port 5432) with IPv4 forced via --host flag
STAGING_HOST="db.${STAGING_PROJECT_ID}.supabase.co"
STAGING_DB_URL="postgresql://postgres.${STAGING_PROJECT_ID}:${STAGING_DB_PASSWORD}@aws-0-eu-west-2.pooler.supabase.com:6543/postgres"

# -----------------------------------------------------------------------------
# Preflight checks
# -----------------------------------------------------------------------------
info "Running preflight checks..."

if ! command -v psql &>/dev/null; then
  error "psql is not installed. Install PostgreSQL client tools."
  exit 1
fi
success "psql found: $(psql --version)"

if ! npx supabase --version &>/dev/null; then
  error "Supabase CLI not found. Run: pnpm install"
  exit 1
fi
success "Supabase CLI found"

# Test staging connectivity
info "Testing staging database connectivity..."
if ! psql "$STAGING_DB_URL" -c "SELECT 1" &>/dev/null 2>&1; then
  warn "Could not connect to staging via pooler. Trying direct connection..."
  # Try resolving to IPv4 explicitly
  STAGING_IPV4=$(getent ahostsv4 "$STAGING_HOST" 2>/dev/null | head -1 | awk '{print $1}' || true)
  if [[ -n "$STAGING_IPV4" ]]; then
    STAGING_DB_URL="postgresql://postgres:${STAGING_DB_PASSWORD}@${STAGING_IPV4}:5432/postgres?sslmode=require"
    if ! psql "$STAGING_DB_URL" -c "SELECT 1" &>/dev/null 2>&1; then
      error "Cannot connect to staging database. Check credentials and network."
      error "If in WSL2, you may need to use the Supabase SQL Editor as a fallback."
      error "See docs/guides/database-restore.md for the manual method."
      exit 1
    fi
    success "Connected to staging via direct IPv4 (${STAGING_IPV4})"
  else
    error "Cannot resolve staging host to IPv4. Check network connectivity."
    exit 1
  fi
else
  success "Connected to staging via connection pooler"
fi

# -----------------------------------------------------------------------------
# Confirmation
# -----------------------------------------------------------------------------
echo ""
echo "============================================="
echo "  STAGING DATABASE RESTORE"
echo "============================================="
echo ""
if [[ "$SKIP_DUMP" == false ]]; then
  info "Source:      Production project ${PROD_PROJECT_ID} (READ-ONLY dump)"
fi
info "Destination: Staging project ${STAGING_PROJECT_ID}"
info "Dump file:   ${DUMP_FILE}"
echo ""
warn "This will CLEAR all data in the staging database and replace it with production data."
warn "Production will NOT be modified (read-only dump only)."
echo ""

read -rp "Type 'restore-staging' to confirm: " confirm
if [[ "$confirm" != "restore-staging" ]]; then
  info "Aborted."
  exit 0
fi

# -----------------------------------------------------------------------------
# Step 1: Dump production data (read-only)
# -----------------------------------------------------------------------------
if [[ "$SKIP_DUMP" == false ]]; then
  info "Dumping production data (read-only)..."
  PROD_DB_URL="postgresql://postgres.${PROD_PROJECT_ID}:${PROD_DB_PASSWORD}@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
  npx supabase db dump \
    --db-url "$PROD_DB_URL" \
    --data-only \
    -f "$DUMP_FILE"
  success "Production dump saved to ${DUMP_FILE}"
else
  if [[ ! -f "$DUMP_FILE" ]]; then
    error "Dump file not found at ${DUMP_FILE}. Run without --skip-dump first."
    exit 1
  fi
  info "Using existing dump file: ${DUMP_FILE}"
fi

# -----------------------------------------------------------------------------
# Step 2: Clear staging database
# -----------------------------------------------------------------------------
info "Clearing staging database..."

psql "$STAGING_DB_URL" <<'SQL'
SET session_replication_role = replica;

-- Clear public tables (reverse dependency order)
TRUNCATE TABLE public.weekly_statistics CASCADE;
TRUNCATE TABLE public.player_statistics CASCADE;
TRUNCATE TABLE public.drafted_transfers CASCADE;
TRUNCATE TABLE public.drafted_players CASCADE;
TRUNCATE TABLE public.settings CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.fixtures CASCADE;
TRUNCATE TABLE public.players CASCADE;
TRUNCATE TABLE public.teams CASCADE;
TRUNCATE TABLE public.drafted_teams CASCADE;

-- Clear auth tables
TRUNCATE TABLE auth.mfa_amr_claims CASCADE;
TRUNCATE TABLE auth.refresh_tokens CASCADE;
TRUNCATE TABLE auth.sessions CASCADE;
TRUNCATE TABLE auth.users CASCADE;
TRUNCATE TABLE auth.audit_log_entries CASCADE;

-- Reset public sequences
DO $$
DECLARE
  seq RECORD;
BEGIN
  FOR seq IN
    SELECT sequencename FROM pg_sequences WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER SEQUENCE public.%I RESTART WITH 1', seq.sequencename);
  END LOOP;
END $$;

SET session_replication_role = DEFAULT;
SQL

success "Staging database cleared"

# -----------------------------------------------------------------------------
# Step 3: Restore dump to staging
# -----------------------------------------------------------------------------
info "Restoring data to staging database..."

# Filter the dump to remove sections that conflict with existing infrastructure:
#   - storage.buckets (already exist in fresh Supabase instances)
#   - storage.objects (references buckets, can cause FK issues)
#   - storage.s3_multipart_uploads (infrastructure table)
#   - Any ALTER SEQUENCE on auth schema (permission denied — Supabase owns these)
FILTERED_DUMP=$(mktemp)
sed \
  -e '/^-- Data for Name: buckets; Type: TABLE DATA; Schema: storage/,/^$/d' \
  -e '/^-- Data for Name: objects; Type: TABLE DATA; Schema: storage/,/^$/d' \
  -e '/^-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage/,/^$/d' \
  -e '/^-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage/,/^$/d' \
  -e '/INSERT INTO "storage"."buckets"/d' \
  -e '/INSERT INTO "storage"."objects"/d' \
  -e '/INSERT INTO "storage"."s3_multipart_uploads/d' \
  -e '/ALTER SEQUENCE "auth"\./d' \
  -e '/SELECT pg_catalog.setval.*auth\./d' \
  "$DUMP_FILE" > "$FILTERED_DUMP"

# Wrap restore in session_replication_role = replica so foreign key constraints
# don't block INSERTs when rows arrive out of dependency order (which pg_dump
# data-only dumps frequently produce).
ERROR_LOG=$(mktemp)

psql "$STAGING_DB_URL" --quiet \
  -v ON_ERROR_STOP=0 \
  -c "SET session_replication_role = replica;" \
  -f "$FILTERED_DUMP" \
  -c "SET session_replication_role = DEFAULT;" \
  2>"$ERROR_LOG" | grep -v "^SET$" || true

# Report any errors (but don't fail — some warnings are expected)
if [[ -s "$ERROR_LOG" ]]; then
  # Filter out known harmless warnings
  REAL_ERRORS=$(grep -v -E "^(SET|COMMENT|$)" "$ERROR_LOG" | grep -i "error" || true)
  if [[ -n "$REAL_ERRORS" ]]; then
    warn "Some errors occurred during restore (review below):"
    echo "$REAL_ERRORS" | head -20
    echo ""
    warn "Full error log: ${ERROR_LOG}"
  else
    rm -f "$ERROR_LOG"
  fi
else
  rm -f "$ERROR_LOG"
fi

rm -f "$FILTERED_DUMP"
success "Data restored to staging database"

# -----------------------------------------------------------------------------
# Step 4: Verify
# -----------------------------------------------------------------------------
info "Verifying restore..."

psql "$STAGING_DB_URL" --tuples-only --no-align -c "
  SELECT 'auth.users', count(*) FROM auth.users
  UNION ALL SELECT 'public.teams', count(*) FROM public.teams
  UNION ALL SELECT 'public.players', count(*) FROM public.players
  UNION ALL SELECT 'public.drafted_teams', count(*) FROM public.drafted_teams
  UNION ALL SELECT 'public.fixtures', count(*) FROM public.fixtures
  UNION ALL SELECT 'public.player_statistics', count(*) FROM public.player_statistics
  ORDER BY 1;
" | while IFS='|' read -r table count; do
  echo -e "  ${GREEN}${table}${NC}: ${count} rows"
done

echo ""
success "Staging database restore complete!"
