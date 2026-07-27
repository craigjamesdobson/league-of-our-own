export const createMockFplTeams = () =>
  Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `Club ${index + 1}`,
    short_name: `C${String(index + 1).padStart(2, '0')}`,
    code: 100 + index,
    strength: index + 1,
  }));
