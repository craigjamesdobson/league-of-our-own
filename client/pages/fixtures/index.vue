<template>
  <div class="flex flex-col">
    <h1>Fixtures</h1>
    <div class="flex justify-between my-2">
      <button
        v-for="index in fixtureData.fixturesTotal"
        :key="index"
        class="
          w-10
          h-10
          border
          rounded-sm
          border-primary
          hover:bg-primary hover:text-white
        "
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
        class="
          flex flex-col
          self-start
          w-full
          px-4
          py-3
          mb-4
          text-blue-700
          bg-blue-100
          border-t border-b border-blue-500
        "
        role="alert"
      >
        <p class="text-sm">Please select a gameweek to view fixtures</p>
      </div>
      <div v-else>
        <div class="flex items-center justify-between">
          <div class="flex items-center mb-4">
            <button
              class="
                flex
                items-center
                p-2
                mr-4
                text-white
                border
                rounded-sm
                border-primary
                bg-primary
                js-update-fixture-collection-btn
                update-fixture-collection-btn
              "
              @click="updateHandler"
            >
              Save Gameweek {{ fixtureData.activeFixtureRound }}
            </button>
            <input
              id="incomplete-week"
              v-model="fixtureData.isIncomplete"
              class="mr-2 w-5 h-5"
              type="checkbox"
              @change="updateGameweekStatus"
            />
            <label for="incomplete-week" class="text-sm">
              This week is incomplete ({{ fixtureData.isIncomplete }})
            </label>
          </div>
          <div
            v-if="fixtureData.updatedAt && fixtureData.updatedBy"
            class="text-sm"
          >
            This gameweek was lasted updated on
            <strong>
              {{ new Date(fixtureData.updatedAt).toLocaleString() }}
            </strong>
            by
            <strong>{{ fixtureData.updatedBy }}</strong>
          </div>
        </div>
        <div
          v-if="fixtureData.isIncomplete"
          role="alert"
          class="
            flex flex-col
            self-start
            w-full
            px-4
            py-3
            mb-4
            text-blue-700
            bg-blue-100
            border-t border-b border-blue-500
          "
        >
          <p class="text-sm uppercase">
            This gameweek is incomplete so scores will not be added to total
          </p>
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
              :key="+index + 1"
              :fixture-id="index + 1"
              :fixture-data="fixture"
              :fixture-week="fixtureData.activeFixtureRound"
            ></Fixture>
          </div>
        </div>
      </div>
      <div>
        <DraftedTeams
          v-if="fixtureData.fixturesLoaded"
          :fixture-week="fixtureData.activeFixtureRound"
          :dynamic-view="true"
          column-class="w-1/4"
        ></DraftedTeams>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import DraftedTeams from '@/components/DraftedTeams/DraftedTeams.vue'
import Fixture from '@/components/Fixtures/Fixture.vue'
import { onMounted } from '@vue/composition-api'
import { useContext } from '@nuxtjs/composition-api'
import { useFixtureLogic } from './fixtureLogic'

export default {
  middleware: 'auth',
  components: {
    DraftedTeams,
    Fixture,
  },
  setup() {
    const { store } = useContext()
    const {
      playerStats,
      fixtureData,
      filteredFixtureData,
      storePlayerStats,
      filterFixtures,
      updateFixtureScore,
      updateGameweekStatus,
      updateHandler,
    } = useFixtureLogic()

    onMounted(() => {
      store.dispatch('fixture-data/fetchFixtures')
    })

    return {
      fixtureData,
      filterFixtures,
      filteredFixtureData,
      playerStats,
      storePlayerStats,
      updateFixtureScore,
      updateGameweekStatus,
      updateHandler,
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
