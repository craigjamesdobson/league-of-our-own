# Recent Form

The homepage's Recent Form section replaces League Statistics with shared league performance over the last five completed gameweeks. The period is fixed. The top-performing players and gameweek summaries retain their existing presentation.

## Eligible gameweeks

A gameweek is eligible when it is no later than the configured current gameweek, has fixtures, every fixture has both verification fields, and every Active Season team has an explicit weekly score. Zero and negative scores are valid; missing scores are not assumed to be zero. The actual included gameweeks are listed in the panel heading. Early-season periods use the available eligible weeks and show that fewer weeks were available.

Teams and score history are filtered to the Active Season. Score history is paginated so the database's row limit cannot silently truncate a season. The fixture table contains operational data and has no season column. No new database migrations or external data feeds are required.

## Definitions

- **In-form team:** the highest total across the selected gameweeks, with average points per gameweek.
- **Most improved:** the greatest positive increase over the immediately preceding equal-length set of completed gameweeks. Both full periods must exist. If no team improved, say so.
- **Regular high scorers:** the teams with the most selected weeks strictly above that week's mean score across all Active Season teams. Equality does not count as above average.
- **Biggest climbers:** the teams with the greatest positive rank improvement between the standings immediately before the period and those at its end. Rank by cumulative points, then cumulative goals. Teams equal on both share a competition rank, so arbitrary row ordering cannot create movement. Verified, complete score history through the end of the window is required; the opening week has no earlier standings baseline.

Regular High Scorers and Biggest Climbers show the top three places, including ties at the cutoff. Teams sharing a place are ordered by name. In-form Team and Most Improved show all joint leaders. The selected-team cookie has no effect on calculations or ordering.

## Interaction and loading

The section uses one panel with four compact columns. It shows weekly scores for the in-form team, compares previous and recent totals for Most Improved, and gives starting and ending positions for climbers. Regular High Scorers displays a dot for every gameweek, including perfect records. Darker dots show weeks above average. Selecting a dot opens the gameweek, score and league average. Loading, empty, insufficient-history, no-positive-result and retryable error states remain.

Requests for a superseded gameweek or Active Season cannot overwrite newer data. Response shapes are validated before displaying statistics. The calculation boundary and loader have tests for ties, negative and zero scores, incomplete fixtures, missing records, early-season windows, pagination, failed reads and stale responses.

## Presentation

The panel keeps the application's existing navy/slate palette, font families and section headings. It uses one shared surface with responsive dividers instead of four tall cards. The four stat headings use uppercase text and small Lucide icons to match the rest of the dashboard. Weekly scores, comparisons and tied-team positions provide the useful detail directly. Owner names and repeated descriptions are omitted from this overview. Compact-data presentation was informed by [Tremor's spark-chart examples](https://www.tremor.so/docs/visualizations/spark-chart) and [Anthropic's frontend-design guidance](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md), adapted to the existing Nuxt UI design system.

## Sources

- [Local demo seeder](../../scripts/seed-recent-form-demo.ts) - Run `pnpm db:seed:recent-form` against the FPL-backed local database for 21 simulated verified gameweeks.
- [Calculations](../../app/logic/recent-form/index.ts)
- [Data loader](../../app/composables/useRecentForm.ts)
- [Dashboard component](../../app/components/Dashboard/RecentForm.vue)

**Last updated:** 2026-10-10
