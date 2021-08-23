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
      <div v-else>
        <div class="flex">
          <button
            class="p-2 mb-4 text-white border rounded-sm  border-primary bg-primary js-update-fixture-collection-btn"
            @click="updateFixtureCollection"
            >Save Gameweek {{ fixtureData.activeFixtureRound }}</button
          >
        </div>
        <div
          class="grid items-start grid-flow-row grid-cols-2 gap-4 auto-rows-max"
        >
          <div
            v-for="(fixture, index) in fixtureData.filteredFixtures"
            :key="index"
            class="flex flex-col justify-center"
          >
            <Fixture
              :fixture-data="{
                fixture: fixture,
                fixtureID: index + 1,
                selectedWeek: fixtureData.activeFixtureRound,
              }"
            ></Fixture>
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
import Fixture from '@/components/Fixtures/Fixture.vue'
import { useFixtureLogic } from './fixtureLogic'

export default {
  components: {
    DraftedTeams,
    Fixture,
  },
  setup() {
    const {
      playerStats,
      fixtureData,
      storePlayerStats,
      filterFixtures,
      updateFixtureScore,
      updateFixtureCollection,
    } = useFixtureLogic()

    return {
      fixtureData,
      filterFixtures,
      playerStats,
      storePlayerStats,
      updateFixtureScore,
      updateFixtureCollection,
    }
  },
}
</script>
