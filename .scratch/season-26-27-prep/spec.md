Status: ready-for-agent

# 2026/27 season preparation and lightweight history

## Problem Statement

League of Our Own must open team entry for the 2026/27 season by 1 August 2026. The production database still contains the completed 2025/26 operational dataset, while Fantasy Premier League has released a new player and club dataset whose season-local identifiers overlap with the old data. Allowing the scheduled player import to run before a controlled cutover could overwrite player identities, retain stale players, or associate players with the wrong clubs.

The completed season is worth preserving, but the application does not need a complete historical copy of every fixture, statistic, or FPL record. It needs a lightweight history capable of supporting a later view of final standings, final squads, and understandable transfer activity.

Season preparation must proceed independently of the unfinished UI overhaul. The preferred outcome is to release both together, but approval of the UI overhaul must not prevent team entry reopening by 1 August.

## Solution

Introduce a lightweight, immutable history model for completed Seasons. An explicit annual archive operation will snapshot the 2025/26 final standings, each fantasy team's Final Squad, and its Season Transfers. Once the snapshot has been validated, a separate explicit reset operation will clear the old operational season data so the new FPL clubs and players can be loaded safely.

The application will continue using `ACTIVE_SEASON` to select the operational dataset. A separate Season Phase setting will control the pre-season welcome experience, whether team entry is open, and whether the finale experience is enabled.

The launch-critical work will be developed from the production baseline on a dedicated season-preparation branch. The UI overhaul will continue independently. Both are targeted for a combined release, with a firm 30 July go/no-go decision and a season-preparation-only fallback.

## User Stories

1. As the league administrator, I want a managed production backup to exist before archival begins, so that the database can be restored if the cutover fails.
2. As the league administrator, I want the scheduled FPL player import paused during cutover, so that live writes cannot race with archival or reset operations.
3. As the league administrator, I want archival to be an explicit action, so that deploying schema changes cannot unexpectedly modify completed-season data.
4. As the league administrator, I want archival to complete transactionally, so that a partial history is never left behind.
5. As the league administrator, I want an archival failure to leave the operational dataset unchanged, so that I can investigate and retry safely.
6. As the league administrator, I want the archive operation to reject an attempt to archive the same Season twice, so that immutable history cannot be duplicated accidentally.
7. As the league administrator, I want the archive operation to validate its source data, so that missing fantasy teams or malformed squads are detected before the old data is cleared.
8. As a league participant, I want my final team name and owner display name preserved, so that the completed league remains recognisable.
9. As a league participant, I want my final position and score preserved, so that the final standings can be shown later.
10. As a league participant, I want my Final Squad preserved as names and display information, so that I can later see how my team finished.
11. As a league participant, I want my Season Transfers preserved as gameweek replacement events, so that I can later understand how my squad changed.
12. As a league participant, I want transfers displayed as outgoing player to incoming player, so that the history does not expose internal squad-slot mechanics.
13. As a league participant, I want multiple transfers affecting the same squad slot preserved in their original order, so that each outgoing player is accurate.
14. As a league participant, I do not want private contact or authentication information copied into public history, so that archival does not increase privacy risk.
15. As the league administrator, I want the completed-season snapshot independent of live FPL identifiers, so that future imports cannot alter historical names or clubs.
16. As the league administrator, I want archived snapshots to be read-only, so that completed results cannot be edited accidentally.
17. As the league administrator, I want to inspect archive counts and sample records before clearing operational data, so that deletion is a separately confirmed decision.
18. As the league administrator, I want operational reset to be explicit and separate from archival, so that creating history never implicitly deletes source data.
19. As the league administrator, I want profiles and authentication accounts preserved during reset, so that returning administrators keep access.
20. As the league administrator, I want general application configuration preserved except for deliberate new-season settings, so that unrelated production configuration is not lost.
21. As the league administrator, I want old drafted teams, drafted players, transfers, fixtures, player statistics, weekly statistics, players, and Premier League clubs cleared after archive verification, so that season-local identifiers cannot collide.
22. As the league administrator, I want the 2026/27 Premier League clubs loaded before players, so that player-to-club relationships are valid.
23. As the league administrator, I want all 20 incoming clubs validated against the new FPL dataset, so that no old club mapping survives.
24. As the league administrator, I want the initial player import to load all 555 released players, so that team selection uses the complete launch dataset.
25. As the league administrator, I want sample player-to-club mappings checked after import, so that a technically successful import cannot hide incorrect relationships.
26. As the league administrator, I want stale players absent after the initial import, so that users cannot select players from the completed season.
27. As the league administrator, I want the player cron restored only after the initial import is verified, so that normal updates resume from a clean baseline.
28. As a returning participant, I want a simple welcome-back homepage during pre-season, so that I understand the league is preparing for 2026/27.
29. As a returning participant, I want a clear action from the welcome page to team selection, so that I can submit my new team.
30. As a returning participant, I want to create a completely new 2026/27 team, so that no players, transfers, or budget state are carried over.
31. As a returning participant, I want the team builder open during pre-season, so that I can submit my team before Gameweek 1.
32. As a participant, I want the normal dashboard restored when the season becomes active, so that the application returns to its in-season experience.
33. As the league administrator, I want team entry closed when the season becomes active, so that entries do not remain open unintentionally.
34. As a participant, I want the finale experience disabled during pre-season and the active season, so that last season's modal does not reappear.
35. As a participant, I want the finale experience enabled only when the Season Phase is complete, so that it reflects the current operational stage.
36. As the league administrator, I want one Season Phase value rather than contradictory booleans, so that the welcome page, team builder, dashboard, and finale remain consistent.
37. As the league administrator, I want `ACTIVE_SEASON` to remain the operational season selector for this launch, so that existing season-aware queries do not require a broad refactor.
38. As the league administrator, I want the new history schema to remain additive until the explicit cutover, so that deployment alone does not disrupt staging or production.
39. As the product owner, I want season preparation based on the production branch, so that unapproved UI work cannot block or contaminate the launch-critical path.
40. As the product owner, I want unrecognised staging-only work excluded from the season-preparation branch, so that only deliberately reviewed changes can reach production.
41. As the product owner, I want the UI overhaul and season preparation to continue in parallel, so that testing one does not halt progress on the other.
42. As the product owner, I want a combined UI and season release when both are ready, so that participants receive the improved experience at launch.
43. As the product owner, I want a 30 July go/no-go checkpoint, so that the combined release decision is made before launch day.
44. As the product owner, I want a season-preparation-only fallback, so that team entry still opens by 1 August if critical UI issues remain.
45. As the league administrator, I want the current-season identifiers removed from hard-coded team-builder values, so that new entries are consistently assigned to 2026/27.
46. As the league administrator, I want the current player-image path and newly promoted club assets verified, so that the new player and club presentation does not regress.
47. As the league administrator, I want fixture loading treated as a separate manual dependency, so that the archive and team-entry launch are not blocked by a fixture format that is not ready.
48. As the league administrator, I want fixtures loaded and verified before Gameweek 1, so that scoring administration is ready when matches begin.
49. As the league administrator, I want a concise cutover runbook, so that the production operation can be performed in a controlled order without relying on memory.
50. As the league administrator, I want every destructive cutover step followed by a visible verification, so that failures are found before proceeding.

## Implementation Decisions

- The launch-critical branch starts from `main` and is independent of the UI-overhaul and existing staging-only history.
- Existing unrecognised staging-only backup or restoration scripts are not reused.
- Supabase Pro managed daily backups are the cutover recovery mechanism for the protected launch month.
- Before any destructive operation, a visible managed backup must be confirmed in the Supabase dashboard.
- Archival is a one-off explicit operation initiated by the administrator. Applying migrations, changing the Season Phase, or marking a season complete must not trigger archival.
- The history model contains:
  - Seasons identified by a stable season key and display label.
  - Season Results containing immutable team name, owner display name, final position, and final total score.
  - Final Squad entries containing immutable player display name, position, and Premier League club display information.
  - Season Transfers containing immutable gameweek, ordering, outgoing player display information, and incoming player display information.
- Archive records intentionally do not reference operational players, clubs, drafted-player rows, or FPL identifiers.
- Email addresses, phone numbers, communication consent, edit keys, authentication identifiers, prices, individual points, transfer expiry, and other private or operational fields are excluded.
- The archive operation constructs outgoing-to-incoming transfer history by following each drafted squad slot chronologically. The originally drafted player is outgoing for the first transfer; each previous incoming player is outgoing for the next transfer in that slot.
- Archive creation is transactional and validates its source before commit.
- An already archived season cannot be archived again through the normal operation.
- Archived snapshot tables allow intended reads but reject ordinary client inserts, updates, and deletes. Completed archive records are immutable.
- Archival and operational reset are separate actions. The archive must be inspected and accepted before reset is invoked.
- Operational reset preserves profiles, authentication data, and unrelated configuration while clearing season-owned competition data in foreign-key-safe order.
- The new clubs are loaded before the new players.
- The supplied FPL launch payload is expected to contain 20 clubs and 555 players. These counts are cutover assertions for this release, not permanent assumptions in the recurring cron.
- The existing recurring player sync continues importing its current supported subset of FPL fields. Newly introduced FPL fields are outside this launch unless required by existing league scoring.
- The initial import occurs manually after reset and club loading. The cron is restored only after verification.
- `ACTIVE_SEASON` remains the selector used by existing stores and database functions. It changes to the new season during cutover.
- The application settings model gains one `season_phase` value with allowed values `preseason`, `active`, and `complete`.
- The pre-season homepage is a simple welcome-back experience with a primary link to team selection.
- Team selection creates fresh entries and carries no squad, transfer, or budget state from the Archived Season.
- The team builder derives the new Season from runtime configuration rather than hard-coded values.
- Existing `season_complete` behaviour is superseded by the Season Phase. Compatibility and data migration must prevent the old finale flag from reopening the modal.
- The preferred release combines the UI overhaul with season preparation. The 30 July checkpoint decides whether that combined release is safe.
- If the UI overhaul has unresolved functional or data-integrity issues at the checkpoint, season preparation is released on the existing production UI and the overhaul remains separate.
- Existing staging history is not promoted wholesale to `main`. Only known, reviewed feature work is promoted.
- Fixture population is performed manually by the user once a structured source format exists. It is not part of this implementation, but completion before Gameweek 1 is a release dependency for match administration.
- Production cutover follows a written manual runbook and anticipates temporary maintenance or incomplete-data states between reset and successful import.

## Testing Decisions

- Tests verify behaviour through public interfaces and avoid assertions about internal helper structure.
- The primary database seam is the explicit archive operation against a representative locally seeded completed Season.
- The database integration test covers:
  - Final ranking and score snapshot.
  - Final Squad snapshot.
  - First and subsequent transfer replacement ordering.
  - Exclusion of private and operational fields.
  - Rejection of duplicate archival.
  - Rollback when validation fails.
  - Rejection of mutation against completed archive records.
- The primary UI seam is the rendered Season Phase experience.
- UI tests cover:
  - Pre-season welcome content and team-builder access.
  - Active-season dashboard selection and closed team entry.
  - Complete-season finale behaviour and closed team entry.
- Existing team-builder component and composable tests provide prior art for form behaviour.
- Existing homepage/dashboard tests provide prior art for season-dependent page behaviour.
- All work must pass the repository's lint, typecheck, full test, build, and local Supabase migration-validation checks.
- Production verification is a manual checklist rather than an automated cross-provider test. At minimum it confirms:
  - A managed backup is visible.
  - The Cloudflare Cron Trigger is absent before cutover.
  - The archive contains the expected number of Season Results.
  - Every archived result has the expected Final Squad size.
  - Sample Season Transfers show the correct outgoing and incoming names.
  - The operational tables are empty after reset where expected.
  - Profiles and authentication access remain intact.
  - Exactly 20 new clubs are present.
  - Exactly 555 new players are present after the launch import.
  - Sample players join to the correct clubs.
  - `ACTIVE_SEASON` selects 2026/27.
  - `season_phase` is `preseason`.
  - The welcome page and team builder work on production.
  - A manual player sync succeeds.
  - The Cron Trigger is recreated with its original schedule.

## Out of Scope

- User-facing browsing of Archived Seasons for the initial launch.
- Preserving complete historical fixtures, weekly scores, player statistics, individual points, or FPL API records.
- Cross-season footballer identity.
- Automatic annual archival.
- Archival triggered by application settings.
- Downloadable logical backup tooling or reuse of existing staging-only restoration scripts.
- Point-in-Time Recovery configuration.
- Auditing or cleaning the unrelated staging branch history.
- Implementing or approving the UI overhaul itself.
- Automatic fixture import.
- Changing the league's scoring rules to use new FPL defensive-contribution fields.
- Replacing `ACTIVE_SEASON` with a database-derived active-season selector.
- Building an administration UI for Season Phase or archival.

## Further Notes

- Target date for opening team entry: 1 August 2026.
- Combined UI-overhaul go/no-go checkpoint: 30 July 2026.
- FPL Gameweek 1 deadline in the supplied launch data: 21 August 2026 at 17:30 UTC.
- The player Cron Trigger must remain paused from before archival until the new player dataset has been imported and verified.
- Supabase managed restoration can make the project temporarily unavailable and rolls the database back as a whole. The operator should understand the selected restore point before beginning cutover.
- The archive is the application's deliberately minimal history. The managed backup is disaster recovery, not an application data source.
