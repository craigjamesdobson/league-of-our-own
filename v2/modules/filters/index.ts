import { usePlayersStore } from '@/stores/players';

const useFilters = () => {
  const playerStore = usePlayersStore();

  const filterData = reactive({
    filterName: '',
    filterPrice: '',
    filterTeam: null,
  });

  const setFilteredPlayers = () => {
    playerStore.getFilteredPlayers(filterData);
  };

  const selectfilteredTeam = (event) => {
    document
      .querySelectorAll('.icon-container')
      .forEach((e) => e.classList.remove('active'));
    event.currentTarget.classList.add('active');
    filterData.filterTeam = +event.currentTarget.dataset.teamid;
    setFilteredPlayers();
  };

  return { filterData, playerStore, selectfilteredTeam, setFilteredPlayers };
};

export { useFilters };
