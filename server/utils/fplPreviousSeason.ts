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
  season_name: string | null;
  previous_season_goals: number;
  previous_season_assists: number;
  previous_season_clean_sheets: number;
  previous_season_red_cards: number;
  previous_season_points: number;
  previous_season_minutes: number;
}

export interface PreviousSeasonStatisticsRow {
  player_id: number;
  season_name: string | null;
  minutes: number;
  goals: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
  points: number;
  synced_at: string;
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
    season_name: latestSeason?.season_name ?? null,
    previous_season_goals: latestSeason?.goals_scored ?? 0,
    previous_season_assists: latestSeason?.assists ?? 0,
    previous_season_clean_sheets: latestSeason?.clean_sheets ?? 0,
    previous_season_red_cards: latestSeason?.red_cards ?? 0,
    previous_season_points: latestSeason?.total_points ?? 0,
    previous_season_minutes: latestSeason?.minutes ?? 0,
  };
};

export const buildPreviousSeasonStatisticsRows = (
  statistics: PreviousSeasonPlayerStatistics[],
  syncedAt: string,
): PreviousSeasonStatisticsRow[] => statistics.map(statistic => ({
  player_id: statistic.player_id,
  season_name: statistic.season_name,
  minutes: statistic.previous_season_minutes,
  goals: statistic.previous_season_goals,
  assists: statistic.previous_season_assists,
  clean_sheets: statistic.previous_season_clean_sheets,
  red_cards: statistic.previous_season_red_cards,
  points: statistic.previous_season_points,
  synced_at: syncedAt,
}));

const FPL_BOOTSTRAP_URL = 'https://fantasy.premierleague.com/api/bootstrap-static';
const FPL_ELEMENT_SUMMARY_URL = 'https://fantasy.premierleague.com/api/element-summary';
const HISTORY_FETCH_CONCURRENCY = 8;
const MAX_FETCH_ATTEMPTS = 3;
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

const wait = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds));

const fetchJson = async <T>(url: string): Promise<T> => {
  for (let attempt = 1; attempt <= MAX_FETCH_ATTEMPTS; attempt++) {
    const response = await fetch(url);

    if (response.ok) {
      return response.json() as Promise<T>;
    }

    if (!RETRYABLE_STATUS_CODES.has(response.status) || attempt === MAX_FETCH_ATTEMPTS) {
      throw new Error(`FPL API responded with status: ${response.status}`);
    }

    const retryAfter = Number(response.headers.get('retry-after'));
    const retryDelay = Number.isFinite(retryAfter) && retryAfter > 0
      ? retryAfter * 1000
      : 500 * 2 ** (attempt - 1);

    await wait(retryDelay);
  }

  throw new Error('FPL API request failed after retries');
};

export const fetchPreviousSeasonStatistics = async (): Promise<PreviousSeasonPlayerStatistics[]> => {
  const bootstrap = await fetchJson<{ elements: { id: number }[] }>(FPL_BOOTSTRAP_URL);
  const playerIds = bootstrap.elements.map(player => player.id);
  const statistics: PreviousSeasonPlayerStatistics[] = [];
  const failedPlayerIds: number[] = [];

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
        failedPlayerIds.push(playerId);
        return null;
      }
    }));

    statistics.push(...batchStatistics.filter(
      (statistic): statistic is PreviousSeasonPlayerStatistics => statistic !== null,
    ));
  }

  if (failedPlayerIds.length > 0) {
    throw new Error(
      `Could not load previous-season stats for ${failedPlayerIds.length} of ${playerIds.length} players`,
    );
  }

  return statistics;
};
