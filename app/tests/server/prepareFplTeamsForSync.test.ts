import { describe, expect, it } from 'vitest';
import { prepareFplTeamsForSync } from '../../../server/utils/fplTeams';

const createFplTeams = () =>
  Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `Club ${index + 1}`,
    short_name: `C${String(index + 1).padStart(2, '0')}`,
    code: 100 + index,
    strength: index + 1,
  }));

describe('prepareFplTeamsForSync', () => {
  it('returns only the club fields stored by League of Our Own', () => {
    const teams = prepareFplTeamsForSync({ teams: createFplTeams() });

    expect(teams).toHaveLength(20);
    expect(teams[0]).toEqual({
      id: 1,
      name: 'Club 1',
      short_name: 'C01',
    });
    expect(Object.keys(teams[0]!)).toEqual(['id', 'name', 'short_name']);
  });

  it('rejects a payload that does not contain exactly 20 clubs', () => {
    const teams = createFplTeams().slice(0, 19);

    expect(() => prepareFplTeamsForSync({ teams })).toThrow(
      'FPL bootstrap payload must contain exactly 20 clubs; received 19',
    );
  });

  it('rejects duplicate club identifiers, names, and short names', () => {
    const duplicateId = createFplTeams();
    duplicateId[1]!.id = duplicateId[0]!.id;

    const duplicateName = createFplTeams();
    duplicateName[1]!.name = duplicateName[0]!.name;

    const duplicateShortName = createFplTeams();
    duplicateShortName[1]!.short_name = duplicateShortName[0]!.short_name;

    expect(() => prepareFplTeamsForSync({ teams: duplicateId })).toThrow(
      'FPL bootstrap payload contains duplicate club ids',
    );
    expect(() => prepareFplTeamsForSync({ teams: duplicateName })).toThrow(
      'FPL bootstrap payload contains duplicate club names',
    );
    expect(() => prepareFplTeamsForSync({ teams: duplicateShortName })).toThrow(
      'FPL bootstrap payload contains duplicate club short names',
    );
  });

  it('rejects a payload without a teams array', () => {
    expect(() => prepareFplTeamsForSync({})).toThrow(
      'FPL bootstrap payload does not contain a teams array',
    );
  });

  it('rejects malformed club fields', () => {
    const invalidId = createFplTeams();
    invalidId[0]!.id = 0;

    const blankName = createFplTeams();
    blankName[0]!.name = ' ';

    const blankShortName = createFplTeams();
    blankShortName[0]!.short_name = '';

    expect(() => prepareFplTeamsForSync({ teams: invalidId })).toThrow(
      'FPL club at index 0 has an invalid id',
    );
    expect(() => prepareFplTeamsForSync({ teams: blankName })).toThrow(
      'FPL club at index 0 has an invalid name',
    );
    expect(() => prepareFplTeamsForSync({ teams: blankShortName })).toThrow(
      'FPL club at index 0 has an invalid short_name',
    );
  });
});
