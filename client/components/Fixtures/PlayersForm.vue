<template>
  <div>
    <div>
      <!-- <div v-if="players">
        <h2>Goalkeepers</h2>
        <div
          v-for="(goalkeepers, gkIndex) in players.goalkeepers"
          :key="gkIndex"
          class="mb-4"
        >
          <div v-if="player.goalkeepers.teamID == props.teamId">
            {{ player.goalkeepers.name }} - {{ props.teamId }}
          </div>
        </div>
        <h2>Defenders</h2>
        <div
          v-for="(defenders, defIndex) in players.defenders"
          :key="defIndex"
          class="mb-4"
        >
          <div v-if="player.defenders.teamID == props.teamId">
            {{ player.defenders.name }} - {{ props.teamId }}
          </div>
        </div>
        <h2>Midfielders</h2>
        <div
          v-for="(midfielders, mfIndex) in players.midfielders"
          :key="mfIndex"
          class="mb-4"
        >
          <div v-if="player.midfielders.teamID == props.teamId">
            {{ player.midfielders.name }} - {{ props.teamId }}
          </div>
        </div>
        <h2>Forwards</h2>
        <div
          v-for="(forwards, fwdIndex) in players.forwards"
          :key="fwdIndex"
          class="mb-4"
        >
          <div v-if="player.forwards.teamID == props.teamId">
            {{ player.forwards.name }} - {{ props.teamId }}
          </div>
        </div>
      </div> -->
      <div v-for="(playerTypes, key, index) in filteredPlayerData" :key="index">
        <h2 class="player-heading capitalize">
          {{ key }}
        </h2>
        <div class="flex justify-between mb-4 bg-white rounded-sm">
          <div class="py-2 px-4 border-r border-gray-100 w-full">
            <ul class="flex flex-wrap">
              <div v-for="player in playerTypes" :key="player.id">
                <li
                  v-if="player.teamID == props.teamId"
                  class="player-row relative w-full lg:w-1/2 flex flex-col items-center justify-around border-b border-gray-100 text-sm cursor-pointer"
                >
                  <div class="">
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
                  </div>
                </li>
              </div>
            </ul>
          </div>
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
