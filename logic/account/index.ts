import { useVuelidate } from '@vuelidate/core';
import { required, email, minLength, helpers } from '@vuelidate/validators';
import { useAccountStore } from '@/stores/account';

const useAccount = () => {
  const accountStore = useAccountStore();

  const formData = reactive({
    email: '',
    password: ''
  });

  const rules = computed(() => {
    return {
      email: {
        required: helpers.withMessage('The email field is required', required),
        email: helpers.withMessage('Invalid email format', email)
      },
      password: {
        required: helpers.withMessage(
          'The password field is required',
          required
        ),
        minLength: minLength(6)
      }
    };
  });

  const v$ = useVuelidate(rules, formData);

  return {
    v$,
    formData,
    accountStore
  };
};

export { useAccount };
