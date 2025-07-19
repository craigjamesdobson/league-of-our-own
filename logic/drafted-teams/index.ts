import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';

const setTotalTeamPrice = (draftedTeamData: DraftedTeamWithPlayers) => {
  return draftedTeamData.players.reduce((total: number, draftedPlayer: DraftedPlayer) => {
    const playerPrice
      = draftedPlayer.transfers.length > 0
        ? draftedPlayer.transfers[draftedPlayer.transfers.length - 1].data
          .cost
        : draftedPlayer.data.cost;

    return total + playerPrice;
  }, 0);
};

const setTeamValidity = (draftedTeamData: DraftedTeamWithPlayers & { total_team_value: number }): boolean => {
  if (draftedTeamData.allowed_transfers) {
    return draftedTeamData.total_team_value > 85;
  }
  else {
    return draftedTeamData.total_team_value > 95;
  }
};

const initDraftedTeamData = (draftedTeamsData: DraftedTeamWithPlayers[] | null) => {
  if (!draftedTeamsData) return;
  const draftedTeamData: (DraftedTeamWithPlayers)[] = draftedTeamsData.map(
    (draftedTeam: DraftedTeamWithPlayers) => {
      const teamWithValue = {
        ...draftedTeam,
        total_team_value: setTotalTeamPrice(draftedTeam),
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
