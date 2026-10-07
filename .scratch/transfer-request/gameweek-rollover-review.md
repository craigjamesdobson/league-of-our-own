# Gameweek rollover audit

Reviewed 7 October 2026 against the current branch and installed local database.
Two independent reviewers traced frontend/scoring and SQL/transfer behavior.
Automation has not been implemented or enabled.

## What a rollover actually does

`useAppSettings.updateCurrentGameweek` updates the settings value and its audit
fields. The local schema has no trigger on `settings`. Four installed transfer
RPCs read the current week: save, approval, request cancellation and item
cancellation. Changing the week does not itself invoke those functions.

For a rollover from Week 7 to Week 8:

| Area | Effect |
| --- | --- |
| Homepage | Freshly loaded summary and transfer list query Week 8. No results yet is an expected state. Overall performers still read saved player statistics. |
| Current squads | Already recorded transfers effective in Week 8 become the current players; team value follows their prices. Original drafted squad rows remain unchanged. |
| Existing Week 8 requests | Become locked against owner edits/cancellation and eligible for manual administrator approval. They are not automatically applied. |
| New requests | Target Week 9. Week 8 remains attached to older requests. |
| Fixture administration | A fresh page without an explicit URL week defaults to Week 8. Explicit historical selection remains available. |
| Saved scoring/standings | No automatic writes or recalculations. The selected week's Save week action calculates and persists its team scores separately. |
| Registration/season | No change to registration, publication, active season, season completion or archival. |
| Email/imports | No notifications, player sync or other imports are triggered. |

The public table page currently defaults to URL week or Week 1 independently of
the setting. Homepage "Weeks Played" uses the current week number, which is not
the same as the number of completed/published scoring weeks.

## Conditions that must be handled before automation

### A form opened before the cutoff must not silently change its target

The form submits no expected target week. The server calculates current week +
1 afresh. A form showing Week 8 can therefore save for Week 9 after rollover.
Send the displayed expected target and reject a changed window with a refresh/
review instruction. Check it inside the database transaction too.

### Rollover and submissions need a shared transaction boundary

Transfer RPCs currently read the week before taking request/team locks; they do
not lock the settings row. An operation can finish against its old captured
week after rollover. Read/lock rollover state in a consistent order in both
rollover and transfer mutations. A timestamp check must enforce the cutoff even
when the scheduled rollover runs a little late.

### Administrator actions need a fresh week and explicit effective date

The manual email-transfer editor defaults to current week + 1. Processing a
Week 8 email after rollover therefore initially selects Week 9. Show/confirm the
effective week explicitly. A cached administrator week field must not overwrite
a newer automatic value; use an expected-current-week check for manual changes.

### Cached pages need to refresh without disturbing historical editing

`NuxtPage keepalive` retains page state. The homepage only loads on mount, while
the admin field, drafted-team store and private team response keep separate
week snapshots. Refresh on reactivation/focus and when a rollover is detected.
The homepage also shares `tableStore.weeklyData` with historical table browsing;
reload the correct week's data rather than displaying another week's table
under a cached heading. Keep explicit historical fixture selections unchanged.

### Overdue requests need an explicit resolution path

A Week 8 request left pending at the next rollover to Week 9 cannot be approved
by the current approval RPC, yet remains the team's single pending request.
It blocks another request until rejected. Surface overdue requests and define
how administrators resolve them; do not silently approve, discard or retarget
them as part of a simple increment.

### Saved scores and approval timing remain separate

An approval after that week's team scores were saved changes the effective
squad but not its saved score. The administrator must refresh the scoring data
and save that week again. Rollover alone cannot repair this. It also does not
undo live transfers when someone manually moves the week backwards; that is
an administrative correction, not a rollback of transfers or scores.

## Smallest sensible automation model

Use one administrator-controlled next rollover timestamp, normally Friday at
19:00 Europe/London. At a successful rollover, advance one gameweek and schedule
the next normal Friday. An override extends the current window during a break,
then normal scheduling resumes. Do not depend on fixture dates.

The server-side rollover operation must be atomic and safe to retry, validate
the expected season/week/deadline, respect pause/manual overrides, stop at
Week 38 and avoid blindly skipping several weeks after an outage. Do not enable
it during season preparation or restart it for another season without explicit
administrator configuration. Summer/winter timezone changes must retain 7pm
UK time.

Automatic rollover should remain separate from manual transfer approval and
score publication. A bare scheduled settings increment is not sufficient.

## Evidence and limits

- Eight local pgTAP assertions pass in `gameweek-rollover-probe.sql`, proving the
  setting changes without rewriting squads, transfers, requests, player scores,
  team scores or other operational settings. The entire probe rolls back.
- Thirty-two existing focused tests pass across weekly scoring, drafted squad
  display, homepage queries and next-gameweek boundaries.
- Previous real transfer SQL lifecycle tests cover approval before/in its target
  week and cancellation closing after advancement.
- Stale-form, cached-page and transaction-boundary risks are evidenced by the
  current code paths; they are not fixed by this audit.
- No scheduling job, application behavior change, commit, deployment or remote
  database write was performed.
