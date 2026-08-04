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
  teamSubmissionDeadline: string;
}

export const TEAM_SUBMISSION_TIME_ZONE = 'Europe/London';

export const APP_SETTING_KEYS = [
  'active_season',
  'current_gameweek',
  'season_complete',
  'site_open',
  'league_data_public',
  'team_registration_open',
  'team_submission_deadline',
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

const parseTeamSubmissionDeadline = (value: string): string => {
  const parts = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const date = parts
    ? new Date(Date.UTC(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3])))
    : null;

  if (!date
    || date.getUTCFullYear() !== Number(parts![1])
    || date.getUTCMonth() !== Number(parts![2]) - 1
    || date.getUTCDate() !== Number(parts![3])) {
    throw new Error('Setting team_submission_deadline must use the YYYY-MM-DD format');
  }

  return value;
};

const formatDateInTimeZone = (date: Date, timeZone: string): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = new Map(parts.map(part => [part.type, part.value]));

  return `${values.get('year')}-${values.get('month')}-${values.get('day')}`;
};

/**
 * Treats the configured date as the final day on which teams may be submitted
 * in the league's timezone. Submissions close at 00:00 on the following UK
 * calendar day, so the deadline remains open through 23:59:59 UK time.
 */
export const isTeamSubmissionDeadlinePassed = (
  deadline: string,
  now: Date = new Date(),
): boolean => formatDateInTimeZone(now, TEAM_SUBMISSION_TIME_ZONE) > deadline;

export const isTeamRegistrationOpen = (
  settings: Pick<AppSettings, 'teamRegistrationOpen' | 'teamSubmissionDeadline'>,
  now: Date = new Date(),
): boolean => settings.teamRegistrationOpen
  && !isTeamSubmissionDeadlinePassed(settings.teamSubmissionDeadline, now);

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
    teamSubmissionDeadline: parseTeamSubmissionDeadline(
      requireSetting(values, 'team_submission_deadline'),
    ),
  };
};
