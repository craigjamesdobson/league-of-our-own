import type { User } from '@supabase/supabase-js';
import { defineStore } from 'pinia';
import type { Database } from '~/types/database.types';

export const useAccountStore = defineStore('account-store', () => {
  const supabase = useSupabaseClient<Database>();
  const userData = useSupabaseUser();

  const user: Ref<User | null> = ref(userData);

  const userIsLoggedIn = computed(() => user.value !== null);

  const setUserData = (userData: User | null) => {
    user.value = userData;
  };

  const signUserIn = async (credentials: {
    email: string;
    password: string;
  }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      throw new Error(error.message);
    }
    setUserData(data.user);
  };

  const signUserOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    setUserData(null);
  };

  return { user, userIsLoggedIn, setUserData, signUserIn, signUserOut };
});
