# League of Our Own

League of Our Own runs a private fantasy football competition using data from Fantasy Premier League.

## Language

**Season**:
A single Premier League campaign to which league teams, players, fixtures, transfers, and statistics belong.

**Active Season**:
The season currently accepting operational changes and shown by default in the application.
_Avoid_: Current season

**Archived Season**:
A completed season represented by an immutable snapshot of its final standings and squads. Detailed operational records are not part of the archive, and archival does not imply that the season is immediately browsable in the application.
_Avoid_: Legacy data, old data

**Season Result**:
A fantasy team's final position and score in an Archived Season.
_Avoid_: Archived team

**Final Squad**:
The players belonging to a fantasy team when its Season Result is captured. It is a display snapshot rather than a relationship to active player records.
_Avoid_: Historical players

**Season Transfer**:
A display snapshot of a player replacement made by a fantasy team, recording the gameweek and the outgoing and incoming player names.
_Avoid_: Archived transfer

**Season Phase**:
The operational stage of the Active Season: `preseason`, `active`, or `complete`. It controls which season interactions are open without determining which Season is selected.
_Avoid_: Season status
