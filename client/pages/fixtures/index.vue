<template>
  <div class="flex flex-col">
    <h1>Fixtures</h1>
    <div class="flex justify-between my-2">
      <button
        v-for="index in fixtureData.fixturesTotal"
        :key="index"
        class="w-10 h-10 border rounded-sm  border-primary hover:bg-primary hover:text-white"
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
        class="flex flex-col self-start w-full px-4 py-3 mb-4 text-blue-700 bg-blue-100 border-t border-b border-blue-500 "
        role="alert"
      >
        <p class="text-sm">Please select a gameweek to view fixtures</p>
      </div>
      <div
        v-else
        class="grid items-start grid-flow-row grid-cols-2 gap-4 auto-rows-max"
      >
        <div
          v-for="(fixture, index) in fixtureData.filteredFixtures"
          :key="index"
          class="flex flex-col justify-center"
        >
          <div
            class="flex items-center justify-between py-2 mb-2 text-xl border-t border-b  border-primary"
          >
            <span>Fixture</span>
            <span
              class="flex items-center justify-center w-5 h-5 text-sm text-white rounded-full  bg-primary"
            >
              {{ index + 1 }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="home js-fixture-container">
              <div class="flex justify-between mb-4 uppercase">
                <h3>{{ fixture.home.name }}</h3>
                <customNumberInput></customNumberInput>
              </div>
              <PlayersForm
                :key="fixture.home.id"
                :team-id="fixture.home.id"
                @player-stats-change="storePlayerStats"
              ></PlayersForm>
            </div>
            <div class="away js-fixture-container">
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

<script lang="ts">
import DraftedTeams from '@/components/DraftedTeams/DraftedTeams.vue'
import PlayersForm from '@/components/Fixtures/PlayersForm.vue'
import customNumberInput from '@/components/Common/customNumberInput.vue'
import { useFixtureLogic } from './fixtureLogic'

export default {
  components: {
    DraftedTeams,
    PlayersForm,
    customNumberInput,
  },
  setup() {
    const { playerStats, fixtureData, storePlayerStats, filterFixtures } =
      useFixtureLogic()

    return {
      fixtureData,
      filterFixtures,
      playerStats,
      storePlayerStats,
    }
  },
}
</script>
