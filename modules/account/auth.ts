import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useAccountStore } from '~~/stores/account';

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

  const auth = getAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log(user);
      // ...
    } else {
      // User is signed out
      // ...
    }
  });
};

export { monitorUserStatus };
