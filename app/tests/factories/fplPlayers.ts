export const createMockFplPlayers = () => {
  const positionCounts = [8, 24, 20, 16];
  let playerId = 0;

  return positionCounts.flatMap((count, positionIndex) =>
    Array.from({ length: count }, () => {
      playerId += 1;

      return {
        id: playerId,
        code: 100000 + playerId,
        cost_change_event: 0,
        cost_change_start_fall: 0,
        cost_change_start: 0,
        element_type: positionIndex + 1,
        first_name: `Player ${playerId}`,
        news: '',
        news_added: null,
        now_cost: 45 + ((playerId % 7) * 5),
        photo: `${playerId}.jpg`,
        second_name: `Surname ${playerId}`,
        status: 'a',
        team: ((playerId - 1) % 20) + 1,
        team_code: 100 + (((playerId - 1) % 20) + 1),
        web_name: `Player ${playerId}`,
        minutes: 0,
        goals_scored: 0,
        assists: 0,
        clean_sheets: 0,
        red_cards: 0,
      };
    }),
  );
};
