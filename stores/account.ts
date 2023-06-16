// stores/counter.js
import { defineStore } from 'pinia';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';
const notyf = new Notyf();

interface UserData {
  uid: string | null;
  email: string | null;
  isSignedIn: boolean;
}

interface State {
  userData: UserData;
}

export const useAccountStore = defineStore({
  id: 'account-store',
  state: (): State => {
    return {
      userData: {
        uid: null,
        email: null,
        isSignedIn: false,
      },
    };
  },

  actions: {
    setUserData() {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          this.userData = {
            uid: user.uid,
            email: user.email,
            isSignedIn: true,
          };
        }
      });
    },

    async signInUser(formData: { email: string; password: string }) {
      const auth = getAuth();
      try {
        const userCredentials = await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        this.userData = {
          uid: userCredentials.user.uid,
          email: userCredentials.user.email,
          isSignedIn: true,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Unknown error';
        notyf.error({
          message: errorMessage,
          position: { x: 'right', y: 'top' },
        });
        throw new Error(errorMessage);
      }
    },

    async signOutUser() {
      const auth = getAuth();
      try {
        await signOut(auth);
        this.userData = {
          uid: null,
          email: null,
          isSignedIn: false,
        };
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Unknown error');
      }
    },

    async resetUserPassword(email: string) {
      const auth = getAuth();
      try {
        await sendPasswordResetEmail(auth, email);
        alert(`Password reset has been sent to ${email}`);
      } catch (err) {
        throw new Error(err instanceof Error ? err.message : 'Unknown error');
      }
    },
  },

  getters: {
    getUserData: (state) => state.userData,
  },
});
