<script setup lang="ts">
import DraftedPlayer from './DraftedPlayer.vue';
import type { DraftedTeam } from '~/types/DraftedTeam';

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeam>,
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

const selectedDraftedPlayer = ref(null);
const showDialog = ref(false);

const handleEditPlayer = (playerID: number) => {
  try {
    selectedDraftedPlayer.value = props.draftedTeam.players.find(
      (x) => x.player_id === playerID
    );
    showDialog.value = true;
  } catch (error) {
    console.error('Error fetching drafted player:', error);
  }
};
</script>

<template>
  <div v-if="props.draftedTeam" class="p-4 bg-white rounded-sm">
    <div
      class="flex items-center justify-between p-2 pt-0 mb-2 border-b border-gray-800"
      :class="{
        'bg-red-200': props.draftedTeam?.is_invalid_team,
      }"
    >
      <div class="flex flex-col uppercase">
        <span class="font-black text-lg">{{
          props.draftedTeam?.team_name
        }}</span>
        <span class="text-xs font-light">{{
          props.draftedTeam?.team_owner
        }}</span>
      </div>
      <span
        v-if="props.draftedTeam?.allowed_transfers"
        title="Transfers allowed"
      >
        <Icon size="24" name="ic:round-swap-horiz" />
      </span>
    </div>
    <div
      v-for="player in props.draftedTeam?.players"
      :key="player.player_id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200':
          !!player.transfers.length &&
          isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
        'bg-green-200':
          !!player.transfers.length &&
          !isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
      }"
    >
      <div class="flex gap-5 w-full border-b border-gray-100 items-center">
        <DraftedPlayer
          v-if="!player.transfers.length"
          :drafted-player="player"
        />
        <DraftedTransfer
          v-else-if="player.transfers.at(-1) !== null"
          :drafted-player="player"
          class="w-full"
        />
        <Button
          v-if="editable"
          icon="pi pi-check"
          aria-label="Edit Player"
          title="Edit Player"
          class="mr-2"
          :pt="{
            root: { class: 'w-6 h-6' },
          }"
          :pt-options="{ mergeProps: true }"
          @click="handleEditPlayer(player.player_id)"
        >
          <Icon size="20" name="ic:round-swap-horiz" />
        </Button>
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
    v-if="editable"
    v-model:drafted-player="selectedDraftedPlayer"
    v-model:visible="showDialog"
  />
</template>

<style>
.player-container:hover .prev-transfer {
  @apply !visible;
}
</style>
