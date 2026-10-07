# Transfer requests and release pipeline review

Reviewed 7 October 2026. Baseline: `79e9c97f0e8d0a9ac47a1c304433f3964a87da96`
(`main`), including all commits on `feat/transfer-request` and the current
uncommitted changes. Three independent reviewers covered requirements,
standards/UI and deployment. This review does not authorize a commit or release.

## Updated release scope

The owner subsequently chose to release the pipeline and manual email workflow
only. The reviewed pipeline patch is now applied. The public transfer page opens
the email instructions, gameweek and copyable template directly. The online code
is retained behind `online_transfer_requests_enabled`, which defaults to false
and is enforced in the interface, API and database. Its unresolved rollover and
deadline concerns remain future work, rather than blockers for the manual email
release. Gameweeks and emailed requests continue to be processed manually.

## Release assessment

The email-only release passes the local application, browser, database and
pipeline checks. The online workflow stays disabled pending its later deadline/
rollover work. The latest changes still need staging deployment and smoke
testing before production promotion; external configuration checks below remain
relevant to deployment.

## Standards

The review found three concrete issues, now corrected in the working tree:

1. The replacement dialog checked each proposed change against the live budget,
   preventing a valid upgrade funded by another downgrade. Request mode now
   permits provisional selections; the complete form and database enforce the
   combined budget. Immediate administrator transfers retain their single-change
   budget check.
2. Selected transfer removal used the displayed allowance number instead of the
   actual form selection. Selection identity is now separate from allowance
   numbering and saved request numbering. Removing the first selection promotes
   the remaining selection, keeping the required first transfer valid.
3. Root guidance incorrectly described production deployment on `main` and
   referenced removed workflow files. It now describes verification on `main`
   and production deployment through a `v*` tag.

The public entry flow uses shared Nuxt UI controls and a shared layout. Its
copy action remains a compact neutral ghost button. Copy feedback uses the
standard information alert, with a polite live announcement and manual-copy
fallback. No general component framework or broad form refactor was added.

## Spec

### Confirmed behavior

- `/manage-team` offers a clear choice between email and online transfers.
- The email route requires no login or private team link. It supplies a selectable
  destination and subject, a copyable template with manager name/email and team,
  gameweek, outgoing/incoming player IDs, names, clubs and prices. The second
  transfer is optional; the budget reminder stays brief. Copying does not send
  anything. Email requests are handled manually and do not create website
  pending requests.
- Link recovery uses Turnstile, IP/email limits and a generic response. Eligible
  teams registered to the same email receive private management links.
- A private link permits requests for its own team. The server derives the
  target gameweek and the database rechecks it. Pending requests do not change
  the squad or consume completed-transfer allowance.
- Saved requests can be edited or cancelled while their target gameweek remains
  ahead of the current gameweek. Removing one saved item renumbers the remainder.
- Approval revalidates the active season, current squad, positions, availability,
  duplicate players, budget and allowance, then updates roster and request status
  atomically. Approval requires the current gameweek to match the target.
- Failed email delivery does not discard a saved request. Anonymous clients
  cannot read pending request tables or execute approval.

### Corrected requirement

The published carryover rule conflicted with a two-transfer cap in each half.
The owner confirmed that two is only the first-half cap. The frontend and new
forward migration now allow at most two before January and four across the
whole season thereafter. Each individual request still contains at most two.
January allowance cards display third/fourth transfers correctly.

Locked pending requests now retain their outgoing/incoming player details in
the private page's approval message. The private API explicitly sets `no-store`.

### Deadline decision still open

The published cutoff is Friday at 7pm, but the current code closes requests when
the administrator advances `current_gameweek`. Late manual rollover therefore
permits late submissions/changes. The owner also identified international breaks:
a recurring weekly cutoff would incorrectly close a multiweek transfer window.

Recommended small follow-up: store one explicit deadline for the target
gameweek, set to Friday 7pm before it starts. Close requests automatically at
that timestamp, retain manual gameweek rollover, and show a closed-window
message until the next window is configured. Do not infer deadlines from
fixtures or automatically advance the gameweek. This deadline setting is not
implemented in this review.

## Pipeline

The intended promotion flow makes sense: directly merge/push to `staging`,
verify application and clean migrations, apply staging migrations, deploy the
verified artifact; review through a PR into `main`, then deploy production from
a `v*` tag whose commit belongs to `main`. Main pushes, PRs and manual runs only
verify. Hidden artifact files and Nitro routes are included.

The proposed `/tmp/league-release-pipeline.patch` contains:

- Shared production workflow concurrency across differently named release tags,
  covering verification and deployment to prevent build timing from reversing
  releases. Publish one release at a time; this does not implement version sorting.
- Required public configuration validation before deployable builds.
- Cloudflare configuration validation and artifact download before database
  mutation, while still deploying the application after migrations succeed.
- Running the pgTAP database suite after clean migration validation.
- Deployment documentation describing those changes and runtime bindings.

The proposed workflow passes actionlint 1.7.7 and `git apply --check`. The pinned
Supabase CLI supports its test command. Automatic approval review rejected
editing the persistent deployment workflow under the initial audit request, so
the patch was prepared separately. The owner subsequently authorized moving
forward with the pipeline work, and the patch is now applied.

Read-only GitHub inspection confirms the staging/production build variable and
deployment secret names exist; environment policies restrict staging to its
branch and production to `v*` tags. The last staging deployment, run
`37538165635` at commit `46bcd96f9cd48de283d70755b892f099235cbbe5`, passed all
application/migration/deployment steps. It predates the latest uncommitted UX and
review fixes. No recent production tag deployment was available to inspect.

## Verification

- `pnpm lint` and `pnpm typecheck`: pass.
- `pnpm test`: 179 tests pass across 34 files.
- `pnpm build:cloudflare`: passes with client assets and Nitro API routes in `dist/`.
- A separate temporary local Supabase database applied every migration from
  scratch, including the carryover and default-off workflow migrations. Its 86
  pgTAP assertions pass: archive 32, submission deadline 4, uniqueness 3,
  transfer lifecycle and availability 47. Disabled online RPCs reject mutations
  while the existing authenticated manual transfer insert remains permitted.
- Transfer SQL tests exercise real functions: validation failures and rollback,
  budget-neutral pairs, duplicate pending requests, edits, incorrect keys,
  cancellation and renumbering, privileges, wrong-week approval, revalidation,
  successful approval, rejection and pre-/post-January allowance boundaries.
- Browser checks pass for the email-only main page, email alias, old keyed link
  and disabled recovery route at 1440, 375 and 320px in light and dark mode, with
  no horizontal overflow or JavaScript exceptions. The recovery route redirects
  to email instructions; keyed links do not load private APIs. Complete template
  copy and its fallback work. All five online API routes reject direct calls
  while disabled.
- Browser checks sent no emails. SQL fixtures rolled back. The isolated test
  database was stopped; the existing development database was not reset.

## External configuration and final staging checks

1. Disable public signups in staging Supabase. Its public auth settings currently
   report `disable_signup: false`. Production reports `true`. This app treats
   authenticated accounts as administrators, so this setting matters.
2. Populate the `ci` environment's public build variables with harmless local/test
   values. It currently has no variables; successful PR logs warn about missing
   Supabase configuration. Staging and production do have their variables.
3. Enable main branch protection if PR/check enforcement is required. The Main
   ruleset currently exists but is disabled; the workflow is a convention rather
   than an enforced merge gate.
4. Confirm Cloudflare automatic Git deployments are disabled and Preview/
   Production have the correct private runtime bindings, especially
   `NITRO_TURNSTILE_SECRET_KEY`, service-role credentials and Resend configuration.
   These settings were not available to verify through the configured tools.
5. Deploy the completed fixes to staging through the direct-merge flow, exercise
   real link recovery/request receipt/admin approval there, and record the exact
   successful commit before merging into main and tagging.

No commits, deployments, remote database writes or external configuration
changes were performed by this review.
