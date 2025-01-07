<script setup lang="ts">
import type { DraftedPlayer, DraftedTransfer } from '@/types/DraftedPlayer';
import { pluralise } from '@/utils/locale';

const props = defineProps({
  draftedPlayer: {
    type: Object as PropType<DraftedPlayer | DraftedTransfer>,
    default: null,
  },
  transferCount: { type: Number, default: 0 },
});
</script>

<template>
  <div class="flex h-full w-full justify-between gap-2">
    <span class="w-1/12 p-2">{{ props.draftedPlayer?.data.player_id }}</span>
    <span class="w-2/12 p-2">{{
      props.draftedPlayer.data.team_short_name
      }}</span>
    <span class="flex justify-between items-center gap-1 w-5/12 p-2 text-center text-sm whitespace-nowrap">
      <div class="flex items-center">
        {{ props.draftedPlayer.data.web_name }}
        <div v-if="props.transferCount > 0" class="flex items-center relative">
          <Icon class="ml-1" size="20" name="fluent:arrow-swap-20-regular" />
          <div v-if="transferCount > 1" title="View transfer details"
            class="flex items-center justify-center text-[8px] border border-black rounded-full w-4 h-4 -mt-2">
            {{ props.transferCount }}
          </div>
        </div>
      </div>
      <div class="flex gap-1">
        <div v-if="props.draftedPlayer?.week_goals > 0" v-tooltip.top="pluralise(draftedPlayer.week_goals, 'goal')">
          <Icon class="text-surface-600 flex items-center justify-center" size="16" name="mage:goals" />
        </div>
        <div v-if="props.draftedPlayer?.week_assists > 0" v-tooltip.top="pluralise(draftedPlayer.week_assists, 'assist')">
          <Icon class="text-surface-600 flex items-center justify-center" size="16" name="icon-park-outline:soccer-one" />
        </div>
        <div v-if="props.draftedPlayer?.week_cleansheets" v-tooltip.top="'Clean sheet'">
          <Icon title="Goals" class="text-surface-600" size="16"
            name="oi:shield" />
        </div>
        <div v-if="props.draftedPlayer?.week_redcards"  v-tooltip.top="'Sent off'">
          <Icon title="Goals" class="text-surface-600" size="18"
            name="gravity-ui:square-exclamation" />
        </div>
      </div>
    </span>
    <span v-if="props.draftedPlayer.points !== undefined" class="w-2/12 p-2 text-center">
      {{ props.draftedPlayer.points }}
    </span>
    <span v-else class="w-2/12 p-2 text-center">
      {{ props.draftedPlayer.data.cost!.toFixed(1) }}
    </span>
  </div>
</template>

<style scoped></style>
