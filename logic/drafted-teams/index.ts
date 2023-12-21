import type { DraftedTeamData } from './interfaces/DraftedTeamData';

const setTotalTeamPrice = (draftedTeamData: any) => {
  return draftedTeamData.players.reduce((total: number, draftedPlayer: any) => {
    const playerPrice =
      draftedPlayer.transfers.length > 0
        ? parseFloat(
            draftedPlayer.transfers[draftedPlayer.transfers.length - 1].player
              .cost
          )
        : parseFloat(draftedPlayer.cost);

    return total + playerPrice;
  }, 0);
};

const setTeamValidity = (draftedTeamData: any) => {
  if (draftedTeamData.allowedTransfers) {
    return (draftedTeamData.isInvalidTeam =
      draftedTeamData.totalTeamValue > 85);
  } else {
    return (draftedTeamData.isInvalidTeam =
      draftedTeamData.totalTeamValue > 95);
  }
};

const initDraftedTeamData = (draftedTeamsData: any) => {
  const draftedTeamData: DraftedTeamData[] = draftedTeamsData.map(
    (draftedTeam: any) => {
      return {
        ...draftedTeam,
        total_team_value: setTotalTeamPrice(draftedTeam),
        is_invalid_team: setTeamValidity(draftedTeam),
      };
    }
  );

  return draftedTeamData.sort((a, b) => (a.teamName > b.teamName ? 1 : -1));
};

export { initDraftedTeamData };
