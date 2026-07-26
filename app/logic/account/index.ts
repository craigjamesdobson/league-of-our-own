import { useAccountStore } from '@/stores/account';

const useAccount = () => {
  const accountStore = useAccountStore();

  const formData = reactive({
    email: '',
    password: '',
  });

  return {
    formData,
    accountStore,
  };
};

export { useAccount };
