import { describe, expect, it } from 'vitest';
import { sortTeamsWithFavourite } from '~/logic/favourite-team';

const teams = [
  { drafted_team_id: 1, team_name: 'First' },
  { drafted_team_id: 2, team_name: 'Second' },
  { drafted_team_id: 3, team_name: 'Third' },
];

describe('sortTeamsWithFavourite', () => {
  it('moves the favourite team to the front without changing the remaining order', () => {
    expect(sortTeamsWithFavourite(teams, 2)).toEqual([
      teams[1],
      teams[0],
      teams[2],
    ]);
  });

  it('leaves the list unchanged when there is no favourite or the favourite is missing', () => {
    expect(sortTeamsWithFavourite(teams, null)).toBe(teams);
    expect(sortTeamsWithFavourite(teams, 99)).toBe(teams);
  });
});
