interface RawDraftedPlayerTransferData {
  current_transfer_date_expiry: string;
  transfer_id: number;
  transfer_week: number;
}

interface RawDraftedPlayerData {
  player_id: number;
  transfers: RawDraftedPlayerTransferData[];
}

interface RawDraftedTeamData {
  team_id: number;
  team_owner: string;
  team_email: string;
  team_name: string;
  allowed_transfers: boolean;
  team_players: RawDraftedPlayerData[];
}

export { RawDraftedTeamData, RawDraftedPlayerData };
