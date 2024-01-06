<template>
  <Dialog v-model:visible="visible" modal :dismissable-mask="true">
    <div>
      <input v-model="draftedPlayer.player_id" type="number" />
      <Dropdown
        v-model="draftedPlayer"
        :options="playerStore.players"
        option-label="web_name"
        placeholder="Select a Player"
      >
      </Dropdown>
    </div>
    <div
      v-for="playerTransfer in draftedPlayer.transfers"
      :key="playerTransfer.drafted_transfer_id"
    >
      <input v-model="playerTransfer.player_id" type="number" />
      <Calendar v-model="playerTransfer.active_transfer_expiry" show-icon />
      <input v-model="playerTransfer.transfer_week" type="number" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { usePlayerStore } from '~/stores/players';
import type { DraftedPlayer } from '~/types/DraftedPlayer';

const visible = defineModel<boolean>('visible');
const draftedPlayer = defineModel<DraftedPlayer>('draftedPlayer');

const playerStore = usePlayerStore();
</script>

<style scoped></style>
