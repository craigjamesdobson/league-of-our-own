const useModal = () => {
  const modalVisible = ref(false);

  const toggleModal = (showModal: boolean) => {
    if (showModal) {
      modalVisible.value = true;
      document.body.classList.add('overflow-hidden');
    } else {
      modalVisible.value = false;
      document.body.classList.remove('overflow-hidden');
    }
    document.body.classList.toggle('overflow-hidden', modalVisible.value);
  };

  return { toggleModal, modalVisible };
};

export { useModal };
