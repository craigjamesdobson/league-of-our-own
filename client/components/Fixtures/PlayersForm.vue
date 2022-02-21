<template>
  <div class="flex flex-col accordion">
    <div v-for="(playerTypes, key, index) in filteredPlayerData" :key="index">
      <button
        class="
          flex
          items-center
          justify-between
          w-full
          p-2
          mb-4
          text-sm text-white
          uppercase
          rounded-sm
          accordion__header
          bg-primary
        "
        @click.stop="toggleAccordionBody"
      >
        <h4>
          {{ key }}
        </h4>
        <svg-icon
          class="w-5 h-5 text-white fill-current"
          name="icons/icon-chevron-down"
        />
      </button>
      <div class="justify-between hidden mb-4 accordion__body">
        <div
          class="
            p-2
            mb-2
            text-xs
            font-bold
            uppercase
            bg-white
            rounded-sm
            player-form-grid
          "
        >
          <span>Name</span>
          <span>Goals</span>
          <span>Assists</span>
          <span>CS</span>
          <span>SO</span>
          <span>Points</span>
        </div>
        <div class="flex flex-col w-full bg-white rounded-sm">
          <div
            v-for="player in playerTypes"
            :key="player.id"
            class="
              p-2
              text-sm
              border-b border-gray-100
              player-row player-form-grid
            "
          >
            <span class="flex text-xs">
              {{ player.name }}
            </span>
            <span>
              <customNumberInput
                :key="player.id"
                :value="
                  player.gameWeekStats
                    .filter((x) => x.gameweek === props.fixtureWeek)[0]
                    .goalsScored.toString()
                "
                :class="{
                  active: getPlayerGameweekData(player).goalsScored > 0,
                }"
                @input-updated="
                  emitPlayerStats('goalsScored', $event, player.id)
                "
              ></customNumberInput>
            </span>
            <span>
              <customNumberInput
                :key="player.id"
                :value="
                  player.gameWeekStats
                    .filter((x) => x.gameweek === props.fixtureWeek)[0]
                    .assists.toString()
                "
                :class="{ active: getPlayerGameweekData(player).assists > 0 }"
                @input-updated="emitPlayerStats('assists', $event, player.id)"
              ></customNumberInput>
            </span>
            <span class="flex">
              <input
                :value="player.id"
                :disabled="player.playerType > 2 || oppositionScore > 0"
                class="w-5 h-5 clean-sheet"
                :class="{
                  active: getPlayerGameweekData(player).cleanSheet === true,
                }"
                type="checkbox"
                :checked="getPlayerGameweekData(player).cleanSheet"
                @change="
                  emitPlayerStats(
                    'cleanSheet',
                    $event.target.checked,
                    player.id
                  )
                  toggleCheckboxStatus($event)
                "
              />
            </span>
            <span class="flex">
              <input
                :value="player.id"
                class="w-5 h-5 sent-off"
                :class="{
                  active: getPlayerGameweekData(player).sentOff === true,
                }"
                type="checkbox"
                :checked="getPlayerGameweekData(player).sentOff"
                @change="
                  emitPlayerStats('sentOff', $event.target.checked, player.id)
                  toggleCheckboxStatus($event)
                "
              />
            </span>
            <span class="text-center">
              {{ getPlayerGameweekData(player).points }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useContext, computed } from '@nuxtjs/composition-api'
import { loadFallbackImage } from '@/helpers/helpers'
import customNumberInput from '@/components/Common/customNumberInput'
export default {
  components: {
    customNumberInput,
  },
  props: {
    teamId: {
      type: Number,
      required: true,
    },
    playerStats: Array,
    fixtureWeek: Number,
    oppositionScore: Number,
  },
  setup(props, { emit }) {
    const { store } = useContext()

    const playerData = computed(() => store.getters.getFilteredPlayerData)

    const filteredPlayerData = Object.entries(playerData.value).reduce(
      (acc, curr) => {
        acc[curr[0]] = [
          ...curr[1].filter((player) => player.teamID === props.teamId),
        ]
        return acc
      },
      {}
    )

    const getPlayerGameweekData = (player) => {
      return player.gameWeekStats.filter(
        (x) => x.gameweek === props.fixtureWeek
      )[0]
    }

    const emitPlayerStats = (statType, statValue, playerID) => {
      emit('player-stats-change', {
        statType,
        playerID,
        statValue,
      })
    }

    const toggleCheckboxStatus = (e) => {
      const isChecked = e.target.checked

      isChecked
        ? e.target.classList.add('active')
        : e.target.classList.remove('active')
    }

    const toggleAccordionBody = (event) => {
      const accordionBody = event.currentTarget.nextElementSibling

      const accordionContainer = accordionBody.closest('.accordion')

      if (!accordionBody.classList.contains('hidden')) {
        accordionBody.classList.add('hidden')
        return
      }

      accordionContainer
        .querySelectorAll('.accordion__body')
        .forEach((x) => x.classList.add('hidden'))

      accordionBody.classList.remove('hidden')
    }

    return {
      filteredPlayerData,
      props,
      loadFallbackImage,
      toggleAccordionBody,
      getPlayerGameweekData,
      emitPlayerStats,
      toggleCheckboxStatus,
    }
  },
}
</script>

<style lang="scss">
.player-form-grid {
  display: grid;
  grid-auto-rows: 1fr;
  grid-template-columns: 0.3fr 0.2fr 0.2fr 0.075fr 0.075fr 0.15fr;
  align-items: center;
}

.decrement:disabled {
  @apply opacity-50 pointer-events-none;
}

.sent-off {
  &.active {
    filter: hue-rotate(135deg);
  }
}

.clean-sheet {
  &.active {
    filter: hue-rotate(305deg);
  }
}
</style>
