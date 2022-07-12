<template>
  <div class="flex flex-row">
    <Sidebar></Sidebar>
    <main
      class="
        flex flex-row
        w-full
        transition
        duration-500
        ease-in-out
        bg-offWhite
        dark:bg-gray-700
      "
    >
      <div class="flex flex-col w-full">
        <Header></Header>
        <NuxtPage class="flex m-8" keep-alive />
      </div>
    </main>
    <portal-target name="modals"></portal-target>
  </div>
</template>

<script>
import {
  useContext,
  computed,
  onMounted,
  useRoute,
} from '@nuxtjs/composition-api'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default {
  components: {
    Sidebar,
    Header,
  },
  setup() {
    const { store } = useContext()
    const route = useRoute()
    const isLoggedIn = computed(() => store.getters.isLoggedIn)

    if (isLoggedIn.value) {
      store.dispatch('fetchUser')
    }

    watch(
      () => route.value,
      (to, from) => {
        store.dispatch(
          'setPageTitle',
          route.value.name === 'index' ? 'Dashboard' : route.value.name
        )
      }
    )

    onMounted(async () => {
      await store.dispatch('fetchPlayers')
      store.dispatch('fixture-data/fetchFixtures')
    })
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
