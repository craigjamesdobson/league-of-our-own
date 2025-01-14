import { defineStore } from 'pinia';
import type { Database } from '~/types/database.types';
import type { WeeklyData, WeeklyWinners } from '~/types/Table';

export const useTableStore = defineStore('table-store', () => {
  const supabase = useSupabaseClient<Database>();

  const weeklyData: Ref<WeeklyData[] | undefined> = ref();
  const weeklyWinners: Ref<WeeklyWinners[] | undefined> = ref();

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

    // @ts-expect-error - type returned from supabase is not correct
    weeklyWinners.value = data;
  };

  return { fetchWeeklyStats, weeklyData, weeklyWinners, fetchWeeklyWinners };
});
