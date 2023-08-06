<script setup lang="ts">
import type { DraftedTeamData } from '@/logic/drafted-teams/interfaces/DraftedTeamData';

const props = defineProps({
  draftedTeam: { type: Object as PropType<DraftedTeamData>, default: null },
  isEditable: { type: Boolean, default: false },
});
</script>

<template>
  <div class="p-4 m-2 bg-white rounded-sm">
    <div
      class="flex items-center justify-between p-2 pt-0 mb-2 border-b border-gray-800"
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
      <DraftedPlayer
        v-if="!player.transfers.length"
        :drafted-player="player"
        :model-value="player.id"
        :is-editable="props.isEditable"
        @update:model-value="(newValue) => (player.id = newValue)"
      />
      <DraftedPlayer
        v-else-if="player.transfers.at(-1) !== null"
        :drafted-player="player.transfers.at(-1)"
        :is-editable="props.isEditable"
        :model-value="player.transfers.at(-1)?.id"
        @update:model-value="
          (newValue) => (player.transfers.at(-1).id = newValue)
        "
      />
    </div>
    <div class="flex justify-between pt-2">
      <span>Total</span>
      <strong class="w-2/12 text-center">
        {{ props.draftedTeam?.totalTeamValue }}
      </strong>
    </div>
  </div>
</template>
