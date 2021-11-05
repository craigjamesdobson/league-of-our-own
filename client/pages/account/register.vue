<template>
  <div
    class="
      flex
      items-center
      justify-center
      bg-gray-50
      py-12
      px-4
      sm:px-6
      lg:px-8
    "
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <img
          class="mx-auto h-12 w-auto"
          src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
          alt="Workflow"
        />
        <h2 class="my-4 text-center text-3xl font-extrabold text-gray-900">
          Register an account
        </h2>
        <div
          v-if="errMsg"
          class="
            flex
            items-center
            p-3
            mb-4
            bg-red-200
            rounded-b-sm
            border-t-2
            shadow-sm
            border-red-700
            text-red-700 text-sm
          "
        >
          <span
            class="
              flex
              items-center
              justify-center
              bg-red-300
              w-5
              h-5
              mr-4
              rounded-full
            "
          >
            <svg
              aria-hidden="true"
              focusable="false"
              data-prefix="fa"
              data-icon="info"
              role="img"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 192 512"
              class="fa-xs text-red-800 svg-inline--fa fa-info fa-w-6"
            >
              <path
                fill="currentColor"
                d="M20 424.229h20V279.771H20c-11.046 0-20-8.954-20-20V212c0-11.046 8.954-20 20-20h112c11.046 0 20 8.954 20 20v212.229h20c11.046 0 20 8.954 20 20V492c0 11.046-8.954 20-20 20H20c-11.046 0-20-8.954-20-20v-47.771c0-11.046 8.954-20 20-20zM96 0C56.235 0 24 32.235 24 72s32.235 72 72 72 72-32.235 72-72S135.764 0 96 0z"
                class=""
              ></path>
            </svg>
          </span>
          {{ errMsg }}
        </div>
      </div>
      <ValidationObserver v-slot="{ handleSubmit }">
        <form @submit.prevent="handleSubmit(registerHandler)">
          <div class="rounded-md">
            <div class="mb-4">
              <label for="full-name" class="sr-only">Full Name</label>
              <ValidationProvider
                v-slot="{ errors, classes, valid }"
                name="name"
                tag="div"
                class="flex flex-col"
                rules="required|alpha_spaces"
              >
                <div class="form-container" :class="classes">
                  <input
                    id="full-name"
                    v-model="loginData.name"
                    type="name"
                    autocomplete="name"
                    :class="classes"
                    class="
                      appearance-none
                      relative
                      block
                      w-full
                      px-3
                      py-2
                      border border-gray-300
                      placeholder-gray-500
                      text-gray-900
                      rounded
                      focus:outline-none focus:z-10
                      sm:text-sm
                    "
                    placeholder="Full name"
                  />
                  <font-awesome-icon
                    v-if="valid"
                    :icon="['fa', 'check-circle']"
                  />
                  <font-awesome-icon
                    v-if="errors[0]"
                    :icon="['fa', 'exclamation-circle']"
                  />
                </div>
                <span v-if="errors[0]" class="error-message">
                  {{ errors[0] }}
                </span>
              </ValidationProvider>
            </div>
            <div class="mb-4">
              <label for="email-address" class="sr-only">Email address</label>
              <ValidationProvider
                v-slot="{ errors, classes, valid }"
                name="email"
                rules="required|email"
              >
                <div class="form-container" :class="classes">
                  <input
                    id="email-address"
                    v-model="loginData.email"
                    type="email"
                    :class="classes"
                    autocomplete="email"
                    class="
                      appearance-none
                      relative
                      block
                      w-full
                      px-3
                      py-2
                      border border-gray-300
                      placeholder-gray-500
                      text-gray-900
                      rounded
                      focus:outline-none focus:z-10
                      sm:text-sm
                    "
                    placeholder="Email address"
                  />
                  <font-awesome-icon
                    v-if="valid"
                    :icon="['fa', 'check-circle']"
                  />
                  <font-awesome-icon
                    v-if="errors[0]"
                    :icon="['fa', 'exclamation-circle']"
                  />
                </div>
                <span v-if="errors[0]" class="error-message">
                  {{ errors[0] }}
                </span>
              </ValidationProvider>
            </div>
            <div class="mb-4">
              <label for="password" class="sr-only">Password</label>
              <ValidationProvider
                v-slot="{ errors, classes, valid }"
                rules="required|password:@confirm|min:8|password_strength"
              >
                <div class="form-container" :class="classes">
                  <input
                    id="password"
                    v-model="loginData.password"
                    type="password"
                    autocomplete="new-password"
                    :class="classes"
                    class="
                      appearance-none
                      relative
                      block
                      w-full
                      px-3
                      py-2
                      border border-gray-300
                      placeholder-gray-500
                      text-gray-900
                      rounded
                      focus:outline-none focus:z-10
                      sm:text-sm
                    "
                    placeholder="Password"
                  />
                  <font-awesome-icon
                    v-if="valid"
                    :icon="['fa', 'check-circle']"
                  />
                  <font-awesome-icon
                    v-if="errors[0]"
                    :icon="['fa', 'exclamation-circle']"
                  />
                </div>
                <span v-if="errors[0]" class="error-message">
                  {{ errors[0] }}
                </span>
              </ValidationProvider>
            </div>
            <div class="mb-4">
              <label for="password-confirm" class="sr-only">
                Password Confirmation
              </label>
              <ValidationProvider
                v-slot="{ errors, classes, valid }"
                name="confirm"
                rules="required|min:8|password_strength"
              >
                <div class="form-container" :class="classes">
                  <input
                    id="confirm"
                    v-model="loginData.passwordConfirmation"
                    type="password"
                    :class="classes"
                    class="
                      appearance-none
                      relative
                      block
                      w-full
                      px-3
                      py-2
                      border border-gray-300
                      placeholder-gray-500
                      text-gray-900
                      rounded
                      focus:outline-none focus:z-10
                      sm:text-sm
                    "
                    placeholder="Password Confirmation"
                  />
                  <font-awesome-icon
                    v-if="valid"
                    :icon="['fa', 'check-circle']"
                  />
                  <font-awesome-icon
                    v-if="errors[0]"
                    :icon="['fa', 'exclamation-circle']"
                  />
                </div>
                <span v-if="errors[0]" class="error-message">
                  {{ errors[0] }}
                </span>
              </ValidationProvider>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="
                group
                relative
                w-full
                flex
                justify-center
                py-2
                px-4
                border border-transparent
                text-sm
                font-medium
                rounded-md
                text-white
                bg-primary
                hover:bg-indigo-800
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                focus:ring-indigo-500
              "
            >
              Register
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
    ValidationObserver
  },
  setup() {
    const { store } = useContext()
    const errMsg = ref('')
    const loginData = reactive({
      name: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      role: 'admin'
    })

    const registerHandler = async () => {
      try {
        await store.dispatch('registerUser', loginData)
      } catch (err) {
        errMsg.value = err.message
      }
    }
    return { loginData, registerHandler, errMsg }
  }
}
</script>

<style lang="scss">
.form-container {
  @apply relative mb-1;

  svg {
    @apply flex items-center absolute h-full top-0;
    bottom: 5px;
    right: 15px;
  }

  &.invalid {
    input {
      @apply border-red-600 bg-red-100;
    }

    svg {
      @apply text-red-600;
    }
  }

  &.valid {
    input {
      @apply border-green-600 bg-green-100;
    }

    svg {
      @apply text-green-600;
    }
  }
}
.error-message {
  @apply text-xs text-red-600;
}
</style>
