export const createMockFplFixtures = () => {
  const rotation = Array.from({ length: 20 }, (_, index) => index + 1);
  const firstHalf: Array<{
    id: number;
    event: number;
    team_h: number;
    team_a: number;
    team_h_score: null;
    team_a_score: null;
  }> = [];

  for (let round = 0; round < 19; round += 1) {
    for (let pairing = 0; pairing < 10; pairing += 1) {
      firstHalf.push({
        id: firstHalf.length + 1,
        event: round + 1,
        team_h: rotation[pairing]!,
        team_a: rotation[19 - pairing]!,
        team_h_score: null,
        team_a_score: null,
      });
    }

    rotation.splice(1, 0, rotation.pop()!);
  }

  const secondHalf = firstHalf.map(fixture => ({
    ...fixture,
    id: fixture.id + 190,
    event: fixture.event + 19,
    team_h: fixture.team_a,
    team_a: fixture.team_h,
  }));

  return [...firstHalf, ...secondHalf];
};
