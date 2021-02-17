<template>
  <div class="flex flex-col w-3/4">
    <div v-for="(playerTypes, key, index) in playerData" :key="index">
      <h2 class="player-heading capitalize">
        {{ key }}
      </h2>
      <div
        v-if="playerTypes.length"
        class="flex justify-between mb-4 bg-white rounded-xl"
      >
        <div class="py-2 px-4 border-r border-gray-100 w-full">
          <ul class="flex flex-wrap">
            <li
              v-for="player in playerTypes"
              :key="player.id"
              class="player-row relative w-1/2 flex flex-col items-center justify-around border-b border-gray-100 text-sm"
              :class="{ 'cursor-pointer': player.isUnavailable }"
            >
              <div class="flex w-full">
                <span class="w-1/12 p-2">{{ player.id }}</span>
                <span class="w-1/12 p-2">
                  <img
                    class="w-6 h-6 rounded-full shadow-md"
                    :src="player.image"
                    :alt="player.name"
                    @error="loadFallbackImage"
                  />
                </span>
                <span class="w-2/12 p-2">{{ player.teamShort }}</span>
                <span class="w-5/12 p-2 text-center">{{ player.name }}</span>
                <span class="w-2/12 p-2">{{ player.price }}</span>
                <span
                  v-if="player.unavailableForSeason"
                  class="flex items-center text-xs w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="w-3 h-3 rounded-full flex justify-center leading-tight mr-2 bg-red-500"
                  ></span>
                  Unavailable
                </span>
                <span
                  v-if="player.isUnavailable && !player.unavailableForSeason"
                  class="flex items-center text-xs w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="w-3 h-3 rounded-full flex justify-center leading-tight mr-2 bg-yellow-400"
                  ></span>
                  Unavailable
                </span>
                <span
                  v-else-if="!player.isUnavailable"
                  class="flex items-center text-xs w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="w-3 h-3 rounded-full flex justify-center leading-tight mr-2 bg-green-400"
                  ></span>
                  Available
                </span>
              </div>
              <div
                v-if="player.isUnavailable"
                :class="{
                  'bg-yellow-400':
                    !player.unavailableForSeason && player.isUnavailable,
                  'bg-red-600 text-white': player.unavailableForSeason,
                }"
                class="player-news invisible opacity-0 transition-all duration-200 ease-in-out absolute w-full text-center self-stretch p-2 text-xs justify-center rounded-sm"
              >
                {{ player.availabilityNews }}
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div v-else>
        <div
          class="flex items-center p-3 mb-4 bg-blue-200 rounded-b-sm border-t-2 shadow-sm border-blue-700 text-blue-700 text-sm"
        >
          <span
            class="flex items-center justify-center bg-blue-300 w-5 h-5 mr-4 rounded-full"
          >
            <font-awesome-icon
              class="fa-xs text-blue-800"
              :icon="['fa', 'info']"
            />
          </span>
          No results for filtered
          <span class="font-bold ml-1">{{ key }}</span>
          , please adjust filters
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { useContext, computed } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { store } = useContext()
    const playerData = computed(() => store.getters.getFilteredPlayerData)

    const loadFallbackImage = (e) => {
      e.target.src =
        'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/Photo-Missing.png'
    }

    return {
      playerData,
      loadFallbackImage,
    }
  },
}
</script>
<style lang="scss">
.player-row {
  &:hover {
    .player-news {
      @apply visible opacity-100;
    }
  }
}

.player-heading {
  @apply mb-4 text-2xl px-4;
}
</style>
