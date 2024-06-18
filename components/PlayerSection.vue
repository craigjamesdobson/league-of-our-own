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
        selected: props.selectedPlayers.includes(p.player_id)
      };
    })
    .filter((x) => x.position === props.position)
);
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-5 p-5" :class="getCorrectColSpanClass(props.position)">
    <div class="flex flex-row items-center justify-center gap-5">
      <Button v-if="player" severity="danger" aria-label="Clear player" rounded outlined class="!h-8 !w-8 !p-0"
        @click="player = null">
        <Icon name="akar-icons:cross" />
      </Button>
      <img v-if="player" class="h-24 w-24 rounded-full bg-white p-2 drop-shadow-lg"
        :src="player ? player!.image_large : PLACEHOLDER_PLAYER_IMAGE"
        :alt="player ? player!.web_name : 'Select a player'" @error="loadPlayerFallbackImage" />
      <div v-else class="flex justify-center items-center h-24 w-24 rounded-full bg-white p-2 drop-shadow-lg">
        <Icon v-if="props.position === PlayerPosition.GOALKEEPER" name="tabler:hand-stop" size="40" class="text-surface-400" />
        <Icon v-if="props.position === PlayerPosition.DEFENDER" name="oi:shield" size="40" class="text-surface-400" />
        <Icon v-if="props.position === PlayerPosition.MIDFIELDER" name="ph:brain-duotone" size="40" class="text-surface-400" />
        <Icon v-if="props.position === PlayerPosition.FORWARD" name="mage:goals" size="40" class="text-surface-400" />
      </div>
        <div v-if="player" class="relative flex flex-col gap-2.5">
        <div class="flex items-start gap-10">
          <img class="h-8 w-8" :src="getImageUrl(player!.team_short_name.toLowerCase())" />
        </div>
        <p class="font-black uppercase">
          {{ player!.web_name }}
        </p>
        <p>{{ player!.cost.toFixed(1) }}</p>
      </div>
    </div>
    <Dropdown v-model="player" filter class="mt-auto !min-w-[300px]" :options="dropdownPlayerData"
      :virtual-scroller-options="{ itemSize: 60 }" :placeholder="`Select a ${PlayerPosition[props.position].toLowerCase()}`"
      option-disabled="disabled" option-label="web_name">
      <template #value="slotProps">
        {{ slotProps.value?.web_name || slotProps.placeholder }}
      </template>
      <template #option="slotProps">
        <div class="flex h-full flex-col justify-center gap-2.5">
          <div class="flex gap-2.5">
            <span class="w-1/6">{{ slotProps.option.player_id }}</span>
            <span class="w-1/6">{{ slotProps.option.team_short_name }}</span>
            <span class="w-3/6">{{ slotProps.option.web_name }}</span>
            <span class="w-1/6">{{ slotProps.option.cost.toFixed(1) }}</span>
          </div>
          <div v-if="slotProps.option?.unavailable_for_season" class="flex whitespace-pre-wrap text-[10px]">
            {{ slotProps.option.news }}
          </div>
          <div v-if="slotProps.option.selected" class="flex whitespace-pre-wrap text-[10px]">
            Player has already been selected
          </div>
        </div>
      </template>
    </Dropdown>
  </div>
</template>
