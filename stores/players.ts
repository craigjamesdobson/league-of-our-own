import { defineStore } from 'pinia';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Database, Tables } from '~/types/database.types';
interface FilterData {
  filterName: string;
  filterPrice: number;
  filterTeam: number | undefined;
}

type Players = Tables<'players_view'>;

export const usePlayerStore = defineStore('player-store', () => {
  const supabase = useSupabaseClient<Database>();

  const players: Ref<Players[] | []> = ref([]);
  const filteredPlayers: Ref<Players[] | []> = ref([]);
  const isLoaded = ref(false);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase.from('players_view').select(`*`);

      if (error) {
        console.error('Error fetching data:', error.message);
        return;
      }
      players.value = data;
      filteredPlayers.value = players.value;
      isLoaded.value = true;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error('Error:', (error as Error).message);
      } else {
        console.error('An unknown error occurred.');
      }
    }
  };

  const filterPlayers = ({
    filterName = '',
    filterPrice = 0,
    filterTeam = 0,
  }: FilterData) => {
    let newFilteredPlayers = [...players.value];
    if (filterName) {
      newFilteredPlayers = newFilteredPlayers.filter((player) =>
        (player.web_name ?? '')
          .normalize('NFD')
          .replace(/[\u0300-\u036F]/g, '')
          .toLowerCase()
          .includes(filterName.toLowerCase())
      );
    }

    if (filterPrice) {
      newFilteredPlayers = newFilteredPlayers.filter(
        (player) => player.cost === +filterPrice
      );
    }

    if (filterTeam) {
      newFilteredPlayers = newFilteredPlayers.filter(
        (p) => p.team === filterTeam
      );
    }

    filteredPlayers.value = newFilteredPlayers;
  };

  const getPlayerByID = computed(
    () => (id: number) => players.value.find((x) => x.player_id === id)
  );

  const formatFilteredPlayersByPosition = computed(() => {
    return [
      {
        position: 'Goalkeepers',
        players: filteredPlayers.value
          .filter((x) => x.position === PlayerPosition.GOALKEEPER)
          .sort((a, b) => a.team - b.team),
      },
      {
        position: 'Defenders',
        players: filteredPlayers.value
          .filter((x) => x.position === PlayerPosition.DEFENDER)
          .sort((a, b) => a.team - b.team),
      },
      {
        position: 'Midfielders',
        players: filteredPlayers.value
          .filter((x) => x.position === PlayerPosition.MIDFIELDER)
          .sort((a, b) => a.team - b.team),
      },
      {
        position: 'Forwards',
        players: filteredPlayers.value
          .filter((x) => x.position === PlayerPosition.FORWARD)
          .sort((a, b) => a.team - b.team),
      },
    ];
  });

  return {
    players,
    filteredPlayers,
    isLoaded,
    fetchPlayers,
    filterPlayers,
    getPlayerByID,
    formatFilteredPlayersByPosition,
  };
});
