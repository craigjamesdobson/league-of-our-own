import { defineStore } from 'pinia';
import { PlayerPosition } from '~/types/PlayerPosition';
import type { Database, Views } from '~/types/database.types';
interface FilterData {
  filterName: string;
  filterPrice: number;
  filterTeam: number | undefined;
}

type Players = Views<'players_view'>;

export const usePlayerStore = defineStore('player-store', () => {
  const supabase = useSupabaseClient<Database>();

  const players: Ref<Players[] | []> = ref([]);
  const filteredPlayers: Ref<Players[] | []> = ref([]);
  const playerUpdatedDate: Ref<string | null> = ref(null);
  const isLoaded = ref(false);

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players_view')
        .select(`*`)
        .order('minutes', { ascending: false });

      if (error) {
        console.error('Error fetching data:', error.message);
        return;
      }
      players.value = data;
      filteredPlayers.value = players.value;
      await fetchPlayerUpdatedDate();
      isLoaded.value = true;
    } catch (error) {
      if (typeof error === 'object' && error !== null && 'message' in error) {
        console.error('Error:', (error as Error).message);
      } else {
        console.error('An unknown error occurred.');
      }
    }
  };

  const fetchPlayerUpdatedDate = async () => {
    const { data, error } = await supabase
      .from('players')
      .select('updated_at')
      .limit(1)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    playerUpdatedDate.value = data.updated_at;
  };

  const upsertPlayerData = async (playerData: string) => {
    const formattedPlayerData = JSON.parse(playerData)?.elements;
    if (formattedPlayerData === null) {
      throw new Error('Player data was not correct, please try again.');
    }

    const { error } = await supabase
      .from('players')
      .upsert(
        formattedPlayerData.map(
          ({ id, ...rest }: { id: number; [key: string]: any }) => ({
            player_id: id,
            ...rest,
          })
        )
      )
      .select();

    if (error) {
      throw new Error(error.message);
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

  const getPlayerLastUpdatedDate = computed(() => playerUpdatedDate.value);

  const getPlayerByID = computed(
    () => (id: number) => players.value.find((x) => x.player_id === id)
  );

  const getPlayers = computed(() => players.value);

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
    upsertPlayerData,
    filterPlayers,
    getPlayers,
    getPlayerByID,
    getPlayerLastUpdatedDate,
    formatFilteredPlayersByPosition,
  };
});
