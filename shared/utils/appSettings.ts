export interface AppSettingRow {
  setting_key: string;
  setting_value: string;
}

export interface AppSettings {
  activeSeason: string;
  currentGameweek: number;
  seasonComplete: boolean;
  siteOpen: boolean;
  leagueDataPublic: boolean;
  teamRegistrationOpen: boolean;
}

export const APP_SETTING_KEYS = [
  'active_season',
  'current_gameweek',
  'season_complete',
  'site_open',
  'league_data_public',
  'team_registration_open',
] as const;

const parseBooleanSetting = (key: string, value: string | undefined): boolean => {
  if (value === 'true') return true;
  if (value === 'false') return false;

  throw new Error(`Setting ${key} must be true or false`);
};

const requireSetting = (
  values: Map<string, string>,
  key: string,
): string => {
  const value = values.get(key);
  if (value === undefined) {
    throw new Error(`Required setting ${key} is missing`);
  }

  return value;
};

const parseActiveSeason = (value: string): string => {
  if (!/^\d{2}-\d{2}$/.test(value)) {
    throw new Error('Setting active_season must use the YY-YY format');
  }

  return value;
};

const parseCurrentGameweek = (value: string): number => {
  const gameweek = Number(value);
  if (!Number.isInteger(gameweek) || gameweek < 1 || gameweek > 38) {
    throw new Error('Setting current_gameweek must be an integer from 1 to 38');
  }

  return gameweek;
};

export const parseAppSettings = (rows: AppSettingRow[]): AppSettings => {
  const values = new Map(
    rows.map(row => [row.setting_key, row.setting_value]),
  );

  return {
    activeSeason: parseActiveSeason(requireSetting(values, 'active_season')),
    currentGameweek: parseCurrentGameweek(
      requireSetting(values, 'current_gameweek'),
    ),
    seasonComplete: parseBooleanSetting(
      'season_complete',
      values.get('season_complete'),
    ),
    siteOpen: parseBooleanSetting('site_open', values.get('site_open')),
    leagueDataPublic: parseBooleanSetting(
      'league_data_public',
      values.get('league_data_public'),
    ),
    teamRegistrationOpen: parseBooleanSetting(
      'team_registration_open',
      values.get('team_registration_open'),
    ),
  };
};
