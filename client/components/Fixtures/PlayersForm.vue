<template>
  <div class="accordion flex flex-col">
    <div v-for="(playerTypes, key, index) in filteredPlayerData" :key="index">
      <button
        class="flex justify-between items-center w-full accordion__header uppercase mb-4 p-2 bg-primary text-white rounded-sm text-sm"
        @click.stop="toggleAccordionBody"
      >
        <h4>
          {{ key }}
        </h4>
        <svg-icon class="w-5 h-5 fill-current text-white" name="chevron-down" />
      </button>
      <div
        class="accordion__body justify-between mb-4 bg-white rounded-sm hidden"
      >
        <div class="flex flex-col py-2 px-4 border-r border-gray-100 w-full">
          <div
            v-for="player in playerTypes"
            :key="player.id"
            class="player-row relative flex p-2 items-center justify-around border-b border-gray-100 text-sm"
          >
            <span class="flex w-1/4">
              {{ player.name }}
            </span>
            <span class="flex w-1/8">
              <input
                :disabled="player.playerType > 2"
                class="h-5 w-5"
                type="checkbox"
              />
            </span>
            <span class="w-1/3">
              <customNumberInput :key="player.id"></customNumberInput>
            </span>
            <span class="flex w-1/8">
              <input class="h-5 w-5" type="checkbox" />
            </span>
            <span class="flex w-1/8">{{ player.price }}</span>
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
  },
  setup(props) {
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

    const toggleAccordionBody = (event) => {
      const accordionBody = event.currentTarget.nextElementSibling

      accordionBody.classList.contains('hidden')
        ? accordionBody.classList.remove('hidden')
        : accordionBody.classList.add('hidden')
    }

    return {
      filteredPlayerData,
      props,
      loadFallbackImage,
      toggleAccordionBody,
    }
  },
}
</script>

<style lang="postcss">
.decrement:disabled {
  @apply opacity-50 pointer-events-none;
}
</style>
