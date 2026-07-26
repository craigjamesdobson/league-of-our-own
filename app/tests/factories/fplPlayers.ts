const curatedPlayerCodesByPosition = new Map([
  [1, [204936, 154561, 111234, 457569]],
  [2, [
    226597, 209036, 97032, 467779,
    247348, 225796, 17761, 469142,
    199796, 244723, 472769, 215136,
    494521, 216051, 200834, 466075,
  ]],
  [3, [
    141746, 437730, 204480, 244851,
    513418, 223340, 446008, 209244,
    243298, 208706, 222531, 448047,
    201658, 215413,
  ]],
  [4, [
    223094, 502500, 224117, 50175,
    177815, 178301, 231747, 219168,
    538207, 475168, 444102, 438234,
  ]],
]);

const playerTeamEntries = (codes: number[], team: number): [number, number][] =>
  codes.map(code => [code, team]);

const curatedPlayerTeamsByCode = new Map<number, number>([
  ...playerTeamEntries([154561, 226597, 223340, 204480, 224117, 466075], 1),
  ...playerTeamEntries([199796, 178301], 2),
  ...playerTeamEntries([494521, 201658, 444102, 457569], 3),
  ...playerTeamEntries([513418, 502500], 4),
  ...playerTeamEntries([467779, 50175], 5),
  ...playerTeamEntries([225796, 475168, 244851, 448047], 6),
  ...playerTeamEntries([247348, 244723, 231747], 8),
  ...playerTeamEntries([111234, 17761, 215413], 9),
  ...playerTeamEntries([177815], 13),
  ...playerTeamEntries([97032, 243298, 219168], 14),
  ...[204936, 209036, 437730, 472769, 209244, 438234, 223094]
    .map((code): [number, number] => [code, 15]),
  ...playerTeamEntries([141746, 216051, 446008], 16),
  ...playerTeamEntries([208706, 538207], 17),
  ...playerTeamEntries([222531, 215136], 18),
  ...playerTeamEntries([200834], 20),
]);

export const createMockFplPlayers = () => {
  const positionCounts = [8, 24, 20, 16];
  let playerId = 0;

  return positionCounts.flatMap((count, positionIndex) =>
    Array.from({ length: count }, (_, positionPlayerIndex) => {
      playerId += 1;
      const code = curatedPlayerCodesByPosition.get(positionIndex + 1)
        ?.[positionPlayerIndex] ?? (100000 + playerId);

      return {
        id: playerId,
        code,
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
        team: curatedPlayerTeamsByCode.get(code) ?? (((playerId - 1) % 20) + 1),
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
