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
            v-for="(transfer, index) in player.transfers"
            :key="index"
            :class="[
              transfer.isCurrentWeekTransfer ? 'bg-yellow-500' : 'bg-green-500',
              { 'invisible absolute old-transfer': index > 0 },
            ]"
            class="flex w-full justify-between"
          >
            <div>{{ transfer.player.id }}</div>
            <div>{{ transfer.player.name }}</div>
            <div>{{ transfer.player.teamShort }}</div>
            <div>{{ transfer.player.price }}</div>
          </div>
          <div
            class="flex flex-wrap w-full justify-between"
            :class="{
              'hidden absolute top-0 z-10 bg-red-600 text-white old-transfer hover:flex':
                player.transfers.length,
            }"
          >
            <template v-if="!player.transfers.length">
              <div>{{ player.playerId }}</div>
              <div>{{ player.playerName }}</div>
              <div>{{ player.playerTeamShort }}</div>
              <div>{{ player.playerPrice }}</div>
            </template>
            <template v-else>
              <div v-if="player.transfers.length" class="w-full text-center">
                {{ player.playerName }} was transferred out on week
                {{ player.transfers[0].transferWeek }}
              </div>
            </template>
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
