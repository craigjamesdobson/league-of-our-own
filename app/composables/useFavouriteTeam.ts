const favouriteTeamCookieName = 'league-of-our-own-favourite-team-id';
const favouriteTeamCookieMaxAge = 60 * 60 * 24 * 365;

export const useFavouriteTeam = () => {
  const favouriteTeamId = useCookie<number | null>(favouriteTeamCookieName, {
    default: () => null,
    maxAge: favouriteTeamCookieMaxAge,
    sameSite: 'lax',
  });

  const isFavouriteTeam = (teamId: number) => favouriteTeamId.value === teamId;

  const toggleFavouriteTeam = (teamId: number) => {
    favouriteTeamId.value = isFavouriteTeam(teamId) ? null : teamId;
  };

  return {
    favouriteTeamId,
    isFavouriteTeam,
    toggleFavouriteTeam,
  };
};
