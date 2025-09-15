export function useAppSettings() {
  const supabase = useSupabaseClient();

  const getCurrentGameweek = async (): Promise<number> => {
    const { data, error } = await (supabase as any)
      .from('settings')
      .select('setting_value')
      .eq('setting_key', 'current_gameweek')
      .single();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Database Configuration Required',
        data: {
          message: 'Settings table not found. Please complete database setup.',
          type: 'database_error',
          details: error.message,
        },
      });
    }

    if (!data) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Settings Missing',
        data: {
          message: 'Current gameweek setting not found. Please configure in admin dashboard.',
          type: 'configuration_error',
        },
      });
    }

    const gameweek = parseInt(data.setting_value, 10);

    if (isNaN(gameweek) || gameweek < 1 || gameweek > 38) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Invalid Configuration',
        data: {
          message: 'Invalid gameweek value in database. Please check admin settings.',
          type: 'validation_error',
          invalidValue: data.setting_value,
        },
      });
    }

    return gameweek;
  };

  const updateCurrentGameweek = async (gameweek: number): Promise<void> => {
    const user = useSupabaseUser();

    const { error } = await (supabase as any)
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
  };

  return {
    getCurrentGameweek,
    updateCurrentGameweek,
  };
}
