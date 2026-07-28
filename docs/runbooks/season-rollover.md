# Season rollover runbook

**Last updated:** 2026-07-27

Use this runbook first in staging and then in production. The SQL remains a
deliberate manual operation because archiving and clearing operational data are
the important, destructive parts of the rollover. The import script only calls
the protected teams, players, and fixtures endpoints and validates their output.

This runbook is currently configured for moving from 2025/26 (`25-26`) to
2026/27 (`26-27`). Review those values before using it for a later Season.

## Before starting

- Deploy the exact Season-preparation commit and all migrations to the target.
- Confirm `SYNC_API_KEY`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` are
  configured for the deployed application.
- Confirm a current, restorable Supabase backup exists.
- Pause the player-sync cron manually.
- Record whether the target is staging or production and verify every URL before
  making a change.

Create a target record before opening the SQL Editor:

| Check | Recorded value |
| --- | --- |
| Environment | `staging` or `production` |
| Expected application hostname | |
| Expected Supabase project reference | |
| Local commit (`git rev-parse HEAD`) | |
| Commit shown by the deployed application revision | |

The local and deployed commits must match. Confirm the application hostname and
Supabase project reference against the target's deployment configuration. Before
running every SQL block below, check that the open SQL Editor URL contains the
recorded project reference. Do not rely on the currently selected browser tab.

Stop if any count or validation differs from the expected result. Do not proceed
on the assumption that the next step will repair it.

## 1. Close team registration

Run in the target Supabase SQL Editor:

```sql
update public.settings
set setting_value = 'false', updated_at = now()
where setting_key = 'team_registration_open';
```

Confirm the team builder no longer accepts a submission before continuing.
Keep `league_data_public` set to `'false'` during the reveal window.

## 2. Archive 2025/26

Run this owner-only operation once:

```sql
select *
from public.archive_completed_season('25-26', '2025/26', 38);
```

Record the returned `team_count`, `player_count`, and `transfer_count`. Confirm:

- `team_count` matches the completed league.
- `player_count` equals `team_count * 11`.
- `transfer_count` is plausible; zero is valid if no transfers were recorded.
- The archived standings, teams, squads, and lightweight transfer history look
  correct.

Do not clear anything until these checks pass.

## 3. Clear operational data

This deletes the completed Season's working data. Recovery is through the
archive or the confirmed Supabase backup.

```sql
select *
from public.clear_archived_season_operational_data('25-26');
```

Confirm the returned drafted-team, drafted-player, and transfer counts exactly
match the archive counts recorded in the previous step.

## 4. Import current FPL reference data

From the repository checkout containing the deployed commit, run:

```bash
pnpm season:import -- staging
```

For production, use:

```bash
pnpm season:import -- production
```

The script asks for the deployed application URL, requires the target name to be
typed again, and reads `SYNC_API_KEY` with hidden input. It then imports in the
required order:

1. Exactly 20 clubs.
2. A positive number of current players.
3. Exactly 380 fixtures across the Season.

It also checks that `/` and `/team-builder` return successful HTTP responses.
The key is held only for the process lifetime and is not written to disk.

## 5. Verify the database

Run:

```sql
select 'clubs' as item, count(*) from public.teams
union all select 'players', count(*) from public.players
union all select 'fixtures', count(*) from public.fixtures
union all select 'active fantasy teams', count(*) from public.drafted_teams
union all select 'archived seasons', count(*)
  from public.seasons
  where archived_at is not null;
```

Expect 20 clubs, more than zero players, 380 fixtures, zero active fantasy teams,
and the completed Season in the archive.

## 6. Open 2026/27

Choose the required `site_open` value and update all related settings together.
The example below opens both the public site and team registration:

```sql
update public.settings
set
  setting_value = case setting_key
    when 'active_season' then '26-27'
    when 'current_gameweek' then '1'
    when 'season_complete' then 'false'
    when 'site_open' then 'true'
    when 'league_data_public' then 'false'
    when 'team_registration_open' then 'true'
  end,
  updated_at = now()
where setting_key in (
  'active_season',
  'current_gameweek',
  'season_complete',
  'site_open',
  'league_data_public',
  'team_registration_open'
);
```

Use `'false'` for `site_open` if the public site should remain on the holding
page. Team registration can be controlled independently using
`team_registration_open`.
Keep `league_data_public = 'false'` until the league reveal is ready. Then set it
to `'true'` in a separate settings update; this makes Teams, Table, scores and
team-derived dashboard data public while leaving the submission setting
independent.

## 7. Smoke test

- Load the welcome page as an anonymous visitor.
- Open the team builder and submit one valid test team.
- Log in as each admin and verify the populate/validate workflow.
- While `league_data_public` is `false`, confirm anonymous Teams and Table links
  are hidden and direct URLs return to the welcome page; confirm admins can still
  access them.
- Confirm the archived Season remains viewable.
- Remove the submitted smoke-test team if it should not remain.

## 8. Finish

- Resume the player-sync cron manually when the environment is ready.
- For staging, record any issue before repeating the runbook in production.
- For production, confirm the next scheduled player sync completes successfully.

## If something fails

Always stop, leave team registration closed, keep the cron paused, and save the
endpoint response or SQL error. Then use the applicable recovery path:

| Failure point | Recovery action |
| --- | --- |
| Before the archive succeeds | Fix the target or validation problem. No data has been cleared, so a restore is not required. |
| Archive call fails | Do not clear. Confirm whether the transaction rolled back before retrying. If the archived Season exists, inspect it instead of running the one-off archive again. |
| Archive succeeds but validation fails | Do not clear or rerun the archive. Investigate the archived rows and recorded counts. Restore only if the operational data or archive was corrupted. |
| After clear, during an import | Fix the endpoint or configuration problem and rerun `pnpm season:import` from the beginning. The three imports use database upserts and are safe to retry before submissions reopen. |
| After the settings switch or after submissions reopen | Immediately set `site_open`, `league_data_public`, and `team_registration_open` to `false`. Restore the pre-rollover backup if operational data is incorrect and cannot be safely repaired. |

After any backup restoration, re-check the target record, archived Season,
operational table counts, and all six application settings. Repeat the smoke
test before reopening registration or resuming the cron.
