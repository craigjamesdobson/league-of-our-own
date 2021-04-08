<template>
  <div class="flex flex-row flex-wrap">
    <h1 class="flex w-full">Teams</h1>
    <div
      v-for="team in draftedTeamData"
      :key="team.id"
      class="flex flex-col w-1/4"
    >
      <div class="bg-white rounded-md m-2 p-4">
        <div>
          {{ team.teamName }}
          <span v-if="team.allowedTransfers">!</span>
        </div>
        <div
          v-for="player in team.teamPlayers"
          :key="player.playerName"
          class="relative"
          :class="{
            'transferred-player': player.transfers.length,
          }"
        >
          <div
            v-if="!player.transfers.length"
            class="flex w-full border-b border-gray-100"
            :class="{
              'opacity-25': player.isUnavailableForSeason,
            }"
          >
            <span class="w-1/12 p-2">{{ player.id }}</span>
            <span class="w-2/12 p-2">
              <img
                class="w-6 h-6 rounded-full shadow-md m-auto"
                :src="player.image"
                :alt="player.name"
              />
            </span>
            <span class="w-2/12 p-2">{{ player.teamShort }}</span>
            <span class="w-5/12 p-2 text-center">{{ player.name }}</span>
            <span class="w-2/12 p-2">{{ player.price }}</span>
          </div>
          <div
            v-for="transfer in player.transfers"
            v-else
            :key="transfer.player.id"
            class="flex w-full border-b border-gray-100 bg-green-500 text-white cursor-pointer"
          >
            <span class="w-1/12 p-2">{{ transfer.player.id }}</span>
            <span class="w-2/12 p-2">
              <img
                class="w-6 h-6 rounded-full shadow-md m-auto"
                :src="transfer.player.image"
                :alt="transfer.player.name"
              />
            </span>
            <span class="w-2/12 p-2">{{ transfer.player.teamShort }}</span>
            <span class="w-5/12 p-2 text-center">
              {{ transfer.player.name }}
            </span>
            <span class="w-2/12 p-2">{{ transfer.player.price }}</span>
          </div>
          <div
            class="flex flex-wrap h-full w-full justify-between"
            :class="{
              'hidden absolute top-0 z-10 bg-red-600 text-white old-transfer hover:flex':
                player.transfers.length,
            }"
          >
            <div
              v-if="player.transfers.length"
              class="flex justify-center items-center w-full text-center cursor-pointer"
            >
              <img
                class="w-6 h-6 rounded-full border border-white mr-4"
                :src="player.image"
                :alt="player.name"
              />
              {{ player.name }} was transferred out on week
              {{ player.transfers[0].transferWeek }}
            </div>
          </div>
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
    const draftedTeamData = computed(() => store.getters.getDraftedTeams)

    return {
      draftedTeamData,
    }
  },
}
</script>

<style lang="scss">
.transferred-player {
  &:hover {
    .old-transfer {
      display: flex;
    }
  }
}
</style>
