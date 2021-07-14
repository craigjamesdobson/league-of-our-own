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
    <div class="flex flex-col my-5">
      <div
        v-if="!fixtureData.filteredFixtures.length"
        class="flex flex-col self-start bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3 mr-4"
        role="alert"
      >
        <p class="text-sm">Please select a gameweek to view fixtures</p>
      </div>
      <div
        v-else
        class="grid grid-flow-row grid-cols-2 auto-rows-max gap-4 items-start"
      >
        <div
          v-for="(fixture, index) in fixtureData.filteredFixtures"
          :key="index"
          class="flex flex-col justify-center"
        >
          <div>Fixture {{ index + 1 }}</div>
          <div class="flex">
            <div class="home w-1/2">
              <div class="mb-4">
                {{ fixture.home.name }} - {{ fixture.home.id }}
              </div>
              <PlayersForm
                :key="fixture.home.id"
                :team-id="fixture.home.id"
              ></PlayersForm>
            </div>
            <div class="away w-1/2">
              <div class="mb-4">
                {{ fixture.away.name }} - {{ fixture.away.id }}
              </div>
              <PlayersForm
                :key="fixture.away.id"
                :team-id="fixture.away.id"
              ></PlayersForm>
            </div>
          </div>
        </div>
      </div>
      <div>
        <DraftedTeams column-class="w-1/4"></DraftedTeams>
      </div>
    </div>
  </div>
</template>

<script>
import { useContext, computed, reactive } from '@nuxtjs/composition-api'
import DraftedTeams from '@/components/DraftedTeams/DraftedTeams'
import PlayersForm from '@/components/Fixtures/PlayersForm'

export default {
  components: {
    DraftedTeams,
    PlayersForm,
  },
  setup() {
    const { store } = useContext()

    store.dispatch('fetchFixtures')

    const fixtureData = reactive({
      fixturesTotal: 38,
      activeFixtureRound: null,
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
