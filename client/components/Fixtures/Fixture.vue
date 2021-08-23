<template>
  <div>
    <div
      class="flex items-center justify-between py-2 mb-2 text-xl border-t border-b  border-primary"
    >
      <span>Fixture</span>
      <span
        class="flex items-center justify-center w-5 h-5 text-sm text-white rounded-full  bg-primary"
      >
        {{ fixtureData.fixtureID }}
      </span>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="home js-fixture-container">
        <div class="flex justify-between mb-4 uppercase">
          <h3>{{ fixtureData.fixture.home.name }}</h3>
          <customNumberInput
            :class="{ active: fixtureData.fixture.score[0] > 0 }"
            :value="fixtureData.fixture.score[0]"
            @input-updated="updateScore(0, $event)"
          ></customNumberInput>
        </div>
        <PlayersForm
          :key="fixtureData.fixture.home.id"
          :team-id="fixtureData.fixture.home.id"
          @player-stats-change="storePlayerStats"
        ></PlayersForm>
      </div>
      <div class="away js-fixture-container">
        <div class="flex justify-between mb-4 uppercase">
          <h3>{{ fixtureData.fixture.away.name }}</h3>
          <customNumberInput
            :class="{ active: fixtureData.fixture.score[1] > 0 }"
            :value="fixtureData.fixture.score[1]"
            @input-updated="updateScore(1, $event)"
          ></customNumberInput>
        </div>
        <PlayersForm
          :key="fixtureData.fixture.away.id"
          :team-id="fixtureData.fixture.away.id"
        ></PlayersForm>
      </div>
    </div>
  </div>
</template>

<script>
import PlayersForm from '@/components/Fixtures/PlayersForm.vue'
import customNumberInput from '@/components/Common/customNumberInput.vue'
import { useFixtureLogic } from '@/pages/fixtures/fixtureLogic'
import { reactive } from '@vue/composition-api'

export default {
  components: {
    PlayersForm,
    customNumberInput,
  },

  props: {
    fixtureData: Object,
  },

  setup(props) {
    const { updateFixtureScore, storePlayerStats } = useFixtureLogic()

    const updateScore = (venue, value) => {
      props.fixtureData.fixture.score[venue] = value

      const fixturePayload = {
        score: [
          props.fixtureData.fixture.score[0],
          props.fixtureData.fixture.score[1],
        ],
        selectedFixtureID: props.fixtureData.fixtureID,
        selectedWeek: props.fixtureData.selectedWeek,
      }

      updateFixtureScore(fixturePayload)
    }

    return {
      updateFixtureScore,
      storePlayerStats,
      updateScore,
    }
  },
}
</script>
