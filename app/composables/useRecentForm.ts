import { computed, onScopeDispose, readonly, ref, watch, type Ref } from 'vue';
import { z } from 'zod';
import type { Database } from '~/types/database.types';
import { useAppSettings } from '~/composables/useAppSettings';
import { getRecentFormSummary, type FormFixture, type FormScore, type FormTeam } from '~/logic/recent-form';

const teamsSchema = z.array(z.object({
  drafted_team_id: z.number().int(),
  team_name: z.string(),
  team_owner: z.string(),
}));
const scoresSchema = z.array(z.object({
  team: z.number().int().nullable(),
  week: z.number().int().min(1).max(38),
  points: z.number().int(),
  goals: z.number().int().nullable(),
}));
const fixturesSchema = z.array(z.object({
  game_week: z.number().int().nullable(),
  verified_at: z.string().nullable(),
  verified_by: z.string().nullable(),
}));

export function useRecentForm(gameweek: Readonly<Ref<number | null>>) {
  const supabase = useSupabaseClient<Database>();
  const { activeSeason } = useAppSettings();
  const teams = ref<FormTeam[]>([]);
  const scores = ref<FormScore[]>([]);
  const fixtures = ref<FormFixture[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let requestId = 0;

  const fetchScores = async (season: string, week: number, offset = 0): Promise<FormScore[]> => {
    const { data, error } = await supabase.from('weekly_statistics')
      .select('team, week, points, goals, drafted_teams!inner(active_season)')
      .eq('drafted_teams.active_season', season).lte('week', week)
      .order('id').range(offset, offset + 999);
    if (error) throw new Error(error.message);
    const page = scoresSchema.parse(data ?? []);
    if (page.length < 1000) return page;
    return [...page, ...await fetchScores(season, week, offset + 1000)];
  };

  const load = async () => {
    const request = ++requestId;
    const week = gameweek.value;
    const season = activeSeason.value;
    teams.value = [];
    scores.value = [];
    fixtures.value = [];
    error.value = null;
    isLoading.value = false;
    if (week === null || !season) return;
    isLoading.value = true;

    try {
      const [teamResult, scoreResult, fixtureResult] = await Promise.all([
        supabase.from('drafted_teams').select('drafted_team_id, team_name, team_owner').eq('active_season', season),
        fetchScores(season, week),
        supabase.from('fixtures').select('game_week, verified_at, verified_by').lte('game_week', week),
      ]);
      if (request !== requestId) return;
      const queryError = teamResult.error ?? fixtureResult.error;
      if (queryError) throw new Error(queryError.message);
      const parsedTeams = teamsSchema.parse(teamResult.data ?? []);
      const parsedScores = scoreResult;
      const parsedFixtures = fixturesSchema.parse(fixtureResult.data ?? []);
      teams.value = parsedTeams;
      scores.value = parsedScores;
      fixtures.value = parsedFixtures;
    }
    catch {
      if (request === requestId) error.value = 'Recent form could not be loaded. Please try again.';
    }
    finally {
      if (request === requestId) isLoading.value = false;
    }
  };

  watch([gameweek, activeSeason], load, { immediate: true });
  onScopeDispose(() => {
    requestId += 1;
  });

  const summary = computed(() => getRecentFormSummary({
    teams: teams.value, scores: scores.value, fixtures: fixtures.value,
    currentGameweek: gameweek.value ?? 0, period: 5,
  }));

  return { summary, isLoading: readonly(isLoading), error: readonly(error), reload: load };
}
