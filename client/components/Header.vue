<template>
  <div class="sticky top-0 z-50 w-full p-4 bg-white border-b-2 border-gray-300">
    <div>
      <h1 class="text-2xl uppercase tracking-wide">{{ pageTitle }}</h1>
    </div>
  </div>
</template>

<script>
import { useContext } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { store } = useContext()
    const pageTitle = computed(() => store.getters.getPageTitle)

    return { pageTitle }
  },
}
</script>
