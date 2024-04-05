import { defineStore } from 'pinia';
import { usePlayerStore } from './players';
import type { Fixture } from '~/types/Fixture';
import type { Player, PlayerWithStats } from '~/types/Player';
import {
  type Database,
  type Tables,
  type TablesInsert
} from '~/types/database.types';

const getPlayersWithStats = (players: PlayerWithStats[]) => {
  return players!.filter((player) => {
    return (
      player.week_assists > 0 ||
      player.week_goals > 0 ||
      player.week_redcard ||
      player.week_cleansheet
    );
  });
};

const populatePlayersWithStats = (
  players: Player[],
  PlayerStats: Tables<'player_statistics'>[],
  teamID: number
): PlayerWithStats[] => {
  const filteredPlayers = players.filter((x) => x.team === teamID);

  const weekDataMap = new Map<number, (typeof PlayerStats)[number]>();
  PlayerStats.forEach((data: Tables<'player_statistics'>) =>
    weekDataMap.set(data.player_id!, data)
  );

  return filteredPlayers.map((player) => {
    const weekPlayerData = weekDataMap.get(player.player_id);
    if (weekPlayerData) {
      // Merge week data into player
      return {
        ...player,
        week_goals: weekPlayerData.goals || 0,
        week_assists: weekPlayerData.assists || 0,
        week_redcard: weekPlayerData.red_card || false,
        week_cleansheet: weekPlayerData.clean_sheet || false
      };
    } else {
      // Set default values for players without week data
      return {
        ...player,
        week_goals: 0,
        week_assists: 0,
        week_redcard: false,
        week_cleansheet: false
      };
    }
  });
};

export const useFixtureStore = defineStore('fixture-store', () => {
  const supabase = useSupabaseClient<Database>();
  const playerStore = usePlayerStore();

  const fixtures: Ref<Fixture[] | null> = ref(null);

  const fetchFixtures = async (gameweekID: number) => {
    fixtures.value = null;
    const { data } = await supabase
      .from('fixtures')
      .select(
        `
          id,
          home_team_score,
          away_team_score,
          home_team (id, name, short_name),
          away_team (id, name, short_name)
        `
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
          home_team (id, name, short_name),
          away_team (id, name, short_name)
        `
      )
      .eq('id', id)
      .returns<Fixture[]>()
      .single();
    return data;
  };

  const updateFixtureScore = async (fixtureData: Fixture) => {
    const formattedFixture: TablesInsert<'fixtures'> = {
      id: fixtureData.id,
      home_team_score: fixtureData.home_team_score,
      away_team_score: fixtureData.away_team_score
    };

    const selectedFixtureIndex = fixtures.value?.findIndex(
      (x) => x.id === fixtureData.id
    );

    if (selectedFixtureIndex === undefined || !fixtures.value)
      throw new Error('No fixture found');

    fixtures.value[selectedFixtureIndex] = fixtureData;

    const { error } = await supabase
      .from('fixtures')
      .upsert(formattedFixture)
      .select();

    if (error) throw new Error(error.message);
  };

  const fetchPlayersWithStatistics = async (
    fixtureID: number,
    teamID: number
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
    fixtureID: number
  ) => {
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
        red_card: x.week_redcard
      };
    });

    const { error } = await supabase
      .from('player_statistics')
      .insert(formattedPlayers)
      .select();

    if (error) throw new Error(error.message);
  };

  return {
    fixtures,
    fetchFixtures,
    fetchFixtureByID,
    fetchPlayersWithStatistics,
    updateFixtureScore,
    updatePlayerStatistics
  };
});
