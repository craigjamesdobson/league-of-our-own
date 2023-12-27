const useModal = () => {
  const modalVisible = ref(false);

  const toggleModal = (showModal: boolean) => {
    if (showModal) {
      modalVisible.value = true;
    } else {
      modalVisible.value = false;
    }
  };

  return { toggleModal, modalVisible };
};

export { useModal };
