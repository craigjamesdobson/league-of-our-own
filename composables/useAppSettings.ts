export function useAppSettings() {
  const supabase = useSupabaseClient();

  const getCurrentGameweek = async (): Promise<number> => {
    const { data, error } = await (supabase as any)
      .from('settings')
      .select('setting_value')
      .eq('setting_key', 'current_gameweek')
      .single();

    if (error) {
      throw new Error(`Failed to load current gameweek setting: ${error.message}`);
    }

    if (!data) {
      throw new Error('Current gameweek setting not found in database');
    }

    const gameweek = parseInt(data.setting_value, 10);

    if (isNaN(gameweek) || gameweek < 1 || gameweek > 38) {
      throw new Error(`Invalid gameweek value in database: ${data.setting_value}`);
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
      throw new Error(`Failed to update current gameweek setting: ${error.message}`);
    }
  };

  return {
    getCurrentGameweek,
    updateCurrentGameweek,
  };
}
