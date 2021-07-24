<template>
  <div class="flex flex-row">
    <Sidebar></Sidebar>
    <main
      class="flex flex-row w-full transition duration-500 ease-in-out  bg-offWhite dark:bg-gray-700"
    >
      <div class="flex flex-col w-full">
        <div
          class="sticky top-0 z-50 w-full p-4 mb-2 bg-white border-b-2 border-gray-300 "
        >
          <h1 class="text-2xl">Players</h1>
        </div>
        <Nuxt class="flex mx-10 my-2" keep-alive />
      </div>
    </main>
    <portal-target name="modals"></portal-target>
  </div>
</template>

<script>
import { useContext, computed } from '@nuxtjs/composition-api'
import Sidebar from '@/components/Sidebar'

export default {
  components: {
    Sidebar,
  },
  setup() {
    const { store } = useContext()
    const isLoggedIn = computed(() => store.getters.isLoggedIn)

    if (isLoggedIn.value) {
      store.dispatch('fetchUser')
    }

    store.dispatch('fetchPlayers')
    // store.dispatch('fetchDraftedTeams')
  },
}
</script>

<style>
html {
  color: #333;
}

.button--green {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #3b8070;
  color: #3b8070;
  text-decoration: none;
  padding: 10px 30px;
}

.button--green:hover {
  color: #fff;
  background-color: #3b8070;
}

.button--grey {
  display: inline-block;
  border-radius: 4px;
  border: 1px solid #35495e;
  color: #35495e;
  text-decoration: none;
  padding: 10px 30px;
  margin-left: 15px;
}

.button--grey:hover {
  color: #fff;
  background-color: #35495e;
}
</style>
