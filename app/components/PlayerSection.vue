<script setup lang="ts">
import { PlayerPosition } from '~/types/PlayerPosition';
import { usePlayerStore } from '~/stores/players';
import type { Player } from '~/types/Player';
import { PLACEHOLDER_PLAYER_IMAGE, loadPlayerFallbackImage, getImageUrl } from '~/utils/images';

const playerStore = usePlayerStore();

const player = defineModel<Player | null>('player');

const props = defineProps<{
  selectedPlayers: (number | undefined)[];
  position: PlayerPosition;
}>();

type DropdownPlayer = Player & {
  disabled: boolean;
  selected: boolean;
};

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

const dropdownPlayerData = computed<DropdownPlayer[]>(() =>
  playerStore.players
    .map((p) => {
      return {
        ...p,
        disabled:
          p.unavailable_for_season === true
          || props.selectedPlayers.includes(p.player_id),
        selected: props.selectedPlayers.includes(p.player_id),
      };
    })
    .filter(x => x.position === props.position)
    .sort((a, b) => a.team - b.team),
);

const selectedPlayer = computed({
  get: () => dropdownPlayerData.value.find(option => option.player_id === player.value?.player_id),
  set: (value: DropdownPlayer | undefined) => {
    player.value = value ?? null;
  },
});
</script>

<template>
  <div
    class="flex flex-col items-center justify-center gap-5 p-5"
    :class="getCorrectColSpanClass(props.position)"
  >
    <div class="flex flex-row items-center justify-center gap-5">
      <UButton
        v-if="player"
        color="error"
        variant="outline"
        icon="akar-icons:cross"
        aria-label="Clear player"
        square
        class="h-8 w-8 rounded-full"
        @click="player = null"
      />
      <img
        v-if="player"
        class="h-24 w-24 rounded-full bg-white p-2 drop-shadow-lg object-cover object-top aspect-square"
        :src="player ? player!.image_large : PLACEHOLDER_PLAYER_IMAGE"
        :alt="player ? player!.web_name : 'Select a player'"
        @error="loadPlayerFallbackImage"
      >
      <div
        v-else
        class="flex justify-center items-center h-24 w-24 rounded-full bg-white p-2 drop-shadow-lg"
      >
        <Icon
          v-if="props.position === PlayerPosition.GOALKEEPER"
          name="tabler:hand-stop"
          size="40"
          class="text-surface-400"
        />
        <Icon
          v-if="props.position === PlayerPosition.DEFENDER"
          name="oi:shield"
          size="40"
          class="text-surface-400"
        />
        <Icon
          v-if="props.position === PlayerPosition.MIDFIELDER"
          name="ph:brain-duotone"
          size="40"
          class="text-surface-400"
        />
        <Icon
          v-if="props.position === PlayerPosition.FORWARD"
          name="mage:goals"
          size="40"
          class="text-surface-400"
        />
      </div>
      <div
        v-if="player"
        class="relative flex flex-col gap-2.5"
      >
        <div class="flex items-start gap-10">
          <img
            class="h-8 w-8"
            :src="getImageUrl(player!.team_short_name.toLowerCase())"
          >
        </div>
        <p class="font-black uppercase">
          {{ player!.web_name }}
        </p>
        <p>{{ player!.cost.toFixed(1) }}</p>
      </div>
    </div>
    <USelectMenu
      v-model="selectedPlayer"
      class="mt-auto min-w-[300px]"
      :items="dropdownPlayerData"
      :placeholder="`Select a ${PlayerPosition[props.position].toLowerCase()}`"
      label-key="web_name"
      :search-input="{ placeholder: 'Search players...' }"
    >
      <template #default="{ modelValue }">
        {{ modelValue?.web_name || `Select a ${PlayerPosition[props.position].toLowerCase()}` }}
      </template>
      <template #item-label="{ item }">
        <div class="flex h-full w-full flex-col justify-center gap-2.5">
          <div class="flex gap-2.5">
            <span class="w-1/6">{{ item.player_id }}</span>
            <span class="w-1/6">{{ item.team_short_name }}</span>
            <span class="w-3/6">{{ item.web_name }}</span>
            <span class="w-1/6">{{ item.cost.toFixed(1) }}</span>
          </div>
          <div
            v-if="item?.unavailable_for_season"
            class="flex whitespace-pre-wrap text-[10px]"
          >
            {{ item.news }}
          </div>
          <div
            v-if="item.selected"
            class="flex whitespace-pre-wrap text-[10px]"
          >
            Player has already been selected
          </div>
        </div>
      </template>
    </USelectMenu>
  </div>
</template>
