import type { Player, PlayerSeasonStats, PlayerWithStats } from '~/types/Player';
import type { Tables } from '~/types/database.types';

type SeasonTotals = {
  goals: number;
  assists: number;
  points: number;
  cleanSheets: number;
  redCards: number;
};

const mapSeasonTotals = (
  stats: Tables<'player_statistics_totals'>[],
): Record<number, SeasonTotals> => {
  return stats.reduce<Record<number, SeasonTotals>>((accumulator, stat) => {
    return {
      ...accumulator,
      [stat.player_id]: {
        goals: stat.goals ?? 0,
        assists: stat.assists ?? 0,
        points: stat.points ?? 0,
        cleanSheets: stat.clean_sheets ?? 0,
        redCards: stat.red_cards ?? 0,
      },
    };
  }, {});
};

const mergePlayersWithSeasonTotals = (
  players: Player[],
  totals: Record<number, SeasonTotals>,
): PlayerSeasonStats[] => {
  return players.map((player) => {
    const stats = totals[player.player_id] ?? {
      goals: 0,
      assists: 0,
      points: 0,
      cleanSheets: 0,
      redCards: 0,
    };

    return {
      ...player,
      season_goals: stats.goals,
      season_assists: stats.assists,
      season_points: stats.points,
      season_clean_sheets: stats.cleanSheets,
      season_red_cards: stats.redCards,
    };
  });
};

const populatePlayersWithStats = (
  players: Player[],
  playerStats: Tables<'player_statistics'>[],
  teamId?: number,
): PlayerWithStats[] => {
  const filteredPlayers = teamId
    ? players.filter(player => player.team === teamId)
    : players;

  const weekDataMap = new Map<number, (typeof playerStats)[number]>();
  playerStats.forEach((data: Tables<'player_statistics'>) =>
    weekDataMap.set(data.player_id!, data),
  );

  return filteredPlayers.map((player) => {
    const weekPlayerData = weekDataMap.get(player.player_id);
    if (weekPlayerData) {
      return {
        ...player,
        week_goals: weekPlayerData.goals || 0,
        week_assists: weekPlayerData.assists || 0,
        week_redcard: weekPlayerData.red_card || false,
        week_cleansheet: weekPlayerData.clean_sheet || false,
        week_points: weekPlayerData.points || 0,
      };
    }

    return {
      ...player,
      week_goals: 0,
      week_assists: 0,
      week_redcard: false,
      week_cleansheet: false,
      week_points: 0,
    };
  });
};

export type { SeasonTotals };
export { mapSeasonTotals, mergePlayersWithSeasonTotals, populatePlayersWithStats };
