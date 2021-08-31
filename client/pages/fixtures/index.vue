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
        <div class="flex items-center justify-between">
          <button
            class="flex items-center p-2 mb-4 text-white border rounded-sm  border-primary bg-primary js-update-fixture-collection-btn update-fixture-collection-btn"
            @click="updateFixtureCollection"
          >
            Save Gameweek {{ fixtureData.activeFixtureRound }}
          </button>
          <div
            v-if="fixtureData.updatedAt && fixtureData.updatedBy"
            class="text-sm"
          >
            This fixture was lasted updated on
            <strong>
              {{ new Date(fixtureData.updatedAt).toLocaleString() }}
            </strong>
            by
            <strong>{{ fixtureData.updatedBy }}</strong>
          </div>
        </div>
        <div
          class="grid items-start grid-flow-row grid-cols-2 gap-4 auto-rows-max"
        >
          <div
            v-for="(fixture, index) in filteredFixtureData.fixtures"
            :key="index"
            class="flex flex-col justify-center"
          >
            <Fixture
              :fixture-id="index + 1"
              :fixture-data="fixture"
              :fixture-week="fixtureData.activeFixtureRound"
              :key="index + 1"
            ></Fixture>
          </div>
        </div>
      </div>
      <div>
        <DraftedTeams v-if="fixtureData.fixturesLoaded" :fixture-data="filteredFixtureData.fixtures" column-class="w-1/4"></DraftedTeams>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DraftedTeams from '@/components/DraftedTeams/DraftedTeams.vue'
import Fixture from '@/components/Fixtures/Fixture.vue'
import { useFixtureLogic } from './fixtureLogic'

export default {
  middleware: 'auth',
  components: {
    DraftedTeams,
    Fixture,
  },
  setup() {
    const {
      playerStats,
      fixtureData,
      filteredFixtureData,
      storePlayerStats,
      filterFixtures,
      updateFixtureScore,
      updateFixtureCollection,
    } = useFixtureLogic()

    return {
      fixtureData,
      filterFixtures,
      filteredFixtureData,
      playerStats,
      storePlayerStats,
      updateFixtureScore,
      updateFixtureCollection,
    }
  },
}
</script>

<style lang="scss">
@keyframes rotate-forever {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.update-fixture-collection-btn {
  &.loading {
    &:after {
      content: '';
      animation-duration: 0.75s;
      animation-iteration-count: infinite;
      animation-name: rotate-forever;
      animation-timing-function: linear;
      height: 15px;
      width: 15px;
      border: 2px solid #ffffff;
      border-right-color: transparent;
      border-radius: 50%;
      display: inline-block;
      margin-left: 10px;
    }
  }
}
</style>
