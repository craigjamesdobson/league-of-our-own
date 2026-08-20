# Your team selection

The teams page lets each browser choose one team as “your team”. This is a local preference rather than an account setting, so it works for visitors who are not signed in and does not change the team data stored in Supabase.

## Interaction

- Before a team is selected, each team card shows a small radio control with a tooltip explaining that it selects the team.
- The selected team moves to the front of the list and gets a subtle gold card border.
- Once selected, the other radio controls are hidden to keep the cards quiet. The selected team’s check-team icon remains available; its tooltip explains that clicking it removes the selection.
- Removing the selection restores the radio controls for all teams.

The same check-team icon appears next to the team name in team-based summaries such as the league table, weekly winners, dashboard cards, weekly transfers, and the season finale. Winner stars remain reserved for winner/high-score indicators.

## Persistence and identity

The preference is stored in the `league-of-our-own-favourite-team-id` cookie for one year. The cookie stores the stable `drafted_team_id`, not the team name or owner, so renaming a team does not break the preference. Weekly-winner payloads include the same ID; the UI retains a name-and-owner fallback for older payloads while the migration is deployed.

*Last updated: 2026-08-20*
