import { usePlayersStore } from '@/stores/players';

const useFilters = () => {
  const playerStore = usePlayersStore();

  interface FilterData {
    filterName: string;
    filterPrice: string;
    filterTeam: number | undefined;
  }

  const filterData: FilterData = reactive({
    filterName: '',
    filterPrice: '',
    filterTeam: undefined,
  });

  const setFilteredPlayers = () => {
    playerStore.getFilteredPlayers(filterData);
  };

  const selectfilteredTeam = (event: Event) => {
    document
      .querySelectorAll('.icon-container')
      .forEach((e) => e.classList.remove('active'));

    if (!(event.currentTarget instanceof HTMLElement)) {
      return;
    }

    event.currentTarget.classList.add('active');

    if (!event.currentTarget.dataset.teamid) {
      return;
    }

    filterData.filterTeam = +event.currentTarget.dataset.teamid;
    setFilteredPlayers();
  };

  const resetFilteredTeams = () => {
    document
      .querySelectorAll('.icon-container')
      .forEach((e) => e.classList.remove('active'));

    filterData.filterTeam = undefined;
    setFilteredPlayers();
  };

  return {
    filterData,
    playerStore,
    selectfilteredTeam,
    resetFilteredTeams,
    setFilteredPlayers,
  };
};

export { useFilters };
