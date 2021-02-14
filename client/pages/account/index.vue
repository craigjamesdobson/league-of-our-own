<template>
  <div>
    <h1>Hello {{ userData.name }}</h1>
  </div>
</template>

<script>
import { useContext, computed } from '@nuxtjs/composition-api'

export default {
  middleware: 'auth',

  setup() {
    const { store } = useContext()
    const userData = computed(() => store.getters.getUser)

    return { userData }
  },
}
</script>
