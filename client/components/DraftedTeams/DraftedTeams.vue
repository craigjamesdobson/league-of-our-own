<template>
  <div class="flex flex-row flex-wrap">
    <h1 class="flex w-full">Teams</h1>
    <div
      v-for="team in draftedTeamData"
      :key="team.id"
      class="flex flex-col"
      :class="props.columnClass"
    >
      <div class="p-4 m-2 bg-white rounded-sm">
        <div class="p-2 mb-2 border-b border-gray-800">
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
                class="w-6 h-6 m-auto rounded-full shadow-md"
                :src="player.image"
                :alt="player.name"
              />
            </span>
            <span class="w-2/12 p-2">{{ player.teamShort }}</span>
            <span class="w-5/12 p-2 text-center">{{ player.name }}</span>
            <span class="w-2/12 p-2">{{ player.price }}</span>
          </div>
          <div
            v-else
            :key="player.transfers[0].player.id"
            class="flex w-full border-b border-gray-100 cursor-pointer"
            :class="
              player.transfers[0].isCurrentWeekTransfer ? 'bg-yellow-500 text-gray-800' : 'bg-green-500 text-white',
            "
          >
            <span class="w-1/12 p-2">{{ player.transfers[0].player.id }}</span>
            <span class="w-2/12 p-2">
              <img
                class="w-6 h-6 m-auto rounded-full shadow-md"
                :src="player.transfers[0].player.image"
                :alt="player.transfers[0].player.name"
              />
            </span>
            <span class="w-2/12 p-2">
              {{ player.transfers[0].player.teamShort }}
            </span>
            <span class="w-5/12 p-2 text-center">
              {{ player.transfers[0].player.name }}
            </span>
            <span class="w-2/12 p-2">
              {{ player.transfers[0].player.price }}
            </span>
          </div>
          <div
            class="flex flex-wrap justify-between w-full h-full"
            :class="{
              'hidden absolute top-0 z-10 bg-red-600 text-white old-transfer hover:flex':
                player.transfers.length,
            }"
          >
            <div
              v-if="player.transfers.length"
              class="flex items-center justify-center w-full text-center cursor-pointer "
            >
              <img
                class="w-6 h-6 mr-4 border border-white rounded-full"
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

<script lang="ts">
import { useContext, computed } from '@nuxtjs/composition-api'

export default {
  props: {
    columnClass: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { store } = useContext()
    const draftedTeamData = computed(
      () => store.getters['drafted-data/getDraftedTeams']
    )

    return {
      draftedTeamData,
      props,
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
