import { usePlayersStore } from '@/stores/players';

const usePlayerModal = () => {
  const playerStore = usePlayersStore();
  const selectedPlayer = computed(() => playerStore.getSelectedPlayer);
  const router = useRouter();
  const route = useRoute();
  const modalVisible = ref(false);

  const toggleModal = (showModal: boolean, playerID?: number) => {
    if (showModal && playerID) {
      router.push({ path: 'players', query: { id: playerID } });
      playerStore.setSelectedPlayer(playerID);
      modalVisible.value = true;
      document.body.classList.add('overflow-hidden');
    } else {
      modalVisible.value = false;
      router.push({ path: 'players' });
    }
  };

  if (route.query.id) {
    playerStore.setSelectedPlayer(+route.query.id);
    modalVisible.value = true;
  }

  watch(selectedPlayer, () => {
    modalVisible.value = true;
  });

  return { selectedPlayer, toggleModal, modalVisible };
};

export { usePlayerModal };
