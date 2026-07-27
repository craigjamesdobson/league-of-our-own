// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { parseAppSettings } from '../../../shared/utils/appSettings';

describe('parseAppSettings', () => {
  it('returns typed application settings from database rows', () => {
    expect(parseAppSettings([
      { setting_key: 'active_season', setting_value: '26-27' },
      { setting_key: 'current_gameweek', setting_value: '1' },
      { setting_key: 'season_complete', setting_value: 'false' },
      { setting_key: 'site_open', setting_value: 'true' },
      { setting_key: 'team_registration_open', setting_value: 'false' },
    ])).toEqual({
      activeSeason: '26-27',
      currentGameweek: 1,
      seasonComplete: false,
      siteOpen: true,
      teamRegistrationOpen: false,
    });
  });

  it('rejects an invalid boolean instead of treating it as false', () => {
    expect(() => parseAppSettings([
      { setting_key: 'active_season', setting_value: '26-27' },
      { setting_key: 'current_gameweek', setting_value: '1' },
      { setting_key: 'season_complete', setting_value: 'false' },
      { setting_key: 'site_open', setting_value: 'yes' },
      { setting_key: 'team_registration_open', setting_value: 'true' },
    ])).toThrow('Setting site_open must be true or false');
  });

  it('rejects a missing required setting', () => {
    expect(() => parseAppSettings([
      { setting_key: 'current_gameweek', setting_value: '1' },
      { setting_key: 'season_complete', setting_value: 'false' },
      { setting_key: 'site_open', setting_value: 'false' },
      { setting_key: 'team_registration_open', setting_value: 'false' },
    ])).toThrow('Required setting active_season is missing');
  });

  it('rejects invalid Active Season and gameweek values', () => {
    const rows = [
      { setting_key: 'active_season', setting_value: '2026/27' },
      { setting_key: 'current_gameweek', setting_value: '39' },
      { setting_key: 'season_complete', setting_value: 'false' },
      { setting_key: 'site_open', setting_value: 'false' },
      { setting_key: 'team_registration_open', setting_value: 'false' },
    ];

    expect(() => parseAppSettings(rows))
      .toThrow('Setting active_season must use the YY-YY format');

    rows[0]!.setting_value = '26-27';
    expect(() => parseAppSettings(rows))
      .toThrow('Setting current_gameweek must be an integer from 1 to 38');
  });
});
