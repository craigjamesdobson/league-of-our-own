import { fetchPreviousSeasonStatistics } from '../utils/fplPreviousSeason';

export default defineCachedEventHandler(
  () => fetchPreviousSeasonStatistics(),
  {
    maxAge: 60 * 60 * 24,
    name: 'fpl-previous-season-player-stats',
  },
);
