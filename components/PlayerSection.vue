<template>
  <div
    class="flex flex-col items-center gap-5 justify-center p-5"
    :class="getCorrectColSpanClass(props.position)"
  >
    <div class="flex flex-row items-center justify-center gap-5">
      <Button
        v-if="player"
        severity="danger"
        aria-label="Clear player"
        rounded
        outlined
        class="!w-6 !h-6"
        @click="player = null"
      >
        <Icon name="akar-icons:cross" />
      </Button>
      <img
        class="w-24 h-24 rounded-full bg-white drop-shadow-lg p-2"
        :src="player ? player!.image_large : PLACEHOLDER_PLAYER_IMAGE"
        :alt="player ? player!.web_name : 'pick a player'"
        @error="loadPlayerFallbackImage"
      />
      <div v-if="player" class="relative flex flex-col gap-2.5">
        <div class="flex items-start gap-10">
          <img
            class="w-8 h-8"
            :src="getImageUrl(player!.team_short_name.toLowerCase())"
          />
        </div>
        <p class="uppercase font-black">
          {{ player!.web_name }}
        </p>
        <p>{{ player!.cost.toFixed(1) }}</p>
      </div>
    </div>
    <Dropdown
      v-model="player"
      filter
      class="!min-w-[300px] mt-auto"
      :options="dropdownPlayerData"
      :virtual-scroller-options="{ itemSize: 60 }"
      placeholder="Select a Player"
      option-disabled="disabled"
      option-label="web_name"
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
import { PlayerPosition } from '~/types/PlayerPosition';
import { usePlayerStore } from '~/stores/players';
import type { Player } from '~/types/Player';
import { PLACEHOLDER_PLAYER_IMAGE } from '~/utils/images';

const playerStore = usePlayerStore();

const player = defineModel<Player | null>('player');

const props = defineProps<{
  selectedPlayers: (number | undefined)[];
  position: PlayerPosition;
}>();

const getCorrectColSpanClass = (position: PlayerPosition) => {
  switch (position) {
    case PlayerPosition.GOALKEEPER:
      return 'col-span-12';
    case PlayerPosition.DEFENDER:
      return 'col-span-12 xl:col-span-3';
    default:
      return 'col-span-12 xl:col-span-4';
  }
};

const dropdownPlayerData = computed(() =>
  playerStore.players
    .map((p) => {
      return {
        ...p,
        disabled:
          p.unavailable_for_season === true ||
          props.selectedPlayers.includes(p.player_id),
        selected: props.selectedPlayers.includes(p.player_id),
      };
    })
    .filter((x) => x.position === props.position),
);
</script>

<style scoped></style>
