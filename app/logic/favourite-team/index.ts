type TeamWithId = { drafted_team_id: number };

export const sortTeamsWithFavourite = <Team extends TeamWithId>(
  teams: Team[],
  favouriteTeamId: number | null,
): Team[] => {
  if (favouriteTeamId === null) {
    return teams;
  }

  const favouriteTeam = teams.find(team => team.drafted_team_id === favouriteTeamId);

  if (!favouriteTeam) {
    return teams;
  }

  return [
    favouriteTeam,
    ...teams.filter(team => team.drafted_team_id !== favouriteTeamId),
  ];
};
