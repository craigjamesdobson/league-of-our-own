export interface FplHistoryPast {
  season_name: string;
  total_points: number | null;
  minutes: number | null;
  goals_scored: number | null;
  assists: number | null;
  clean_sheets: number | null;
  red_cards: number | null;
}

export interface PreviousSeasonPlayerStatistics {
  player_id: number;
  previous_season_goals: number;
  previous_season_assists: number;
  previous_season_clean_sheets: number;
  previous_season_red_cards: number;
  previous_season_points: number;
  previous_season_minutes: number;
}

export interface FplElementSummary {
  history_past?: FplHistoryPast[];
}

const getSeasonStartYear = (seasonName: string): number => Number(seasonName.slice(0, 4));

export const getPreviousSeasonStatistics = (
  playerId: number,
  historyPast: FplHistoryPast[],
): PreviousSeasonPlayerStatistics => {
  const latestSeason = [...historyPast]
    .sort((left, right) => getSeasonStartYear(left.season_name) - getSeasonStartYear(right.season_name))
    .at(-1);

  return {
    player_id: playerId,
    previous_season_goals: latestSeason?.goals_scored ?? 0,
    previous_season_assists: latestSeason?.assists ?? 0,
    previous_season_clean_sheets: latestSeason?.clean_sheets ?? 0,
    previous_season_red_cards: latestSeason?.red_cards ?? 0,
    previous_season_points: latestSeason?.total_points ?? 0,
    previous_season_minutes: latestSeason?.minutes ?? 0,
  };
};

const FPL_BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static';
const FPL_ELEMENT_SUMMARY_URL = 'https://fantasy.premierleague.com/api/element-summary';
const HISTORY_FETCH_CONCURRENCY = 8;

const fetchJson = async <T>(url: string): Promise<T> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`FPL API responded with status: ${response.status}`);
  }

  return response.json() as Promise<T>;
};

export const fetchPreviousSeasonStatistics = async (): Promise<PreviousSeasonPlayerStatistics[]> => {
  const bootstrap = await fetchJson<{ elements: { id: number }[] }>(FPL_BOOTSTRAP_URL);
  const playerIds = bootstrap.elements.map(player => player.id);
  const statistics: PreviousSeasonPlayerStatistics[] = [];

  for (let index = 0; index < playerIds.length; index += HISTORY_FETCH_CONCURRENCY) {
    const batch = playerIds.slice(index, index + HISTORY_FETCH_CONCURRENCY);
    const batchStatistics = await Promise.all(batch.map(async (playerId) => {
      try {
        const summary = await fetchJson<FplElementSummary>(
          `${FPL_ELEMENT_SUMMARY_URL}/${playerId}/`,
        );

        return getPreviousSeasonStatistics(playerId, summary.history_past ?? []);
      }
      catch (error) {
        console.warn(`Could not load previous-season stats for player ${playerId}`, error);
        return null;
      }
    }));

    statistics.push(...batchStatistics.filter(
      (statistic): statistic is PreviousSeasonPlayerStatistics => statistic !== null,
    ));
  }

  return statistics;
};
