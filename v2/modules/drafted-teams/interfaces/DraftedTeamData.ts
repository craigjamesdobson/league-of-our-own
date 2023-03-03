import { Player } from "@/modules/players/interaces/Player";

interface GameweekStats {
  gameweek?: number;
  goalsScored?: number;
  assists?: number;
  cleanSheet?: boolean | number;
  sentOff?: boolean | number;
  points?: number;
}

interface DraftedTeamData {
  teamID: number;
  teamName: string;
  teamOwner: string;
  allowedTransfers: boolean;
  teamValueAllowed: number;
  totalTeamValue: number;
  isInvalidTeam: boolean;
  invalidErrorMessages: [];
  teamPlayers: CompleteDraftedPlayer[];
  gameweekStats?: GameweekStats[];
  totalPoints?: number;
  totalGoals?: number;
  totalAssists?: number;
  totalRedCards?: number;
  totalCleanSheets?: number;
}

interface DraftedTransfer extends Player {
  isCurrentWeekTransfer: boolean;
  transferWeek: number;
}

interface CompleteDraftedPlayer extends Player {
  transfers: DraftedTransfer[];
}

export { DraftedTeamData, CompleteDraftedPlayer, DraftedTransfer };
