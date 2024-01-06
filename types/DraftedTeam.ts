import type { DraftedPlayer } from './DraftedPlayer';

interface DraftedTeam {
  drafted_team_id: number;
  team_name: string;
  team_owner: string;
  team_email: string;
  allowed_transfers: boolean;
  players: DraftedPlayer[];
  total_team_value?: number;
  is_invalid_team?: boolean;
}

export type { DraftedTeam };
