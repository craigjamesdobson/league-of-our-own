import { ref, readonly } from 'vue';
import { useTableStore } from '@/stores/table';
import type { WeeklyData } from '@/types/Table';
import type { Database } from '@/types/database.types';
import { PlayerPosition } from '@/types/PlayerPosition';

type LeagueAverages = {
  averagePoints: number;
  totalTeams: number;
  highestPoints: number;
  lowestPoints: number;
  weeksPlayed: number;
};

type TopPositionPlayer = {
  web_name: string;
  points: number;
  position: number;
  image?: string;
};

type TopPositionPlayers = {
  players: readonly TopPositionPlayer[];
  points: number;
};

type PositionMover = WeeklyData & {
  positionChange: number;
  currentPosition: number;
};

type PositionMovers = {
  biggestRisers: PositionMover[];
  biggestFallers: PositionMover[];
};

type WeeklyTransfer = {
  drafted_transfer_id: number;
  transfer_week: number;
  team_name: string;
  team_owner: string;
  player_out: string;
  player_out_image: string;
  player_out_team: string;
  player_out_team_short: string;
  player_out_cost: number;
  player_in: string;
  player_in_image: string;
  player_in_team: string;
  player_in_team_short: string;
  player_in_cost: number;
  player_in_position: string;
};

const getPositionName = (position: number): string => {
  switch (position) {
    case PlayerPosition.GOALKEEPER: return 'GK';
    case PlayerPosition.DEFENDER: return 'DEF';
    case PlayerPosition.MIDFIELDER: return 'MID';
    case PlayerPosition.FORWARD: return 'FWD';
    default: return 'UNK';
  }
};

export function useHomepageDashboard() {
  const tableStore = useTableStore();
  const supabase = useSupabaseClient<Database>();

  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const weeklyTransfers = ref<WeeklyTransfer[]>([]);
  const leagueAverages = ref<LeagueAverages>({
    averagePoints: 0,
    totalTeams: 0,
    highestPoints: 0,
    lowestPoints: 0,
    weeksPlayed: 0,
  });
  const topPositionPlayers = ref<{ [key: number]: TopPositionPlayers | null }>({
    [PlayerPosition.GOALKEEPER]: null,
    [PlayerPosition.DEFENDER]: null,
    [PlayerPosition.MIDFIELDER]: null,
    [PlayerPosition.FORWARD]: null,
  });

  // Manual gameweek control - update this value as needed
  // TODO: Later hook this up to database property editable in admin section
  const currentGameweek = ref<number>(4);

  const getCurrentGameweek = (): number => {
    return currentGameweek.value;
  };

  const hasResults = (): boolean => {
    // Check if we have weekly data with actual points
    const weeklyData = tableStore.weeklyData;
    return !!(weeklyData && weeklyData.length > 0 && weeklyData.some(team => team.week_points > 0));
  };

  const getLeagueAverages = async (): Promise<LeagueAverages> => {
    try {
      // Get all weekly statistics to find highest/lowest individual weekly scores
      const { data: allWeeklyStats, error } = await supabase
        .from('weekly_statistics')
        .select('points, week, team')
        .order('points', { ascending: false });

      if (error || !allWeeklyStats || allWeeklyStats.length === 0) {
        console.error('Error fetching weekly statistics for league averages:', error);
        return {
          averagePoints: 0,
          totalTeams: 0,
          highestPoints: 0,
          lowestPoints: 0,
          weeksPlayed: 0,
        };
      }

      // Calculate statistics from individual weekly performances
      const weeklyScores = allWeeklyStats.map(stat => stat.points);
      const totalSum = weeklyScores.reduce((sum, points) => sum + points, 0);
      const uniqueTeams = new Set(allWeeklyStats.map(stat => stat.team)).size;

      return {
        averagePoints: totalSum / weeklyScores.length,
        totalTeams: uniqueTeams,
        highestPoints: Math.max(...weeklyScores),
        lowestPoints: Math.min(...weeklyScores),
        weeksPlayed: currentGameweek.value,
      };
    }
    catch (err) {
      console.error('Error calculating league averages:', err);
      return {
        averagePoints: 0,
        totalTeams: 0,
        highestPoints: 0,
        lowestPoints: 0,
        weeksPlayed: 0,
      };
    }
  };

  const getPositionMovers = (weeklyData: WeeklyData[]): PositionMovers => {
    if (!weeklyData || weeklyData.length === 0) {
      return {
        biggestRisers: [],
        biggestFallers: [],
      };
    }

    // Sort by total_points to determine current league positions
    const sortedTeams = [...weeklyData].sort((a, b) => b.total_points - a.total_points);

    const teamsWithMovement: PositionMover[] = sortedTeams.map((team, index) => {
      const currentPosition = index + 1;
      const positionChange = team.prev_week_position - currentPosition;

      return {
        ...team,
        currentPosition,
        positionChange,
      };
    });

    // Filter for significant movers (more than 1 position change)
    const risers = teamsWithMovement
      .filter(team => team.positionChange > 1)
      .sort((a, b) => b.positionChange - a.positionChange)
      .slice(0, 3);

    const fallers = teamsWithMovement
      .filter(team => team.positionChange < -1)
      .sort((a, b) => a.positionChange - b.positionChange)
      .slice(0, 3);

    return {
      biggestRisers: risers,
      biggestFallers: fallers,
    };
  };

  const fetchTopPositionPlayers = async (): Promise<void> => {
    try {
      console.log('Fetching top position players overall');

      // Get top player for each position based on overall performance
      const positions = [PlayerPosition.GOALKEEPER, PlayerPosition.DEFENDER, PlayerPosition.MIDFIELDER, PlayerPosition.FORWARD];

      const results = await Promise.all(positions.map(async (position) => {
        // Get top performing player for this position overall by summing their points across all games
        const { data: topPlayerStats, error: statsError } = await supabase
          .from('player_statistics')
          .select(`
            player_id,
            points,
            players_view!inner(web_name, position, image)
          `)
          .eq('players_view.position', position);

        if (statsError || !topPlayerStats || topPlayerStats.length === 0) {
          console.error(`Error fetching top ${getPositionName(position)} players:`, statsError);
          return { position, player: null };
        }

        // Calculate total points for each player
        const playerTotals = topPlayerStats.reduce((acc, stat) => {
          const playerId = stat.player_id;
          if (!acc[playerId]) {
            acc[playerId] = {
              totalPoints: 0,
              web_name: stat.players_view.web_name,
              position: position,
              image: stat.players_view.image,
            };
          }
          acc[playerId].totalPoints += stat.points;
          return acc;
        }, {} as Record<number, { totalPoints: number; web_name: string; position: number; image?: string }>);

        // Find all players tied for the highest total points
        const sortedPlayers = Object.values(playerTotals)
          .sort((a, b) => b.totalPoints - a.totalPoints);

        if (sortedPlayers.length === 0) {
          console.error(`No players found for position ${getPositionName(position)}`);
          return { position, players: null };
        }

        const highestPoints = sortedPlayers[0].totalPoints;
        const topPlayers = sortedPlayers.filter(player => player.totalPoints === highestPoints);

        return {
          position,
          players: {
            players: topPlayers.map(player => ({
              web_name: player.web_name,
              points: player.totalPoints,
              position: position,
              image: player.image,
            })),
            points: highestPoints,
          },
        };
      }));

      // Update the ref with the results
      results.forEach(({ position, players }) => {
        topPositionPlayers.value[position] = players || null;
      });
    }
    catch (err) {
      console.error('Error fetching top position players:', err);
      // Reset to null on error
      Object.keys(topPositionPlayers.value).forEach((key) => {
        topPositionPlayers.value[parseInt(key)] = null;
      });
    }
  };

  const fetchWeeklyTransfers = async (week: number): Promise<void> => {
    try {
      console.log('Fetching transfers for week:', week);
      // Get transfers for the week
      const { data: transfers, error: transfersError } = await supabase
        .from('drafted_transfers')
        .select('drafted_transfer_id, transfer_week, drafted_player, player_id')
        .eq('transfer_week', week);

      if (transfersError) {
        console.error('Error fetching transfers:', transfersError);
        return;
      }

      if (!transfers || transfers.length === 0) {
        console.log('No transfers found for week:', week);
        weeklyTransfers.value = [];
        return;
      }

      console.log('Found transfers:', transfers);

      // Get all the data we need in separate queries
      const results = await Promise.all(transfers.map(async (transfer) => {
        // Get drafted player info and team
        const { data: draftedPlayer } = await supabase
          .from('drafted_players')
          .select(`
            drafted_player,
            drafted_teams(team_name, team_owner),
            players_view(web_name, image, team_short_name, cost)
          `)
          .eq('drafted_player_id', transfer.drafted_player)
          .single();

        // Get new player info
        const { data: newPlayer } = await supabase
          .from('players_view')
          .select('web_name, team_short_name, position, image, cost')
          .eq('player_id', transfer.player_id)
          .single();

        return {
          drafted_transfer_id: transfer.drafted_transfer_id,
          transfer_week: transfer.transfer_week || 0,
          team_name: draftedPlayer?.drafted_teams?.team_name || 'Unknown Team',
          team_owner: draftedPlayer?.drafted_teams?.team_owner || 'Unknown Owner',
          player_out: draftedPlayer?.players_view?.web_name || 'Unknown Player',
          player_out_image: draftedPlayer?.players_view?.image || '',
          player_out_team: draftedPlayer?.players_view?.team_short_name || 'Unknown',
          player_out_team_short: draftedPlayer?.players_view?.team_short_name || 'Unknown',
          player_out_cost: draftedPlayer?.players_view?.cost || 0,
          player_in: newPlayer?.web_name || 'Unknown Player',
          player_in_image: newPlayer?.image || '',
          player_in_team: newPlayer?.team_short_name || 'Unknown',
          player_in_team_short: newPlayer?.team_short_name || 'Unknown',
          player_in_cost: newPlayer?.cost || 0,
          player_in_position: getPositionName(newPlayer?.position || 0),
        };
      }));

      weeklyTransfers.value = results;
    }
    catch (err) {
      console.error('Error fetching weekly transfers:', err);
      weeklyTransfers.value = [];
    }
  };

  const loadDashboardData = async (): Promise<void> => {
    try {
      isLoading.value = true;
      error.value = null;

      // Use manual gameweek setting
      const currentWeek = currentGameweek.value;

      // Load data for the current week
      await Promise.all([
        tableStore.fetchWeeklyStats(currentWeek),
        tableStore.fetchWeeklyWinners(),
        fetchWeeklyTransfers(currentWeek),
        fetchTopPositionPlayers(),
      ]);

      // Load league averages from weekly statistics
      leagueAverages.value = await getLeagueAverages();
    }
    catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load dashboard data';
    }
    finally {
      isLoading.value = false;
    }
  };

  return {
    getCurrentGameweek,
    hasResults,
    getPositionMovers,
    loadDashboardData,
    weeklyTransfers: readonly(weeklyTransfers),
    topPositionPlayers: readonly(topPositionPlayers),
    leagueAverages: readonly(leagueAverages),
    isLoading: readonly(isLoading),
    error: readonly(error),
  };
}
