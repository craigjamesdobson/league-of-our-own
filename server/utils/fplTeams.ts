export interface TeamForSync {
  id: number;
  name: string;
  short_name: string;
}

export const prepareFplTeamsForSync = (
  payload: unknown,
): TeamForSync[] => {
  if (
    typeof payload !== 'object'
    || payload === null
    || !('teams' in payload)
    || !Array.isArray(payload.teams)
  ) {
    throw new Error('FPL bootstrap payload does not contain a teams array');
  }

  if (payload.teams.length !== 20) {
    throw new Error(
      `FPL bootstrap payload must contain exactly 20 clubs; received ${payload.teams.length}`,
    );
  }

  const teams = payload.teams.map((team, index): TeamForSync => {
    if (
      typeof team !== 'object'
      || team === null
      || !('id' in team)
      || !Number.isInteger(team.id)
      || (team.id as number) <= 0
    ) {
      throw new Error(`FPL club at index ${index} has an invalid id`);
    }

    if (
      !('name' in team)
      || typeof team.name !== 'string'
      || team.name.trim().length === 0
    ) {
      throw new Error(`FPL club at index ${index} has an invalid name`);
    }

    if (
      !('short_name' in team)
      || typeof team.short_name !== 'string'
      || team.short_name.trim().length === 0
    ) {
      throw new Error(`FPL club at index ${index} has an invalid short_name`);
    }

    return {
      id: team.id as number,
      name: team.name,
      short_name: team.short_name,
    };
  });

  const hasDuplicates = <T>(values: T[]) => new Set(values).size !== values.length;

  if (hasDuplicates(teams.map(team => team.id))) {
    throw new Error('FPL bootstrap payload contains duplicate club ids');
  }
  if (hasDuplicates(teams.map(team => team.name.trim().toLocaleLowerCase()))) {
    throw new Error('FPL bootstrap payload contains duplicate club names');
  }
  if (
    hasDuplicates(teams.map(team => team.short_name.trim().toLocaleLowerCase()))
  ) {
    throw new Error('FPL bootstrap payload contains duplicate club short names');
  }

  return teams;
};
