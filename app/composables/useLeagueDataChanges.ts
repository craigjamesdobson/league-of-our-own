export function useLeagueDataChanges() {
  const playerStatisticsRevision = useState('player-statistics-revision', () => 0);
  const weeklyStatisticsRevision = useState('weekly-statistics-revision', () => 0);

  return {
    playerStatisticsRevision: readonly(playerStatisticsRevision),
    weeklyStatisticsRevision: readonly(weeklyStatisticsRevision),
    notifyPlayerStatisticsChanged: () => { playerStatisticsRevision.value += 1; },
    notifyWeeklyStatisticsChanged: () => { weeklyStatisticsRevision.value += 1; },
  };
}
