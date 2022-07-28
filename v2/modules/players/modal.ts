import { usePlayersStore } from '@/stores/players';

const usePlayerModal = () => {
  const playerStore = usePlayersStore();
  const selectedPlayer = computed(() => playerStore.getSelectedPlayer);
  const router = useRouter();
  const modalVisible = ref(false);

  const toggleModal = (showModal: boolean, playerID?: number) => {
    if (showModal && playerID) {
      router.push({ path: 'players', query: { id: playerID } });
      playerStore.setSelectedPlayer(playerID);
      modalVisible.value = true;
    } else {
      modalVisible.value = false;
      router.push({ path: 'players' });
    }
  };

  watch(selectedPlayer, () => {
    modalVisible.value = true;
  });

  return { selectedPlayer, toggleModal, modalVisible };
};

export { usePlayerModal };
