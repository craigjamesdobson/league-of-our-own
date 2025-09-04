import type { TablesInsert } from '~/types/database-generated.types';
import type { DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from '~/types/DraftedPlayer';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';

type CalculatedWeeklyStats = Omit<TablesInsert<'weekly_statistics'>, 'team' | 'week'>;

export function useWeeklyStatistics(draftedTeam: Ref<DraftedTeamWithPlayers>, selectedGameweek: Ref<number>) {
  const calculatedWeeklyStats = computed(() => {
    return draftedTeam.value.players.reduce(
      (accumulatedStats: CalculatedWeeklyStats, player: DraftedPlayerWithWeeklyStats) => {
        let activePlayer: DraftedPlayerWithWeeklyStats | DraftedTransferWithWeeklyStats = player.transfers
          .filter(x => x.transfer_week <= selectedGameweek.value)
          .sort((a, b) => b.transfer_week - a.transfer_week)[0] || player;

        if (player.selected) {
          activePlayer = player;
        }

        const selectedTransfer = player.transfers.find(transfer => transfer.selected);

        if (selectedTransfer) {
          activePlayer = selectedTransfer;
        }

        const currentPlayerPoints = activePlayer.points || 0;

        return {
          points: accumulatedStats.points + currentPlayerPoints,
          goals: (accumulatedStats.goals || 0) + (activePlayer?.week_goals || 0),
          assists: (accumulatedStats.assists || 0) + (activePlayer?.week_assists || 0),
          red_cards:
              (accumulatedStats.red_cards || 0) + (activePlayer?.week_redcards ? 1 : 0),
          clean_sheets:
              (accumulatedStats.clean_sheets || 0)
              + (activePlayer?.week_cleansheets ? 1 : 0),
        };
      },
      {
        points: 0,
        goals: null,
        assists: null,
        red_cards: null,
        clean_sheets: null,
      },
    );
  });

  return {
    calculatedWeeklyStats,
  };
}
