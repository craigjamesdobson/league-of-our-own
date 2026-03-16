#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# db-restore-local.sh
#
# Dumps production data (read-only) and restores it into the local Supabase
# Docker instance. Production is never written to.
#
# Usage:
#   ./scripts/db-restore-local.sh --project-id <PROD_PROJECT_ID> --dump-password <DUMP_USER_PASSWORD>
#
# The dump uses the read-only `dump_user` role — it cannot write to production.
# The postgres superuser password must never be used locally.
#
# Prerequisites:
#   - Local Supabase running (supabase start)
#   - psql installed
#   - Supabase CLI installed (npx supabase)
# =============================================================================

DUMP_FILE="supabase/seed.sql"
LOCAL_DB_URL="postgresql://postgres:postgres@127.0.0.1:54322/postgres"

# -----------------------------------------------------------------------------
# Colour helpers
# -----------------------------------------------------------------------------
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No colour

info()    { echo -e "${BLUE}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# -----------------------------------------------------------------------------
# Usage
# -----------------------------------------------------------------------------
usage() {
  cat <<EOF
Usage: $0 --project-id <PROD_PROJECT_ID> --dump-password <DUMP_USER_PASSWORD>

Dumps production data (read-only) and restores it into the local Supabase instance.
Uses the read-only 'dump_user' role — cannot write to production under any circumstances.

Options:
  --project-id     Production Supabase project ID (read-only dump)
  --dump-password  Password for the read-only 'dump_user' role
  --skip-dump      Skip the dump step and use existing supabase/seed.sql
  -h, --help       Show this help message
EOF
  exit 0
}

# -----------------------------------------------------------------------------
# Parse arguments
# -----------------------------------------------------------------------------
PROJECT_ID=""
DUMP_PASSWORD=""
SKIP_DUMP=false

# No arguments — likely triggered via VSCode play button
if [[ $# -eq 0 ]]; then
  echo ""
  echo "This script requires credentials and must be run from the terminal:"
  echo ""
  echo "  pnpm db:restore-local --project-id <PROD_PROJECT_ID> --dump-password <DUMP_USER_PASSWORD>"
  echo ""
  echo "See scripts/README.md for full usage."
  echo ""
  exit 1
fi

while [[ $# -gt 0 ]]; do
  case "$1" in
    --project-id)     PROJECT_ID="$2"; shift 2 ;;
    --dump-password)  DUMP_PASSWORD="$2"; shift 2 ;;
    --skip-dump)      SKIP_DUMP=true; shift ;;
    -h|--help)        usage ;;
    *)                error "Unknown option: $1"; usage ;;
  esac
done

# Validate required arguments (unless skipping dump)
if [[ "$SKIP_DUMP" == false ]]; then
  if [[ -z "$PROJECT_ID" ]]; then
    error "Missing required argument: --project-id"
    usage
  fi
  if [[ -z "$DUMP_PASSWORD" ]]; then
    error "Missing required argument: --dump-password"
    usage
  fi
fi

# -----------------------------------------------------------------------------
# Preflight checks
# -----------------------------------------------------------------------------
info "Running preflight checks..."

# Check psql is available
if ! command -v psql &>/dev/null; then
  error "psql is not installed. Install PostgreSQL client tools."
  exit 1
fi
success "psql found: $(psql --version)"

# Check Supabase CLI is available
if ! npx supabase --version &>/dev/null; then
  error "Supabase CLI not found. Run: pnpm install"
  exit 1
fi
success "Supabase CLI found"

# Check local Supabase is running
if ! psql "$LOCAL_DB_URL" -c "SELECT 1" &>/dev/null; then
  error "Local Supabase is not running. Start it with: supabase start"
  exit 1
fi
success "Local Supabase is running"

# -----------------------------------------------------------------------------
# Confirmation
# -----------------------------------------------------------------------------
echo ""
echo "============================================="
echo "  LOCAL DATABASE RESTORE"
echo "============================================="
echo ""
if [[ "$SKIP_DUMP" == false ]]; then
  info "Source:      Production project ${PROJECT_ID} (READ-ONLY dump)"
fi
info "Destination: Local Supabase (127.0.0.1:54322)"
info "Dump file:   ${DUMP_FILE}"
echo ""
warn "This will CLEAR all data in your local Supabase database."
echo ""

read -rp "Continue? (y/N): " confirm
if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
  info "Aborted."
  exit 0
fi

# -----------------------------------------------------------------------------
# Step 1: Dump production data (read-only)
# -----------------------------------------------------------------------------
if [[ "$SKIP_DUMP" == false ]]; then
  info "Dumping production data (read-only via dump_user)..."
  # Use the read-only dump_user role — structurally cannot write to production.
  # Password is percent-encoded to handle special characters in the URL.
  ENCODED_DUMP_PASSWORD=$(python3 -c "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$DUMP_PASSWORD")
  PROD_DB_URL="postgresql://dump_user.${PROJECT_ID}:${ENCODED_DUMP_PASSWORD}@aws-0-eu-west-2.pooler.supabase.com:5432/postgres"
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
# Step 2: Clear local database
# -----------------------------------------------------------------------------
info "Clearing local database..."

psql "$LOCAL_DB_URL" <<'SQL'
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

success "Local database cleared"

# -----------------------------------------------------------------------------
# Step 3: Restore dump to local
# -----------------------------------------------------------------------------
info "Restoring data to local database..."

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

psql "$LOCAL_DB_URL" --quiet \
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
success "Data restored to local database"

# -----------------------------------------------------------------------------
# Step 4: Verify
# -----------------------------------------------------------------------------
info "Verifying restore..."

psql "$LOCAL_DB_URL" --tuples-only --no-align -c "
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
success "Local database restore complete!"
