import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';

const setTotalTeamPrice = (draftedTeamData: DraftedTeamWithPlayers, activeGameweek?: number) => {
  return draftedTeamData.players.reduce((total: number, draftedPlayer: DraftedPlayer) => {
    const lastTransfer = draftedPlayer.transfers
      .filter(transfer => activeGameweek === undefined || transfer.transfer_week <= activeGameweek)
      .at(-1);
    const playerPrice
      = lastTransfer
        ? lastTransfer.data.cost
        : draftedPlayer.data.cost;

    return total + playerPrice;
  }, 0);
};

const setTeamValidity = (draftedTeamData: DraftedTeamWithPlayers & { total_team_value: number }): boolean => {
  if (draftedTeamData.allowed_transfers) {
    return draftedTeamData.total_team_value > 85;
  }
  else {
    return draftedTeamData.total_team_value > 90;
  }
};

const initDraftedTeamData = (draftedTeamsData: DraftedTeamWithPlayers[] | null, activeGameweek?: number) => {
  if (!draftedTeamsData) return;
  const draftedTeamData: (DraftedTeamWithPlayers)[] = draftedTeamsData.map(
    (draftedTeam: DraftedTeamWithPlayers) => {
      const teamWithValue = {
        ...draftedTeam,
        total_team_value: setTotalTeamPrice(draftedTeam, activeGameweek),
      };

      return {
        ...teamWithValue,
        is_invalid_team: setTeamValidity(teamWithValue),
      };
    },
  );

  return draftedTeamData;
};

export { initDraftedTeamData };
