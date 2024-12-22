const useDialog = () => {
  const dialogVisible = ref(false);

  const toggleDialog = (showDialog: boolean) => {
    if (showDialog) {
      dialogVisible.value = true;
    }
    else {
      dialogVisible.value = false;
    }
  };

  return { toggleDialog, dialogVisible };
};

export { useDialog };
