<template>
  <div class="flex flex-col">
    <h1>Fixtures</h1>
    <div class="flex justify-between my-2">
      <button
        v-for="index in fixtureData.fixturesTotal"
        :key="index"
        class="border border-primary w-10 h-10 rounded-sm hover:bg-primary hover:text-white"
        :class="{
          'bg-primary text-white': index === fixtureData.activeFixtureRound,
        }"
        @click="filterFixtures(index)"
      >
        {{ index }}
      </button>
    </div>
    <div class="grid grid-flow-row grid-cols-5 auto-rows-max gap-4 my-5">
      <div
        v-for="(fixture, index) in fixtureData.filteredFixtures"
        :key="index"
        class="flex flex-col justify-center"
      >
        <div>Fixture {{ index + 1 }}</div>
        <div class="flex">
          <div class="home w-1/2">{{ fixture.home }}</div>
          <div class="away w-1/2">{{ fixture.away }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useContext, computed, reactive } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { store } = useContext()

    store.dispatch('fetchFixtures')

    const fixtureData = reactive({
      fixturesTotal: 38,
      activeFixtureRound: 1,
      fixtures: computed(() => store.getters.getFixtures[0].matches),
      filteredFixtures: [],
    })

    const filterFixtures = (fixtureRound) => {
      fixtureData.activeFixtureRound = fixtureRound
      fixtureData.filteredFixtures = fixtureData.fixtures.filter(
        (x) => +x.round === fixtureData.activeFixtureRound
      )
    }

    return { fixtureData, filterFixtures }
  },
}
</script>
