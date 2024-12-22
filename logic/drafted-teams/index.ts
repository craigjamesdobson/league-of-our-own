import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeam } from '~/types/DraftedTeam';

const setTotalTeamPrice = (draftedTeamData: DraftedTeam) => {
  return draftedTeamData.players.reduce((total: number, draftedPlayer: DraftedPlayer) => {
    const playerPrice
      = draftedPlayer.transfers.length > 0
        ? draftedPlayer.transfers[draftedPlayer.transfers.length - 1].data
          .cost
        : draftedPlayer.data.cost;

    return total + playerPrice;
  }, 0);
};

const setTeamValidity = (draftedTeamData: DraftedTeam) => {
  if (!draftedTeamData.total_team_value) return;

  if (draftedTeamData.allowed_transfers) {
    return (draftedTeamData.is_invalid_team
      = draftedTeamData.total_team_value > 85);
  }
  else {
    return (draftedTeamData.is_invalid_team
      = draftedTeamData.total_team_value > 95);
  }
};

const initDraftedTeamData = (draftedTeamsData: DraftedTeam[]) => {
  if (!draftedTeamsData) return;
  const draftedTeamData: DraftedTeam[] = draftedTeamsData.map(
    (draftedTeam: DraftedTeam) => {
      return {
        ...draftedTeam,
        total_team_value: setTotalTeamPrice(draftedTeam),
        is_invalid_team: setTeamValidity(draftedTeam),
      };
    },
  );

  return draftedTeamData;
};

export { initDraftedTeamData };
