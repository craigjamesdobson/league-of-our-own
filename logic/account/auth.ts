import { useAccountStore } from '@/stores/account';

const monitorUserStatus = () => {
  const accountStore = useAccountStore();
  const userData = computed(() => accountStore.getUserData);
  const router = useRouter();

  watch(userData, (value) => {
    if (value.isSignedIn) {
      router.push('/account');
    } else {
      router.push('/account/login');
    }
  });
};

export { monitorUserStatus };
