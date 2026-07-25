export interface FplPlayer {
  id: number;
  code: number;
  cost_change_event: number;
  cost_change_start_fall: number;
  cost_change_start: number;
  element_type: number;
  first_name: string;
  news: string;
  news_added: string | null;
  now_cost: number;
  photo: string;
  second_name: string;
  status: string;
  team: number;
  team_code: number;
  web_name: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
}

export interface PlayerForSync {
  player_id: number;
  code: number;
  cost_change_event: number;
  cost_change_start_fall: number;
  cost_change_start: number;
  element_type: number;
  first_name: string;
  news: string;
  news_added: string | null;
  now_cost: number;
  photo: string;
  second_name: string;
  status: string;
  team: number;
  team_code: number;
  web_name: string;
  minutes: number;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  red_cards: number;
}

export const prepareFplPlayersForSync = (
  payload: unknown,
): PlayerForSync[] => {
  if (
    typeof payload !== 'object'
    || payload === null
    || !('elements' in payload)
    || !Array.isArray(payload.elements)
  ) {
    throw new Error('FPL bootstrap payload does not contain an elements array');
  }

  return (payload.elements as FplPlayer[]).map(player => ({
    player_id: player.id,
    code: player.code,
    cost_change_event: player.cost_change_event,
    cost_change_start_fall: player.cost_change_start_fall,
    cost_change_start: player.cost_change_start,
    element_type: player.element_type,
    first_name: player.first_name,
    news: player.news,
    news_added: player.news_added,
    now_cost: player.now_cost,
    photo: player.photo,
    second_name: player.second_name,
    status: player.status,
    team: player.team,
    team_code: player.team_code,
    web_name: player.web_name,
    minutes: player.minutes,
    goals_scored: player.goals_scored,
    assists: player.assists,
    clean_sheets: player.clean_sheets,
    red_cards: player.red_cards,
  }));
};
