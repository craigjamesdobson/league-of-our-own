import { defineStore } from 'pinia';
import { usePlayerStore } from './players';
import type { Fixture } from '~/types/Fixture';
import type { Player, PlayerWithStats } from '~/types/Player';
import type {
  Database,
  Tables,
  TablesInsert,
} from '~/types/database.types';

const route = useRoute();

const getPlayersWithStats = (players: PlayerWithStats[]) => {
  return players!.filter((player) => {
    return (
      player.week_assists > 0
      || player.week_goals > 0
      || player.week_redcard
      || player.week_cleansheet
    );
  });
};

const populatePlayersWithStats = (
  players: Player[],
  PlayerStats: Tables<'player_statistics'>[],
  teamID?: number,
): PlayerWithStats[] => {
  let filteredPlayers = players;

  if (teamID) {
    filteredPlayers = filteredPlayers.filter(x => x.team === teamID);
  }

  const weekDataMap = new Map<number, (typeof PlayerStats)[number]>();
  PlayerStats.forEach((data: Tables<'player_statistics'>) =>
    weekDataMap.set(data.player_id!, data),
  );

  return filteredPlayers.map((player) => {
    const weekPlayerData = weekDataMap.get(player.player_id);
    if (weekPlayerData) {
      return {
        ...player,
        week_goals: weekPlayerData.goals || 0,
        week_assists: weekPlayerData.assists || 0,
        week_redcard: weekPlayerData.red_card || false,
        week_cleansheet: weekPlayerData.clean_sheet || false,
        week_points: weekPlayerData.points || 0,
      };
    }
    else {
      return {
        ...player,
        week_goals: 0,
        week_assists: 0,
        week_redcard: false,
        week_cleansheet: false,
        week_points: 0,
      };
    }
  });
};

export const useFixtureStore = defineStore('fixture-store', () => {
  const supabase = useSupabaseClient<Database>();
  const playerStore = usePlayerStore();

  const fixtures: Ref<Fixture[] | null> = ref(null);
  const selectedGameweek = ref(+(route.query.week || 1));

  const fetchFixtures = async (gameweekID: number) => {
    fixtures.value = null;
    const { data } = await supabase
      .from('fixtures')
      .select(
        `
          id,
          game_week,
          home_team_score,
          away_team_score,
          verified_by,
          verified_at,
          populated_by,
          populated_at,
          home_team (id, name, short_name),
          away_team (id, name, short_name),
          verified_profile:profiles!verified_by(full_name),
          populated_profile:profiles!populated_by(full_name)
        `,
      )
      .eq('game_week', gameweekID)
      .order('id')
      .returns<Fixture[]>();
    fixtures.value = data;
  };

  const fetchFixtureByID = async (id: number) => {
    const { data } = await supabase
      .from('fixtures')
      .select(
        `
          id,
          game_week,
          home_team_score,
          away_team_score,
          verified_by,
          verified_at,
          populated_by,
          populated_at,
          home_team (id, name, short_name),
          away_team (id, name, short_name),
          verified_profile:profiles!verified_by(full_name),
          populated_profile:profiles!populated_by(full_name)
        `,
      )
      .eq('id', id)
      .returns<Fixture[]>()
      .single();
    return data;
  };

  const updateFixtureScore = async (fixtureData: Fixture) => {
    const user = useSupabaseUser();
    const currentTime = new Date().toISOString();

    const formattedFixture: TablesInsert<'fixtures'> = {
      id: fixtureData.id,
      home_team_score: fixtureData.home_team_score,
      away_team_score: fixtureData.away_team_score,
      populated_by: user.value?.id || null,
      populated_at: currentTime,
    };

    const selectedFixtureIndex = fixtures.value?.findIndex(
      x => x.id === fixtureData.id,
    );

    if (selectedFixtureIndex === undefined || !fixtures.value) throw new Error('No fixture found');

    // Update local fixture data with population info
    fixtures.value[selectedFixtureIndex] = {
      ...fixtureData,
      populated_by: user.value?.id || null,
      populated_at: currentTime,
    };

    const { error } = await supabase
      .from('fixtures')
      .upsert(formattedFixture)
      .select();

    if (error) throw new Error(error.message);
  };

  const fetchPlayersWithStatisticsByGameweek = async (gameweek: number) => {
    const { data, error } = await supabase
      .from('player_statistics')
      .select()
      .eq('fixture_id(game_week)', gameweek);

    if (error) throw new Error(error.message);

    return populatePlayersWithStats([...playerStore.players], data);
  };

  const fetchPlayersWithStatistics = async (
    fixtureID: number,
    teamID: number,
  ) => {
    const { data, error } = await supabase
      .from('player_statistics')
      .select()
      .eq('fixture_id', fixtureID);

    if (error) throw new Error(error.message);

    return populatePlayersWithStats([...playerStore.players], data, teamID);
  };

  const updatePlayerStatistics = async (
    PlayersWithStats: PlayerWithStats[],
    fixtureID: number,
  ) => {
    const user = useSupabaseUser();

    const { error: deleteError } = await supabase
      .from('player_statistics')
      .delete()
      .eq('fixture_id', fixtureID);

    if (deleteError) throw new Error(deleteError.message);

    const filteredPlayers = getPlayersWithStats(PlayersWithStats);

    const formattedPlayers = filteredPlayers.map((x) => {
      return {
        player_id: x.player_id,
        fixture_id: fixtureID,
        goals: x.week_goals,
        assists: x.week_assists,
        clean_sheet: x.week_cleansheet,
        red_card: x.week_redcard,
        points: x.week_points,
        author: user.value?.id || null,
      };
    });

    const { error } = await supabase
      .from('player_statistics')
      .insert(formattedPlayers)
      .select();

    if (error) throw new Error(error.message);
  };

  const getUserFullName = (profile: { full_name: string | null } | null | undefined) => {
    if (!profile?.full_name) return 'Unknown User';
    return profile.full_name;
  };

  const updateFixtureVerificationStatus = async (fixtureId: number, verified: boolean) => {
    const user = useSupabaseUser();
    const currentTime = new Date().toISOString();

    const updateData = verified
      ? {
          verified_by: user.value?.id || null,
          verified_at: currentTime,
        }
      : {
          verified_by: null,
          verified_at: null,
        };

    const { error } = await supabase
      .from('fixtures')
      .update(updateData)
      .eq('id', fixtureId);

    if (error) throw new Error(error.message);

    // Return the updated fixture with profile data
    return await fetchFixtureByID(fixtureId);
  };

  const checkWeekVerificationStatus = (gameweek: number) => {
    if (!fixtures.value) return false;

    const weekFixtures = fixtures.value.filter(f => f.game_week === gameweek);
    return weekFixtures.length > 0 && weekFixtures.every(f => f.verified_by && f.verified_at);
  };

  return {
    fixtures,
    selectedGameweek,
    fetchFixtures,
    fetchFixtureByID,
    fetchPlayersWithStatistics,
    fetchPlayersWithStatisticsByGameweek,
    updateFixtureScore,
    updatePlayerStatistics,
    updateFixtureVerificationStatus,
    getUserFullName,
    checkWeekVerificationStatus,
  };
});
