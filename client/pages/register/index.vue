<template>
  <div
    class="flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <img
          class="mx-auto h-12 w-auto"
          src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
          alt="Workflow"
        />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <h3 v-if="errMsg">{{ errMsg }}</h3>
      </div>
      <!-- <ValidationObserver v-slot="{ invalid }">
        <ValidationProvider v-slot="{ errors }" rules="required|alpha">
          <input v-model="value" type="text" />
          <span>{{ errors[0] }}</span>
        </ValidationProvider>
      </ValidationObserver> -->
      <ValidationObserver v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(loginHandler)">
          <div class="rounded-md shadow-sm">
            <div class="mb-4">
              <!-- <label for="full-name" class="sr-only">Full Name</label> -->
              <ValidationProvider
                v-slot="{ errors, classes }"
                name="name"
                rules="required|alpha_spaces"
              >
                <input
                  id="full-name"
                  v-model="loginData.name"
                  name="name"
                  type="name"
                  autocomplete="name"
                  :class="classes"
                  class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full name"
                />
                <span v-show="errors[0]" class="error-message">
                  {{ errors[0] }}
                </span>
              </ValidationProvider>
            </div>
            <div class="mb-4">
              <label for="email-address" class="sr-only">Email address</label>
              <input
                id="email-address"
                v-model="loginData.email"
                name="email"
                type="email"
                autocomplete="email"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div class="mb-4">
              <label for="password" class="sr-only">Password</label>
              <input
                id="password"
                v-model="loginData.password"
                name="password"
                type="password"
                autocomplete="new-password"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            <div class="mb-4">
              <label for="password-confirm" class="sr-only"
                >Password Confirmation</label
              >
              <input
                id="password-confirm"
                v-model="loginData.passwordConfirmation"
                name="password-confirm"
                type="password"
                autocomplete="new-password"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password Confirmation"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Sign in
            </button>
          </div>
        </form>
      </ValidationObserver>
    </div>
  </div>
</template>

<script>
import { reactive, useContext, ref } from '@nuxtjs/composition-api'
import { ValidationProvider, ValidationObserver } from 'vee-validate'

export default {
  components: {
    ValidationProvider,
    ValidationObserver,
  },
  setup() {
    const { store } = useContext()
    const errMsg = ref('')
    const loginData = reactive({
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      role: 'admin',
    })

    const loginHandler = async () => {
      try {
        await store.dispatch('registerUser', loginData)
      } catch (err) {
        console.log(err)
        errMsg.value = err.message
      }
    }
    return { loginData, loginHandler, errMsg }
  },
}
</script>

<style lang="scss">
.invalid {
  @apply border-red-600 bg-red-100;
}

.error-message {
  @apply text-xs text-red-600;
}
</style>
