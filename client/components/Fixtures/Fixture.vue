<template>
  <div>
    <div
      class="
        flex
        items-center
        justify-between
        py-2
        mb-2
        text-xl
        border-t border-b border-primary
      "
    >
      <span>Fixture</span>
      <span
        class="
          flex
          items-center
          justify-center
          w-5
          h-5
          text-sm text-white
          rounded-full
          bg-primary
        "
      >
        {{ fixtureId }}
      </span>
    </div>
    <div class="grid grid-cols-2 gap-4">
      <div class="home js-fixture-container">
        <div class="flex justify-between mb-4 uppercase">
          <h3>{{ fixtureData.home.name }}</h3>
          <customNumberInput
            :class="{ active: fixtureData.score[0] > 0 }"
            :value="fixtureData.score[0].toString()"
            @input-updated="updateScore(0, $event)"
          ></customNumberInput>
        </div>
        <PlayersForm
          :key="fixtureData.home.id"
          :team-id="fixtureData.home.id"
          :player-stats="fixtureData.home.stats"
          :opposition-score="fixtureData.score[1]"
          :fixture-week="fixtureWeek"
          @player-stats-change="storePlayerStats(fixtureWeek, $event)"
        ></PlayersForm>
      </div>
      <div class="away js-fixture-container">
        <div class="flex justify-between mb-4 uppercase">
          <h3>{{ fixtureData.away.name }}</h3>
          <customNumberInput
            :class="{ active: fixtureData.score[1] > 0 }"
            :value="fixtureData.score[1].toString()"
            @input-updated="updateScore(1, $event)"
          ></customNumberInput>
        </div>
        <PlayersForm
          :key="fixtureData.away.id"
          :team-id="fixtureData.away.id"
          :player-stats="fixtureData.away.stats"
          :opposition-score="fixtureData.score[0]"
          :fixture-week="fixtureWeek"
          @player-stats-change="storePlayerStats(fixtureWeek, $event)"
        ></PlayersForm>
      </div>
    </div>
  </div>
</template>

<script>
import PlayersForm from '@/components/Fixtures/PlayersForm.vue'
import customNumberInput from '@/components/Common/customNumberInput.vue'
import { useFixtureLogic } from '@/pages/fixtures/fixtureLogic'

export default {
  components: {
    PlayersForm,
    customNumberInput,
  },

  props: {
    fixtureId: Number,
    fixtureData: Object,
    fixtureWeek: Number,
  },

  setup(props) {
    const { updateFixtureScore, storePlayerStats } = useFixtureLogic()

    const updateScore = (venue, value) => {
      props.fixtureData.score[venue] = value

      const fixturePayload = {
        score: [props.fixtureData.score[0], props.fixtureData.score[1]],
        selectedFixtureID: props.fixtureId,
        selectedWeek: props.fixtureWeek,
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
