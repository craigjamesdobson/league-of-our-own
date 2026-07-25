# FPL 2026/27 fixture source

**Last updated:** 2026-07-25

## Finding

The first-party FPL fixtures endpoint is
[`https://fantasy.premierleague.com/api/fixtures/`](https://fantasy.premierleague.com/api/fixtures/).
It is public and currently returns a top-level JSON array containing all 380
Premier League fixtures for 2026/27. An individual gameweek can also be requested
with an `event` query parameter, for example
[`?event=1`](https://fantasy.premierleague.com/api/fixtures/?event=1).

The live response was fetched and checked on 2026-07-25. Every fixture had an
`event` value, events 1 through 38 each contained exactly 10 fixtures, and every
round contained each of the 20 team IDs once. Therefore, all 380 matches are
currently assigned to an FPL gameweek.

The keys currently present on each fixture are:

```text
code
event
finished
finished_provisional
id
kickoff_time
minutes
provisional_start_time
pulse_id
started
stats
team_a
team_a_difficulty
team_a_score
team_h
team_h_difficulty
team_h_score
```

`team_h` and `team_a` use the same numeric club IDs as the FPL
[`bootstrap-static`](https://fantasy.premierleague.com/api/bootstrap-static/)
payload. `event` is the FPL gameweek number and `kickoff_time` is an ISO 8601 UTC
timestamp. Before the season, scores are `null`, `stats` is empty, and the match
lifecycle flags are `false`.

## Dates are not final

The presence of a `kickoff_time`, or even `provisional_start_time: false`, must
not be treated as a guarantee that a date is final. The Premier League states
that all 380 fixtures are subject to change because of broadcast selections and
domestic and European cup scheduling. Its published schedule likewise warns
that fixture dates can change. [Premier League explanation of fixture
changes](https://www.premierleague.com/en/news/4324634), [official list of all
380 fixtures](https://www.premierleague.com/en/news/4675097/all-380-fixtures-for-202627-premier-league-season/).

The Premier League's official digital calendar automatically follows later
rescheduling, but it is less suitable for database seeding because it does not
provide the FPL team-ID mapping used by this application. [Premier League
digital calendar](https://www.premierleague.com/en/news/1235133/download-the-202627-fixtures-to-your-calendar/).

## Recommendation

Use the FPL fixtures endpoint as the fixture source for the explicit
`db:reset:fpl` workflow rather than scraping the Premier League website. Fetch
it after `bootstrap-static`, then validate the response before writing anything:

- exactly 380 fixtures;
- numeric, unique fixture IDs;
- events 1 through 38, with 10 fixtures in each event;
- home and away IDs that exist in the imported 20 clubs;
- each club appearing once in every event;
- no fixture pairing a club with itself.

The existing local fixture columns can be mapped directly:

| Local column | FPL field |
| --- | --- |
| `id` | `id` |
| `game_week` | `event` |
| `home_team` | `team_h` |
| `away_team` | `team_a` |
| `home_team_score` | `team_h_score` |
| `away_team_score` | `team_a_score` |

For the initial 2026/27 development seed, both score columns should remain
`null`. The endpoint is first-party but has no published schema contract, so the
reset importer should validate its shape defensively and fail without partially
loading data if that shape changes.

Because the endpoint is live and will reflect rescheduling, there are two useful
implementation choices:

1. Fetch it on every `db:reset:fpl` to keep local fixtures current.
2. Generate and commit a timestamped SQL snapshot when a completely repeatable,
   offline reset is more important than current scheduling.

For the requested FPL-backed development reset, option 1 is the better default.
The database currently stores the matchup and gameweek rather than kick-off
time, so ordinary broadcast time changes will not affect the seeded rows. A
later postponement that changes the FPL `event` assignment will be picked up on
the next reset.
