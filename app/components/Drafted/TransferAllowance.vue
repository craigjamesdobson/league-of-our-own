<script setup lang="ts">
import { useNow } from '@vueuse/core';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';
import {
  getCurrentTransferPeriod,
  getLondonDateKey,
  getTransferAllowance,
} from '~~/shared/utils/transferPeriod';

const props = defineProps<{
  draftedTeam: DraftedTeamWithPlayers;
}>();

const now = useNow({ interval: 60_000 });
const allowance = computed(() => {
  const { januaryFirstKey } = getCurrentTransferPeriod(now.value);
  const counts = { beforeJanuary: 0, afterJanuary: 0 };

  props.draftedTeam.players.forEach((player) => {
    player.transfers.forEach((transfer) => {
      if (getLondonDateKey(new Date(transfer.created_at ?? 0)) < januaryFirstKey) {
        counts.beforeJanuary++;
      }
      else {
        counts.afterJanuary++;
      }
    });
  });

  return getTransferAllowance(counts, now.value);
});
</script>

<template>
  <div class="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
    <span class="inline-flex items-center gap-1.5">
      <span>{{ allowance.afterJanuary ? 'Available now' : 'Available before 1 Jan' }}</span>
      <UBadge
        :color="allowance.availableNow > 1 ? 'success' : allowance.availableNow > 0 ? 'warning' : 'error'"
        variant="soft"
      >
        {{ allowance.availableNow }}{{ allowance.afterJanuary ? '' : '/2' }}
      </UBadge>
    </span>
    <span class="inline-flex items-center gap-1.5">
      <span>Season remaining</span>
      <UBadge
        color="neutral"
        variant="soft"
      >
        {{ allowance.seasonRemaining }}/4
      </UBadge>
    </span>
  </div>
</template>
