import { describe, expect, it } from 'vitest';
import { getRecentFormSummary } from '~/logic/recent-form';
import { formFixtures, formScores, formTeams } from './fixtures';

const input = { teams: formTeams, scores: formScores, fixtures: formFixtures, currentGameweek: 6, period: 3 as const };

describe('recent form across completed gameweeks', () => {
  it('reports form, equal-period improvement, weekly average counts and movement from before the window', () => {
    const result = getRecentFormSummary(input);
    expect(result.weeks).toEqual([4, 5, 6]);
    expect(result.previousWeeks).toEqual([1, 2, 3]);
    expect(result.inForm).toMatchObject([{ drafted_team_id: 1, value: 60, average: 20 }]);
    expect(result.improved).toMatchObject([{ drafted_team_id: 1, value: 45, previousPoints: 15, totalPoints: 60 }]);
    expect(result.regularScorers).toMatchObject([{ drafted_team_id: 1, value: 3 }, { drafted_team_id: 2, value: 3 }]);
    expect(result.climbers).toMatchObject([{ drafted_team_id: 1, value: 1, startPosition: 3, endPosition: 2 }]);
    expect(result.inForm[0]?.scores).toEqual([
      { week: 4, points: 20, leagueAverage: 40 / 3 },
      { week: 5, points: 20, leagueAverage: 40 / 3 },
      { week: 6, points: 20, leagueAverage: 40 / 3 },
    ]);
  });

  it('breaks ties for in-form and most improved by recent goals, then name', () => {
    const scores = formScores.map(score => score.team === 1 || score.team === 2
      ? {
          ...score, points: score.week > 3 ? 20 : 5,
          goals: Number((score.team === 1 && score.week === 1) || (score.team === 2 && score.week === 4)),
        }
      : score);
    const result = getRecentFormSummary({ ...input, scores, teams: [...formTeams].reverse() });
    expect(result.inForm).toMatchObject([{ drafted_team_id: 2, value: 60 }]);
    expect(result.improved).toMatchObject([{ drafted_team_id: 2, value: 45 }]);
    expect(result.regularScorers.map(team => team.endPosition)).toEqual([1, 1]);

    const equalGoals = scores.map(score => score.week > 3 ? { ...score, goals: 0 } : score);
    const alphabetical = getRecentFormSummary({ ...input, scores: equalGoals, teams: [...formTeams].reverse() });
    expect(alphabetical.inForm).toMatchObject([{ drafted_team_id: 1, value: 60 }]);
    expect(alphabetical.improved).toMatchObject([{ drafted_team_id: 1, value: 45 }]);
  });

  it('shows the top five climbers and orders tied scorers by points before name', () => {
    const teams = Array.from({ length: 12 }, (_, index) => ({
      drafted_team_id: index + 1, team_name: `Team ${12 - index}`, team_owner: '',
    }));
    const scores = teams.flatMap((team, index) => formFixtures.map(({ game_week: week }) => ({
      team: team.drafted_team_id, week: week!, points: week === 1 ? index + 1 : 12 - index, goals: 0,
    })));
    const result = getRecentFormSummary({ ...input, teams, scores, period: 5 });

    expect(result.climbers.map(({ rank, value }) => [rank, value])).toEqual([[1, 11], [2, 9], [3, 7], [4, 5], [5, 3]]);
    expect(result.regularScorers.map(({ drafted_team_id, rank }) => [drafted_team_id, rank])).toEqual([
      [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1],
    ]);
  });

  it('excludes a whole gameweek when one fixture is unverified, including partially verified current results', () => {
    const fixtures = [...formFixtures, { game_week: 6, verified_at: null, verified_by: null }];
    expect(getRecentFormSummary({ ...input, fixtures }).weeks).toEqual([3, 4, 5]);
  });

  it('does not invent zero scores for a team with a missing weekly record', () => {
    const scores = formScores.filter(score => !(score.team === 3 && score.week === 6));
    expect(getRecentFormSummary({ ...input, scores }).weeks).toEqual([3, 4, 5]);
  });

  it('ignores future results even when their fixtures have been verified', () => {
    const result = getRecentFormSummary({ ...input, currentGameweek: 4 });
    expect(result.weeks).toEqual([2, 3, 4]);
    expect(result.inForm).toMatchObject([{ drafted_team_id: 2, value: 45 }]);
  });

  it('uses the available weeks early in the season without comparing unequal periods or an imaginary opening table', () => {
    const result = getRecentFormSummary({ ...input, currentGameweek: 2, period: 5 });
    expect(result.weeks).toEqual([1, 2]);
    expect(result.inForm).toMatchObject([{ drafted_team_id: 2, value: 30, average: 15 }]);
    expect(result.canCompare).toBe(false);
    expect(result.improved).toEqual([]);
    expect(result.canRank).toBe(false);
    expect(result.climbers).toEqual([]);
  });

  it('handles all-negative scores and calculates the league average across every team', () => {
    const scores = formTeams.map((team, index) => ({ team: team.drafted_team_id, week: 1, points: [-10, -5, -15][index]!, goals: null }));
    const result = getRecentFormSummary({ ...input, scores, currentGameweek: 1 });
    expect(result.inForm).toMatchObject([{ drafted_team_id: 2, value: -5 }]);
    expect(result.regularScorers).toMatchObject([{ drafted_team_id: 2, value: 1 }]);
    expect(result.inForm[0]?.scores[0]?.leagueAverage).toBe(-10);
  });

  it('accepts verified zero-score weeks but does not call equality above average', () => {
    const scores = formScores.map(score => ({ ...score, points: 0 }));
    const result = getRecentFormSummary({ ...input, scores });
    expect(result.weeks).toEqual([4, 5, 6]);
    expect(result.inForm).toHaveLength(1);
    expect(result.regularScorers).toEqual([]);
    expect(result.improved).toEqual([]);
    expect(result.climbers).toEqual([]);
  });

  it('does not report a negative improvement when every team declined', () => {
    const scores = formScores.map(score => ({ ...score, points: score.week <= 3 ? 20 : 5 }));
    expect(getRecentFormSummary({ ...input, scores }).improved).toEqual([]);
  });

  it('withholds movement when standings include an incomplete earlier gameweek', () => {
    const fixtures = formFixtures.map(fixture => fixture.game_week === 2 ? { ...fixture, verified_at: null } : fixture);
    const result = getRecentFormSummary({ ...input, fixtures });
    expect(result.weeks).toEqual([4, 5, 6]);
    expect(result.canRank).toBe(false);
    expect(result.climbers).toEqual([]);
  });

  it('uses goals to separate equal standings totals', () => {
    const scores = formScores.map(score => ({ ...score, points: 10, goals: score.team === 1 && score.week === 4 ? 1 : 0 }));
    const result = getRecentFormSummary({ ...input, scores });
    expect(result.climbers).toEqual([]);
    expect(result.inForm[0]?.endPosition).toBe(1);
  });

  it('returns an honest empty state when there are no teams, fixtures or complete scores', () => {
    for (const missing of [{ teams: [] }, { fixtures: [] }, { scores: [] }]) {
      const result = getRecentFormSummary({ ...input, ...missing });
      expect(result.weeks).toEqual([]);
      expect(result.inForm).toEqual([]);
      expect(result.canCompare).toBe(false);
    }
  });
});
