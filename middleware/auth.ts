import { useAccountStore } from '../stores/account';

// middleware/auth.ts
export default defineNuxtRouteMiddleware(() => {
  const accountStore = useAccountStore();
  const userData = computed(() => accountStore.getUserData);
  // redirect the user to the login page
  if (!userData.value.isSignedIn) {
    return navigateTo({
      path: '/account/login',
    });
  }
});
