<script setup lang="ts">
import type { DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from '@/types/DraftedPlayer';
import { loadPlayerFallbackImage } from '@/utils/images';
import { pluralise } from '@/utils/locale';

type RowMode = 'value' | 'points';

const props = withDefaults(defineProps<{
  draftedPlayer: DraftedPlayerWithWeeklyStats | DraftedTransferWithWeeklyStats | null;
  mode?: RowMode;
  transferCount?: number;
  showImage?: boolean;
}>(), {
  mode: 'value',
  transferCount: 0,
  showImage: true,
});

const rowGridClass = computed(() =>
  props.showImage
    ? 'grid-cols-[3.25rem_3rem_3.5rem_minmax(0,1fr)_3rem]'
    : 'grid-cols-[3.25rem_3.75rem_minmax(0,1fr)_3rem]',
);

const valueLabel = computed(() => {
  if (!props.draftedPlayer) return '';
  if (props.draftedPlayer.points !== undefined) return props.draftedPlayer.points;
  return props.draftedPlayer.data.cost?.toFixed(1) ?? '';
});
</script>

<template>
  <div
    v-if="props.draftedPlayer"
    class="grid h-full w-full min-w-0 items-center gap-1"
    :class="rowGridClass"
  >
    <span class="p-2 tabular-nums">
      {{ props.draftedPlayer.data.player_id }}
    </span>

    <span
      v-if="props.showImage"
      class="p-2"
    >
      <img
        class="m-auto h-6 w-6 rounded-full object-cover object-top shadow-md"
        :src="props.draftedPlayer.data.image!"
        :alt="props.draftedPlayer.data.web_name!"
        @error="loadPlayerFallbackImage"
      >
    </span>

    <span class="p-2 font-medium">
      {{ props.draftedPlayer.data.team_short_name }}
    </span>

    <span class="flex min-w-0 items-center justify-between gap-1 p-2 text-center text-sm">
      <span class="flex min-w-0 items-center">
        <span class="truncate">
          {{ props.draftedPlayer.data.web_name }}
        </span>
        <span
          v-if="props.transferCount > 0"
          class="relative flex shrink-0 items-center"
        >
          <Icon
            class="ml-1"
            size="20"
            name="fluent:arrow-swap-20-regular"
          />
          <span
            v-if="props.transferCount > 1"
            title="View transfer details"
            class="-mt-2 flex h-4 w-4 items-center justify-center rounded-full border border-black text-[8px] dark:border-slate-300"
          >
            {{ props.transferCount }}
          </span>
        </span>
      </span>

      <span
        v-if="props.mode === 'points'"
        class="flex shrink-0 gap-1"
      >
        <UTooltip
          v-if="props.draftedPlayer.week_goals && props.draftedPlayer.week_goals > 0"
          :text="pluralise(props.draftedPlayer.week_goals, 'goal')"
        >
          <Icon
            class="text-surface-600 flex items-center justify-center dark:text-slate-300"
            size="16"
            name="mage:goals"
          />
        </UTooltip>
        <UTooltip
          v-if="props.draftedPlayer.week_assists && props.draftedPlayer.week_assists > 0"
          :text="pluralise(props.draftedPlayer.week_assists, 'assist')"
        >
          <Icon
            class="text-surface-600 flex items-center justify-center dark:text-slate-300"
            size="16"
            name="icon-park-outline:soccer-one"
          />
        </UTooltip>
        <UTooltip
          v-if="props.draftedPlayer.week_cleansheets"
          text="Clean sheet"
        >
          <Icon
            class="text-surface-600 dark:text-slate-300"
            size="16"
            name="oi:shield"
          />
        </UTooltip>
        <UTooltip
          v-if="props.draftedPlayer.week_redcards"
          text="Sent off"
        >
          <Icon
            class="text-surface-600 dark:text-slate-300"
            size="18"
            name="gravity-ui:square-exclamation"
          />
        </UTooltip>
      </span>
    </span>

    <span class="p-2 text-center font-semibold tabular-nums">
      {{ valueLabel }}
    </span>
  </div>
</template>
