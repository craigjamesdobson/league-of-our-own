<script setup lang="ts">
import DraftedPlayer from './DraftedPlayer.vue';
import type { DraftedTeamData } from '@/logic/drafted-teams/interfaces/DraftedTeamData';
const props = defineProps({
  draftedTeam: { type: Object as PropType<DraftedTeamData>, default: null },
});
</script>

<template>
  <div class="p-4 m-2 bg-white rounded-sm">
    <div
      class="flex items-center justify-between p-2 pt-0 mb-2 border-b border-gray-800"
      :class="{
        'bg-red-200': props.draftedTeam?.isInvalidTeam,
      }"
    >
      <div class="flex flex-col uppercase">
        <span class="font-black">{{ props.draftedTeam?.teamName }}</span>
        <span class="text-xs font-light">{{
          props.draftedTeam?.teamOwner
        }}</span>
      </div>
      <span v-if="props.draftedTeam?.allowedTransfers">
        <Icon size="24" name="ic:round-swap-horiz" />
      </span>
    </div>
    <div
      v-for="player in props.draftedTeam?.teamPlayers"
      :key="player.id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200':
          player.transfers.length &&
          !player.transfers.at(-1)?.isCurrentWeekTransfer,
        'bg-green-200': player.transfers.at(-1)?.isCurrentWeekTransfer,
      }"
    >
      <DraftedPlayer v-if="!player.transfers.length" :drafted-player="player" />
      <div
        v-else-if="player.transfers.at(-1) !== null"
        class="cursor-pointer player-container"
      >
        <DraftedPlayer
          :is-transfer="true"
          :drafted-player="player.transfers.at(-1)"
        />
        <div
          class="prev-transfer absolute left-0 z-10 gap-5 flex flex-col items-center justify-center invisible w-full p-2.5 text-center bg-green-200 top-full"
        >
          <div v-if="player.transfers[1]">
            {{ player.transfers[0].webName }} was transferred out in gameweek
            {{ player.transfers[1].transferWeek }}
          </div>
          <div>
            {{ player.webName }} was transferred out in gameweek
            {{ player.transfers[0].transferWeek }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-between pt-2">
      <span>Total</span>
      <strong class="w-2/12 text-center">
        {{ props.draftedTeam?.totalTeamValue }}
      </strong>
    </div>
  </div>
</template>

<style>
.player-container:hover .prev-transfer {
  @apply !visible;
}
</style>
