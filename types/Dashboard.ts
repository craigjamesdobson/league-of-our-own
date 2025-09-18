type WeeklyTransfer = {
  drafted_transfer_id: number;
  transfer_week: number;
  team_name: string;
  team_owner: string;
  player_out: string;
  player_out_image: string;
  player_out_team: string;
  player_out_team_short: string;
  player_out_cost: number;
  player_in: string;
  player_in_image: string;
  player_in_team: string;
  player_in_team_short: string;
  player_in_cost: number;
  player_in_position: string;
};

type TeamTransfers = {
  team_name: string;
  team_owner: string;
  transfers: WeeklyTransfer[];
};

type TopPositionPlayer = {
  web_name: string;
  points: number;
  position: number;
  image?: string;
};

type TopPositionPlayers = {
  players: readonly TopPositionPlayer[];
  points: number;
};

type LeagueAverages = {
  averagePoints: number;
  totalTeams: number;
  highestPoints: number;
  lowestPoints: number;
  weeksPlayed: number;
};

type PositionMover = {
  drafted_team_id: number;
  team_name: string;
  team_owner: string;
  goals: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
  total_points: number;
  week_points: number;
  weekly_winner: boolean;
  prev_week_position: number;
  positionChange: number;
  currentPosition: number;
};

type PositionMovers = {
  biggestRisers: PositionMover[];
  biggestFallers: PositionMover[];
};

export type { WeeklyTransfer, TeamTransfers, TopPositionPlayer, TopPositionPlayers, LeagueAverages, PositionMover, PositionMovers };
