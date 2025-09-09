<script setup lang="ts">
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';
import type { DraftedTeamWithPlayerPointsByGameweek } from '~/types/database.types';
import { useWeeklyStats } from '~/composables/useWeeklyStats';
import type { DraftedPlayer, DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from '~/types/DraftedPlayer';

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeamWithPlayers | DraftedTeamWithPlayerPointsByGameweek>,
    default: null,
  },
  activeWeek: {
    type: Number,
    required: true,
  },
  showPlayerOverride: {
    type: Boolean,
    default: false,
  },
});

const { draftedTeam, activeWeek } = toRefs(props);
const { calculatedWeeklyStats } = useWeeklyStats(draftedTeam, activeWeek);

const findActiveGameweekPlayer = (player: DraftedPlayer): DraftedPlayerWithWeeklyStats | DraftedTransferWithWeeklyStats => {
  if (player.transfers.some(x => x.transfer_week <= props.activeWeek)) {
    return player.transfers.findLast(
      x => x.transfer_week <= props.activeWeek,
    )!;
  }
  else {
    return player;
  }
};

const getTransferWeek = (activePlayer: DraftedPlayerWithWeeklyStats | DraftedTransferWithWeeklyStats): number | null => {
  return 'transfer_week' in activePlayer ? activePlayer.transfer_week : null;
};
</script>

<template>
  <div
    v-if="props.draftedTeam"
    class="rounded-sm bg-white p-5"
  >
    <div class="flex flex-col uppercase">
      <span class="text-lg font-black">{{
        props.draftedTeam?.team_name
      }}</span>
      <span class="text-xs font-light">{{
        props.draftedTeam?.team_owner
      }}</span>
    </div>
    <div
      class="mb-2 flex items-center justify-between border-b border-gray-800 p-2 pt-0"
      :class="{
        'bg-red-200': props.draftedTeam?.is_invalid_team,
      }"
    />
    <div
      v-for="player in props.draftedTeam.players"
      :key="player.drafted_player_id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200':
          getTransferWeek(findActiveGameweekPlayer(player)) === props.activeWeek,
        'bg-green-200':
          getTransferWeek(findActiveGameweekPlayer(player)) !== null
          && getTransferWeek(findActiveGameweekPlayer(player))! < props.activeWeek,
      }"
    >
      <div class="relative flex w-full items-center border-b border-gray-100">
        <DraftedPlayerWithPoints
          :drafted-player="findActiveGameweekPlayer(player)"
          :transfer-count="player.transfers.filter((x: DraftedTransferWithWeeklyStats) => x.transfer_week <= props.activeWeek).length"
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
