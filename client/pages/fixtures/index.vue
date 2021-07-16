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
        class="flex flex-col w-full self-start bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3 mb-4"
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
          <div
            class="flex justify-between items-center py-2 mb-2 border-b border-t border-primary text-xl"
          >
            <span>Fixture</span>
            <span
              class="flex items-center justify-center w-5 h-5 bg-primary text-white rounded-full text-sm"
            >
              {{ index + 1 }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="home">
              <div class="flex justify-between mb-4 uppercase">
                <h3>{{ fixture.home.name }}</h3>
                <customNumberInput></customNumberInput>
              </div>
              <PlayersForm
                :key="fixture.home.id"
                :team-id="fixture.home.id"
              ></PlayersForm>
            </div>
            <div class="away">
              <div class="flex justify-between mb-4 uppercase">
                <h3>{{ fixture.away.name }}</h3>
                <customNumberInput></customNumberInput>
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
import customNumberInput from '@/components/Common/customNumberInput'

export default {
  components: {
    DraftedTeams,
    PlayersForm,
    customNumberInput,
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
