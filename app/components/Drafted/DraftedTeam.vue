<script setup lang="ts">
import DraftedPlayer from './DraftedPlayer.vue';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeamWithPlayers>,
    default: null,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const isActiveTransfer = (transferDate: Date) => {
  return new Date(transferDate) > new Date();
};

const selectedDraftedPlayer = ref();
const showDialog = ref(false);

const handleEditPlayer = (playerID: number) => {
  try {
    selectedDraftedPlayer.value = props.draftedTeam.players.find(
      x => x.data.player_id === playerID,
    );
    showDialog.value = true;
  }
  catch (error) {
    console.error('Error fetching drafted player:', error);
  }
};
</script>

<template>
  <div
    v-if="props.draftedTeam"
    class="rounded-sm border border-transparent bg-white p-5 text-slate-900 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
  >
    <div
      class="mb-2 flex items-center justify-between border-b border-gray-800 p-2 pt-0 dark:border-slate-700"
      :class="{
        'bg-red-200 dark:bg-red-950/70': props.draftedTeam?.is_invalid_team,
      }"
    >
      <div class="flex flex-col uppercase">
        <span class="text-lg font-black">{{
          props.draftedTeam?.team_name
        }}</span>
        <span class="text-xs font-light">{{
          props.draftedTeam?.team_owner
        }}</span>
      </div>
      <span
        v-if="props.draftedTeam?.allowed_transfers"
        v-tooltip.top="'Transfers allowed'"
      >
        <Icon
          size="24"
          name="ic:round-swap-horiz"
        />
      </span>
    </div>
    <div
      v-for="player in props.draftedTeam.players"
      :key="player.drafted_player_id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-950/70 dark:hover:bg-yellow-900/80':
          !!player.transfers.length
          && isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
        'bg-green-200 transition-all hover:bg-green-300 dark:bg-green-950/70 dark:hover:bg-green-900/80':
          !!player.transfers.length
          && !isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
      }"
    >
      <div class="flex w-full items-center border-b border-gray-100 dark:border-slate-800">
        <DraftedPlayer
          v-if="!player.transfers.length"
          :drafted-player="player"
        />
        <DraftedTransfer
          v-else-if="player.transfers.at(-1) !== null"
          :drafted-player="player"
          class="w-full cursor-pointer"
          @click="handleEditPlayer(player.data.player_id!)"
        />
        <UButton
          v-if="props.editable"
          icon="tabler:switch-3"
          color="primary"
          size="xs"
          square
          aria-label="Edit Player"
          title="Edit Player"
          class="mr-2"
          @click="handleEditPlayer(player.data.player_id!)"
        />
      </div>
    </div>
    <div class="flex justify-between px-2.5 pt-2.5">
      <span>Total</span>
      <strong>
        {{ props.draftedTeam?.total_team_value }}
      </strong>
    </div>
  </div>
  <DraftedPlayerEditDialog
    v-if="selectedDraftedPlayer"
    v-model:drafted-player="selectedDraftedPlayer"
    v-model:visible="showDialog"
    :editable="props.editable"
    :team="props.draftedTeam"
  />
</template>
