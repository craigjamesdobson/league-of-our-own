import type { DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from "~/types/DraftedPlayer";
import type { WeeklyStats } from "~/types/DraftedTeam";

export function useWeeklyStatistics(draftedTeam: any, selectedGameweek: number) {
    const calculatedWeeklyStats = computed(() => {
      return draftedTeam.players.reduce(
        (accumulatedStats: WeeklyStats, player: DraftedPlayerWithWeeklyStats) => {
          let activePlayer: DraftedPlayerWithWeeklyStats | DraftedTransferWithWeeklyStats = player.transfers
            .filter((x) => x.transfer_week <= selectedGameweek)
            .sort((a, b) => b.transfer_week - a.transfer_week)[0] || player;
  
          if (player.selected) {
            activePlayer = player;
          }

          const selectedTransfer = player.transfers.find((transfer) => transfer.selected);
  
          if (selectedTransfer) {
            activePlayer = selectedTransfer;
          }
  
          const currentPlayerPoints = activePlayer
            ? activePlayer.points || 0
            : player.transfers.reduce((points, transfer) => {
                return transfer.transfer_week <= selectedGameweek
                  ? transfer.points
                  : points;
              }, player.points || 0);
  
          return {
            drafted_team_id: draftedTeam.drafted_team_id,
            points: accumulatedStats.points + currentPlayerPoints,
            goals: accumulatedStats.goals + (activePlayer?.week_goals || 0),
            assists: accumulatedStats.assists + (activePlayer?.week_assists || 0),
            red_cards:
              accumulatedStats.red_cards + (activePlayer?.week_redcards ? 1 : 0),
            clean_sheets:
              accumulatedStats.clean_sheets +
              (activePlayer?.week_cleansheets ? 1 : 0),
          };
        },
        {
          points: 0,
          goals: 0,
          assists: 0,
          red_cards: 0,
          clean_sheets: 0,
        }
      );
    });
  
    return {
      calculatedWeeklyStats,
    };
  }