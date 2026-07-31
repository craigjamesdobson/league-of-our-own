<script setup lang="ts">
import { PlayerPosition } from '~/types/PlayerPosition';
import { usePlayerStore } from '~/stores/players';
import type { Player } from '~/types/Player';
import { loadPlayerFallbackImage, getImageUrl } from '~/utils/images';

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
    class="flex w-full flex-col items-center justify-center gap-6 p-6"
    :class="getCorrectColSpanClass(props.position)"
    :data-position="PlayerPosition[props.position]"
  >
    <div
      v-if="player"
      class="grid w-full max-w-md grid-cols-[6rem_minmax(0,1fr)_2.25rem] items-center gap-5"
    >
      <img
        class="h-24 w-24 rounded-full bg-white p-2 object-cover object-top drop-shadow-lg aspect-square dark:bg-slate-800"
        :src="player.image_large"
        :alt="player.web_name"
        @error="loadPlayerFallbackImage"
      >
      <div class="min-w-0 flex flex-col gap-2.5">
        <div class="flex items-start">
          <img
            class="aspect-square h-8 w-8 object-contain"
            :src="getImageUrl(player.team_short_name.toLowerCase())"
            :alt="`${player.team_name} crest`"
          >
        </div>
        <p class="truncate font-black uppercase text-slate-900 dark:text-slate-100">
          {{ player.web_name }}
        </p>
        <p class="truncate text-sm text-slate-600 dark:text-slate-300">
          {{ player.team_name }} · £{{ player.cost.toFixed(1) }}m
        </p>
      </div>
      <UButton
        color="error"
        variant="outline"
        icon="akar-icons:cross"
        aria-label="Clear player"
        square
        class="h-9 w-9 justify-center rounded-full p-0"
        @click="player = null"
      />
    </div>
    <div
      v-else
      class="flex h-24 w-24 items-center justify-center rounded-full bg-white p-2 drop-shadow-lg dark:bg-slate-800"
    >
      <Icon
        v-if="props.position === PlayerPosition.GOALKEEPER"
        name="tabler:hand-stop"
        size="40"
        class="text-surface-400 dark:text-slate-500"
      />
      <Icon
        v-if="props.position === PlayerPosition.DEFENDER"
        name="oi:shield"
        size="40"
        class="text-surface-400 dark:text-slate-500"
      />
      <Icon
        v-if="props.position === PlayerPosition.MIDFIELDER"
        name="ph:brain-duotone"
        size="40"
        class="text-surface-400 dark:text-slate-500"
      />
      <Icon
        v-if="props.position === PlayerPosition.FORWARD"
        name="mage:goals"
        size="40"
        class="text-surface-400 dark:text-slate-500"
      />
    </div>
    <USelectMenu
      v-model="selectedPlayer"
      class="mt-auto w-full min-w-0 max-w-md"
      :items="dropdownPlayerData"
      :placeholder="`Select a ${PlayerPosition[props.position].toLowerCase()}`"
      :aria-label="`Select a ${PlayerPosition[props.position].toLowerCase()}`"
      label-key="web_name"
      :search-input="{ placeholder: 'Search players...' }"
    >
      <template #default="{ modelValue }">
        {{ modelValue?.web_name || `Select a ${PlayerPosition[props.position].toLowerCase()}` }}
      </template>
      <template #item-label="{ item }">
        <div class="flex h-full w-full flex-col justify-center gap-2.5">
          <div class="flex min-w-0 items-center gap-2.5">
            <img
              class="h-5 w-5 object-contain"
              :src="getImageUrl(item.team_short_name.toLowerCase())"
              :alt="`${item.team_short_name} crest`"
            >
            <span class="min-w-0 flex-1 truncate">{{ item.web_name }}</span>
            <span class="max-w-28 truncate text-right text-xs text-slate-500 dark:text-slate-400">{{ item.team_name }}</span>
            <span class="shrink-0 text-right">£{{ item.cost.toFixed(1) }}m</span>
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
