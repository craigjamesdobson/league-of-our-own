import type { Tables } from '~/types/database.types';

export type RecentFormPeriod = 3 | 5 | 10;
export type FormTeam = Pick<Tables<'drafted_teams'>, 'drafted_team_id' | 'team_name' | 'team_owner'>;
export type FormScore = Pick<Tables<'weekly_statistics'>, 'team' | 'week' | 'points' | 'goals'>;
export type FormFixture = Pick<Tables<'fixtures'>, 'game_week' | 'verified_at' | 'verified_by'>;
export type FormLeader = FormTeam & {
  value: number;
  totalPoints: number;
  average: number;
  previousPoints: number | null;
  startPosition: number | null;
  endPosition: number | null;
  scores: { week: number; points: number; leagueAverage: number }[];
  previousScores: { week: number; points: number }[];
};
export type RecentFormSummary = {
  weeks: number[];
  previousWeeks: number[];
  inForm: FormLeader[];
  improved: FormLeader[];
  regularScorers: FormLeader[];
  climbers: FormLeader[];
  canCompare: boolean;
  canRank: boolean;
};

const totalPoints = (scores: readonly FormScore[], weeks: readonly number[], team: number) =>
  scores.filter(score => score.team === team && weeks.includes(score.week))
    .reduce((sum, score) => sum + score.points, 0);

const leaders = (teams: readonly FormLeader[], requirePositive = false): FormLeader[] => {
  if (teams.length === 0) return [];
  const best = Math.max(...teams.map(team => team.value));
  if (requirePositive && best <= 0) return [];
  return teams.filter(team => team.value === best)
    .toSorted((a, b) => a.team_name.localeCompare(b.team_name) || a.drafted_team_id - b.drafted_team_id);
};

const positions = (teams: readonly FormTeam[], scores: readonly FormScore[], week: number) => {
  const totals = teams.map(team => ({
    id: team.drafted_team_id,
    points: scores.filter(score => score.team === team.drafted_team_id && score.week <= week)
      .reduce((sum, score) => sum + score.points, 0),
    goals: scores.filter(score => score.team === team.drafted_team_id && score.week <= week)
      .reduce((sum, score) => sum + (score.goals ?? 0), 0),
  })).toSorted((a, b) => b.points - a.points || b.goals - a.goals);

  return new Map(totals.map(team => [team.id,
    totals.findIndex(candidate => candidate.points === team.points && candidate.goals === team.goals) + 1,
  ]));
};

export function getRecentFormSummary({ teams, scores, fixtures, currentGameweek, period }: {
  teams: readonly FormTeam[];
  scores: readonly FormScore[];
  fixtures: readonly FormFixture[];
  currentGameweek: number;
  period: RecentFormPeriod;
}): RecentFormSummary {
  const completedWeeks = Array.from({ length: currentGameweek }, (_, index) => index + 1)
    .filter((week) => {
      const weekFixtures = fixtures.filter(fixture => fixture.game_week === week);
      return teams.length > 0 && weekFixtures.length > 0
        && weekFixtures.every(fixture => fixture.verified_at && fixture.verified_by)
        && teams.every(team => scores.some(score => score.team === team.drafted_team_id && score.week === week));
    });
  const weeks = completedWeeks.slice(-period);
  const previousWeeks = completedWeeks.slice(-period * 2, -period);
  const firstWeek = weeks[0];
  const lastWeek = weeks.at(-1);
  const canCompare = weeks.length === period && previousWeeks.length === period;
  const canRank = firstWeek !== undefined && firstWeek > 1 && lastWeek !== undefined
    && Array.from({ length: lastWeek }, (_, index) => index + 1).every(week => completedWeeks.includes(week));
  const base: RecentFormSummary = {
    weeks, previousWeeks, canCompare, canRank, inForm: [], improved: [], regularScorers: [], climbers: [],
  };
  if (firstWeek === undefined || lastWeek === undefined) return base;

  const averages = new Map(weeks.map(week => [week,
    teams.reduce((sum, team) => sum + totalPoints(scores, [week], team.drafted_team_id), 0) / teams.length,
  ]));
  const startPositions = canRank ? positions(teams, scores, firstWeek - 1) : new Map<number, number>();
  const endPositions = canRank ? positions(teams, scores, lastWeek) : new Map<number, number>();
  const results = teams.map((team): FormLeader => {
    const points = totalPoints(scores, weeks, team.drafted_team_id);
    return {
      ...team,
      value: points,
      totalPoints: points,
      average: points / weeks.length,
      previousPoints: canCompare ? totalPoints(scores, previousWeeks, team.drafted_team_id) : null,
      startPosition: startPositions.get(team.drafted_team_id) ?? null,
      endPosition: endPositions.get(team.drafted_team_id) ?? null,
      previousScores: canCompare
        ? previousWeeks.map(week => ({
            week, points: totalPoints(scores, [week], team.drafted_team_id),
          }))
        : [],
      scores: weeks.map(week => ({
        week,
        points: totalPoints(scores, [week], team.drafted_team_id),
        leagueAverage: averages.get(week) ?? 0,
      })),
    };
  });

  return {
    ...base,
    inForm: leaders(results),
    improved: canCompare ? leaders(results.map(team => ({ ...team, value: team.totalPoints - (team.previousPoints ?? 0) })), true) : [],
    regularScorers: leaders(results.map(team => ({
      ...team,
      value: team.scores.filter(score => score.points > score.leagueAverage).length,
    })), true),
    climbers: canRank
      ? leaders(results.map(team => ({
          ...team,
          value: (team.startPosition ?? 0) - (team.endPosition ?? 0),
        })), true)
      : [],
  };
}
