<template>
  <div class="flex justify-between">
    <h1>Hello {{ userData.name }}</h1>
    <button class="p-2 border border-primary" @click="logoutHandler">
      Log out
    </button>
  </div>
</template>

<script>
import { useContext, computed } from '@nuxtjs/composition-api'

export default {
  middleware: 'auth',

  setup() {
    const { store } = useContext()
    const userData = computed(() => store.getters.getUser)

    const logoutHandler = () => {
      store.dispatch('logoutUser')
    }

    return { userData, logoutHandler }
  }
}
</script>
