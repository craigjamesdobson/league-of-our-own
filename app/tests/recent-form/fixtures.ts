import type { FormFixture, FormScore, FormTeam } from '~/logic/recent-form';

export const formTeams: FormTeam[] = [
  { drafted_team_id: 1, team_name: 'North Stand', team_owner: 'Alex' },
  { drafted_team_id: 2, team_name: 'Park End', team_owner: 'Blair' },
  { drafted_team_id: 3, team_name: 'Touchline', team_owner: 'Casey' },
];
export const formScores: FormScore[] = [
  [5, 5, 5, 20, 20, 20],
  [15, 15, 15, 15, 15, 15],
  [10, 10, 10, 5, 5, 5],
].flatMap((points, index) => points.map((value, week) => ({
  team: index + 1, week: week + 1, points: value, goals: 0,
})));
export const formFixtures: FormFixture[] = Array.from({ length: 6 }, (_, index) => ({
  game_week: index + 1, verified_at: '2026-10-01T12:00:00Z', verified_by: 'admin',
}));
