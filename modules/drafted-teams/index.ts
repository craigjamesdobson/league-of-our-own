import type { Player } from '../players/interfaces/Player';
import type {
  DraftedTeamData,
  CompleteDraftedPlayer,
} from './interfaces/DraftedTeamData';
import type {
  RawDraftedPlayerData,
  RawDraftedTeamData,
} from '@/modules/drafted-teams/interfaces/RawDraftedTeamData';

const setDraftedPlayersData = (
  rawDraftedPlayerData: RawDraftedPlayerData[],
  playerList: Player[]
): CompleteDraftedPlayer[] => {
  return rawDraftedPlayerData.map((rawDraftedPlayer) => {
    return {
      ...playerList.filter(
        (player) => player.id === rawDraftedPlayer.player_id
      )[0],
      transfers: rawDraftedPlayer.transfers.map((rawTransferData) => {
        return {
          ...playerList.filter((p) => p.id === rawTransferData.transfer_id)[0],
          isCurrentWeekTransfer:
            new Date(rawTransferData.current_transfer_expiry_date) >=
            new Date(),
          transferWeek: rawTransferData.transfer_week,
        };
      }),
    };
  });
};

const setTotalTeamPrice = (draftedTeamData: DraftedTeamData[]) => {
  draftedTeamData.forEach((draftedTeam) => {
    draftedTeam.totalTeamValue = draftedTeam.teamPlayers
      .map((draftedPlayer) => +draftedPlayer.price)
      .reduce((prev, next) => prev + next);
  });
};

const setTeamValidity = (draftedTeamData: DraftedTeamData[]) => {
  draftedTeamData.forEach((draftedTeam) => {
    if (draftedTeam.allowedTransfers) {
      draftedTeam.isInvalidTeam = draftedTeam.totalTeamValue > 85;
    } else {
      draftedTeam.isInvalidTeam = draftedTeam.totalTeamValue > 95;
    }
  });
};

const initDraftedTeamData = (
  playerList: Player[],
  rawDraftedTeams: RawDraftedTeamData[]
) => {
  const draftedTeamData: DraftedTeamData[] = rawDraftedTeams.map(
    (rawDraftedTeamData) => {
      return {
        teamID: rawDraftedTeamData.team_id,
        teamName: rawDraftedTeamData.team_name,
        teamOwner: rawDraftedTeamData.team_owner,
        allowedTransfers: rawDraftedTeamData.allowed_transfers,
        teamValueAllowed: rawDraftedTeamData.allowed_transfers ? 85 : 95,
        teamPlayers: setDraftedPlayersData(
          rawDraftedTeamData.team_players,
          playerList
        ),
        totalTeamValue: 0,
        isInvalidTeam: false,
        invalidErrorMessages: [],
        gameweekStats: [],
        totalPoints: undefined,
        totalGoals: undefined,
        totalAssists: undefined,
        totalRedCards: undefined,
        totalCleanSheets: undefined,
      };
    }
  );

  setTotalTeamPrice(draftedTeamData);
  setTeamValidity(draftedTeamData);

  return draftedTeamData.sort((a, b) => (a.teamName > b.teamName ? 1 : -1));
};

export { initDraftedTeamData };
