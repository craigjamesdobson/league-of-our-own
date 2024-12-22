import { defineStore } from 'pinia';
import type { Database } from '~/types/database.types';

export const useTableStore = defineStore('table-store', () => {
  const supabase = useSupabaseClient<Database>();

  const weeklyData = ref();
  const weeklyWinners = ref();

  const fetchWeeklyStats = async (week: number) => {
    const { data, error } = await supabase.rpc(
      'get_weekly_stats_for_gameweek',
      { target_week: week },
    );

    if (error) {
      throw new Error(error.message);
    }

    weeklyData.value = data;
  };

  const fetchWeeklyWinners = async () => {
    const { data, error } = await supabase.rpc('get_weekly_winners');

    if (error) {
      throw new Error(error.message);
    }

    weeklyWinners.value = data;
  };

  return { fetchWeeklyStats, weeklyData, weeklyWinners, fetchWeeklyWinners };
});
