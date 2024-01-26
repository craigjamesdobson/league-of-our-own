<template>
  <div
    class="flex flex-col items-center gap-5 justify-center p-5"
    :class="getCorrectColSpanClass(player!.position)"
  >
    <div class="flex flex-row items-center justify-center gap-5">
      <Button
        v-if="player?.selectedPlayer"
        severity="danger"
        aria-label="Clear player"
        rounded
        outlined
        class="!w-6 !h-6"
        @click="player.selectedPlayer = null"
      >
        <Icon name="akar-icons:cross" />
      </Button>
      <img
        class="w-24 h-24 rounded-full bg-white drop-shadow-lg p-2"
        :src="player!.selectedPlayer?.image_large ?? loadPlayerFallbackImage"
        :alt="player!.selectedPlayer?.web_name"
        @error="loadPlayerFallbackImage"
      />
      <div v-if="player!.selectedPlayer" class="relative flex flex-col gap-2.5">
        <div class="flex items-start gap-10">
          <img
            class="w-8 h-8"
            :src="getImageUrl(player!.selectedPlayer.team_short_name.toLowerCase())"
          />
        </div>
        <p class="uppercase font-black">
          {{ player!.selectedPlayer.web_name }}
        </p>
        <p>{{ player!.selectedPlayer.cost.toFixed(1) }}</p>
      </div>
    </div>
    <Dropdown
      v-model="player!.selectedPlayer"
      filter
      class="!min-w-[300px] mt-auto"
      :options="dropdownPlayerData"
      :virtual-scroller-options="{ itemSize: 60 }"
      option-label="web_name"
      placeholder="Select a Player"
      option-disabled="disabled"
    >
      <template #value="slotProps">
        {{ slotProps.value?.web_name || slotProps.placeholder }}
      </template>
      <template #option="slotProps">
        <div class="flex flex-col gap-2.5 h-full justify-center">
          <div class="flex gap-2.5">
            <span class="w-1/6">{{ slotProps.option.player_id }}</span>
            <span class="w-1/6">{{ slotProps.option.team_short_name }}</span>
            <span class="w-3/6">{{ slotProps.option.web_name }}</span>
            <span class="w-1/6">{{ slotProps.option.cost.toFixed(1) }}</span>
          </div>
          <div
            v-if="slotProps.option?.unavailable_for_season"
            class="flex text-[10px] whitespace-pre-wrap"
          >
            {{ slotProps.option.news }}
          </div>
          <div
            v-if="slotProps.option.selected"
            class="flex text-[10px] whitespace-pre-wrap"
          >
            Player has already been selected
          </div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>

<script setup lang="ts">
import type { Player } from '~/types/Player';
import { PlayerPosition } from '~/types/PlayerPosition';
import { usePlayerStore } from '~/stores/players';

const playerStore = usePlayerStore();

const player = defineModel<{
  position: PlayerPosition;
  selectedPlayer: Player | null;
}>('player');

const props = defineProps<{
  selectedPlayers: number[];
}>();

const getCorrectColSpanClass = (position: PlayerPosition) => {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return 'col-span-12';
    case PlayerPosition.DEFENDER:
      return 'col-span-3';
    default:
      return 'col-span-4';
  }
};

const dropdownPlayerData = computed(() =>
  playerStore.players
    .map((player) => {
      return {
        ...player,
        disabled: player.unavailable_for_season === true,
        selected: props.selectedPlayers.includes(player.player_id),
      };
    })
    .filter(
      (x) =>
        x.position === player.value!.position &&
        !props.selectedPlayers.includes(x.player_id)
    )
);
</script>

<style scoped></style>
