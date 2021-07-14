<template>
  <div>
    <div v-for="(playerTypes, key, index) in filteredPlayerData" :key="index">
      <h2 class="player-heading capitalize">
        {{ key }}
      </h2>
      <div class="flex justify-between mb-4 bg-white rounded-sm">
        <div class="flex flex-col py-2 px-4 border-r border-gray-100 w-full">
          <ul class="flex flex-col flex-wrap">
            <li
              v-for="player in playerTypes"
              :key="player.id"
              class="player-row relative flex p-2 items-center justify-around border-b border-gray-100 text-sm"
            >
              <span>{{ player.id }}</span>
              <span>
                <img
                  class="w-6 h-6 rounded-full shadow-md"
                  :src="player.image"
                  :alt="player.name"
                  @error="loadFallbackImage"
                />
              </span>
              <span>{{ player.teamShort }}</span>
              <span>
                {{ player.name }}
              </span>
              <span>{{ player.price }}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useContext, computed } from '@nuxtjs/composition-api'
import { loadFallbackImage } from '@/helpers/helpers'
export default {
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
        // acc is accumulator which is the required object.
        // this will create a nee key in accumulator and will set its value
        acc[curr[0]] = [
          ...curr[1].filter((player) => player.teamID === props.teamId),
        ]
        return acc
      },
      {}
    )

    return { filteredPlayerData, props, loadFallbackImage }
  },
}
</script>
