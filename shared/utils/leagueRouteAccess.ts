const registrationRestrictedRoutes = new Set(['/teams', '/table']);

export const canAccessLeagueRoute = (
  path: string,
  leagueDataPublic: boolean,
  isAdmin: boolean,
) => {
  const normalizedPath = path.length > 1 ? path.replace(/\/+$/, '') : path;

  return leagueDataPublic
    || isAdmin
    || !registrationRestrictedRoutes.has(normalizedPath);
};
