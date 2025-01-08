<script setup lang="ts">
import type { DraftedTeam } from '~/types/DraftedTeam';
import { useWeeklyStatistics } from '~/composables/useWeeklyStatistics';


const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeam>,
    default: null,
  },
  activeWeek: {
    type: Number,
    required: true,
  },
});

const isActiveTransfer = (transferDate: Date) => {
  return new Date(transferDate) > new Date();
};

const { calculatedWeeklyStats } = useWeeklyStatistics(props.draftedTeam, props.activeWeek);

</script>

<template>
  <div
    v-if="props.draftedTeam"
    class="rounded-sm bg-white p-4 pt-0"
  >
    <div
      class="mb-2 flex items-center justify-between border-b border-gray-800 p-2 pt-0"
      :class="{
        'bg-red-200': props.draftedTeam?.is_invalid_team,
      }"
    >
    </div>
    <div
      v-for="player in props.draftedTeam.players"
      :key="player.drafted_player_id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200':
          !!player.transfers.length
          && isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
        'bg-green-200':
          !!player.transfers.length
          && !isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
      }"
    >
      <div class="flex w-full items-center border-b border-gray-100">
        <DraftedPlayerWithPoints
          v-if="!player.transfers.length"
          :drafted-player="player"
        />
        <DraftedActivePlayer
          v-else-if="player.transfers.at(-1) !== null"
          :active-gameweek="activeWeek"
          :drafted-player="player"
          class="w-full"
        />
      </div>
    </div>
    <div class="flex justify-between py-2.5 pl-2.5 bg-surface-50">
      <span>Total</span>
      <strong class="w-2/12 text-center">
        {{ calculatedWeeklyStats.points }}
      </strong>
    </div>
  </div>
</template>
