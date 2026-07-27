#!/usr/bin/env bash

set -euo pipefail

if [[ "${1:-}" == "--" ]]; then
  shift
fi

TARGET="${1:-}"

if [[ "$TARGET" != "staging" && "$TARGET" != "production" ]]; then
  printf 'Usage: pnpm season:import -- staging|production\n' >&2
  exit 1
fi

for command_name in curl node; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    printf 'Required command is not installed: %s\n' "$command_name" >&2
    exit 1
  fi
done

read -r -p "Deployed $TARGET application URL: " APP_URL
APP_URL="${APP_URL%/}"

if [[ ! "$APP_URL" =~ ^https:// ]]; then
  printf 'The deployed application URL must start with https://\n' >&2
  exit 1
fi

read -r -p "Type $TARGET to confirm the import target: " TARGET_CONFIRMATION
if [[ "$TARGET_CONFIRMATION" != "$TARGET" ]]; then
  printf 'Target confirmation did not match; nothing was imported.\n' >&2
  exit 1
fi

read -r -s -p "$TARGET SYNC_API_KEY: " SYNC_API_KEY
printf '\n'
if [[ -z "$SYNC_API_KEY" ]]; then
  printf 'SYNC_API_KEY cannot be blank.\n' >&2
  exit 1
fi

call_sync_endpoint() {
  local endpoint="$1" count_field="$2" expected_count="${3:-}" response count

  printf 'Calling POST /api/%s...\n' "$endpoint"
  response=$(curl --fail-with-body --silent --show-error \
    --request POST \
    --header "x-api-key: $SYNC_API_KEY" \
    "$APP_URL/api/$endpoint")
  printf '%s\n' "$response"

  if ! count=$(printf '%s' "$response" | node -e '
    let input = "";
    process.stdin.on("data", chunk => input += chunk);
    process.stdin.on("end", () => {
      const value = JSON.parse(input)[process.argv[1]];
      if (!Number.isInteger(value)) process.exit(1);
      process.stdout.write(String(value));
    });
  ' "$count_field"); then
    printf '%s did not return an integer %s.\n' "$endpoint" "$count_field" >&2
    exit 1
  fi

  if (( count < 1 )); then
    printf '%s returned an invalid %s of %s.\n' "$endpoint" "$count_field" "$count" >&2
    exit 1
  fi

  if [[ -n "$expected_count" && "$count" -ne "$expected_count" ]]; then
    printf '%s returned %s; expected %s.\n' "$endpoint" "$count" "$expected_count" >&2
    exit 1
  fi
}

call_sync_endpoint "sync-teams" "teamsCount" 20
call_sync_endpoint "sync-players" "playersCount"
call_sync_endpoint "sync-fixtures" "fixturesCount" 380

printf 'Checking deployed routes...\n'
curl --fail-with-body --silent --show-error "$APP_URL/" >/dev/null
curl --fail-with-body --silent --show-error "$APP_URL/team-builder" >/dev/null

printf 'Season reference-data import completed successfully for %s.\n' "$TARGET"
printf 'Continue with docs/runbooks/season-rollover.md.\n'
