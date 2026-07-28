import { describe, expect, it } from 'vitest';
import { canAccessLeagueRoute } from '../../../shared/utils/leagueRouteAccess';

describe('canAccessLeagueRoute', () => {
  it.each(['/teams', '/teams/', '/table', '/table/'])(
    'blocks public access to %s while league data is private',
    (path) => {
      expect(canAccessLeagueRoute(path, false, false)).toBe(false);
    },
  );

  it.each(['/teams', '/teams/', '/table', '/table/'])(
    'keeps %s available to authenticated admins while league data is private',
    (path) => {
      expect(canAccessLeagueRoute(path, false, true)).toBe(true);
    },
  );

  it.each(['/teams', '/table'])(
    'makes %s public after the league is revealed',
    (path) => {
      expect(canAccessLeagueRoute(path, true, false)).toBe(true);
    },
  );

  it('does not restrict other public routes while league data is private', () => {
    expect(canAccessLeagueRoute('/players', false, false)).toBe(true);
    expect(canAccessLeagueRoute('/team-builder', false, false)).toBe(true);
  });
});
