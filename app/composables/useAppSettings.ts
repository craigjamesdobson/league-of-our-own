import type { Database } from '@/types/database.types';
import {
  APP_SETTING_KEYS,
  parseAppSettings,
  type AppSettings,
} from '../../shared/utils/appSettings';

export function useAppSettings() {
  const supabase = useSupabaseClient<Database>();
  const settings = useState<AppSettings | null>('app-settings', () => null);

  const refreshAppSettings = async (): Promise<AppSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('setting_key, setting_value')
      .in('setting_key', APP_SETTING_KEYS);

    if (error) {
      settings.value = null;
      throw createError({
        statusCode: 500,
        statusMessage: 'Database Configuration Required',
        data: {
          message: 'Application settings could not be loaded.',
          type: 'database_error',
          details: error.message,
        },
      });
    }

    try {
      settings.value = parseAppSettings(data ?? []);
      return settings.value;
    }
    catch (error) {
      settings.value = null;
      throw createError({
        statusCode: 500,
        statusMessage: 'Invalid Configuration',
        data: {
          message: error instanceof Error
            ? error.message
            : 'Application settings are invalid.',
          type: 'configuration_error',
        },
      });
    }
  };

  const getCurrentGameweek = async (): Promise<number> =>
    (await refreshAppSettings()).currentGameweek;

  const getSeasonComplete = async (): Promise<boolean> =>
    (await refreshAppSettings()).seasonComplete;

  const getActiveSeason = async (): Promise<string> =>
    (await refreshAppSettings()).activeSeason;

  const updateCurrentGameweek = async (gameweek: number): Promise<void> => {
    if (!Number.isInteger(gameweek) || gameweek < 1 || gameweek > 38) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid Configuration',
        data: {
          message: 'Current gameweek must be an integer from 1 to 38.',
          type: 'validation_error',
          invalidValue: gameweek,
        },
      });
    }

    const user = useSupabaseUser();
    const { error } = await supabase
      .from('settings')
      .update({
        setting_value: gameweek.toString(),
        updated_at: new Date().toISOString(),
        updated_by: user.value?.id,
      })
      .eq('setting_key', 'current_gameweek');

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Update Failed',
        data: {
          message: 'Failed to update gameweek setting. Please try again.',
          type: 'update_error',
          details: error.message,
        },
      });
    }

    await refreshAppSettings();
  };

  return {
    settings: readonly(settings),
    activeSeason: computed(() => settings.value?.activeSeason ?? ''),
    siteOpen: computed(() => settings.value?.siteOpen ?? false),
    leagueDataPublic: computed(
      () => settings.value?.leagueDataPublic ?? false,
    ),
    teamRegistrationOpen: computed(
      () => settings.value?.teamRegistrationOpen ?? false,
    ),
    teamSubmissionDeadline: computed(
      () => settings.value?.teamSubmissionDeadline ?? '',
    ),
    refreshAppSettings,
    getActiveSeason,
    getCurrentGameweek,
    getSeasonComplete,
    updateCurrentGameweek,
  };
}
