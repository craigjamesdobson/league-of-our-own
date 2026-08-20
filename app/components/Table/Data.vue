<script lang="ts" setup>
import type { TableColumn } from '@nuxt/ui';
import type { DraftedTeamWithWeeklyStats } from '~/types/DraftedTeam';
import type { WeeklyData } from '~/types/Table';

const visible = defineModel<boolean>('visible');
const selectedDraftedTeam = defineModel<DraftedTeamWithWeeklyStats>('selectedDraftedTeam');

const props = defineProps<{
  weeklyData: WeeklyData[] | undefined;
  draftedTeamsWithPoints: DraftedTeamWithWeeklyStats[] | undefined;
}>();

const showTeamPoints = (id: number) => {
  selectedDraftedTeam.value = props.draftedTeamsWithPoints?.find(x => x.drafted_team_id === id);
  visible.value = true;
};

const { isFavouriteTeam } = useFavouriteTeam();

const columns: TableColumn<WeeklyData>[] = [
  { id: 'position' },
  { accessorKey: 'prev_week_position', id: 'prev_week_position' },
  { accessorKey: 'team_name', header: 'Team' },
  { accessorKey: 'goals', header: 'Goals' },
  { accessorKey: 'assists', header: 'Assists' },
  { accessorKey: 'clean_sheets', id: 'clean_sheets' },
  { accessorKey: 'red_cards', id: 'red_cards' },
  { accessorKey: 'week_points', id: 'week_points' },
  { accessorKey: 'total_points', id: 'total_points' },
];
</script>

<template>
  <UTable
    v-if="props.weeklyData"
    :data="props.weeklyData"
    :columns="columns"
    :ui="{
      root: 'overflow-x-auto',
      base: 'min-w-full',
      th: 'whitespace-nowrap',
      td: 'align-middle',
      tr: 'even:bg-slate-50/70 dark:even:bg-slate-800/50',
    }"
  >
    <template #position-header>
      <UTooltip text="Current Position">
        <span>
          Pos.
        </span>
      </UTooltip>
    </template>
    <template #position-cell="{ row }">
      <div>{{ row.index + 1 }}</div>
    </template>

    <template #prev_week_position-header>
      <UTooltip text="Previous Position">
        <span>
          Prv Pos.
        </span>
      </UTooltip>
    </template>
    <template #prev_week_position-cell="{ row }">
      <div>
        <div
          v-if="!!row.original.prev_week_position"
          class="grid grid-cols-[35px_auto]"
        >
          <div>{{ row.original.prev_week_position }}</div>
          <div v-if="row.original.prev_week_position < row.index + 1">
            <Icon
              size="16"
              class="text-red-500"
              name="flowbite:caret-down-solid"
            />
          </div>
          <div v-if="row.original.prev_week_position > row.index + 1">
            <Icon
              size="16"
              class="text-green-500"
              name="flowbite:caret-up-solid"
            />
          </div>
          <div v-if="row.original.prev_week_position === row.index + 1">
            <Icon
              size="20"
              class="text-primary"
              name="radix-icons:dot-filled"
            />
          </div>
        </div>
        <div v-else>
          N/A
        </div>
      </div>
    </template>

    <template #team_name-cell="{ row }">
      <div
        class="flex gap-2.5"
      >
        <UTooltip text="Show points breakdown">
          <UButton
            icon="lucide:info"
            size="xs"
            color="neutral"
            variant="ghost"
            square
            aria-label="Team information"
            @click="showTeamPoints(row.original.drafted_team_id)"
          />
        </UTooltip>
        <div class="flex flex-col gap-1 uppercase">
          <div class="flex items-center gap-1.5 font-black lg:text-base">
            {{ row.original.team_name }}
            <UTooltip
              v-if="isFavouriteTeam(row.original.drafted_team_id)"
              text="Your team"
            >
              <Icon
                name="lucide:user-round-check"
                size="15"
                class="shrink-0 text-amber-500"
                aria-hidden="true"
              />
            </UTooltip>
          </div>
          <div class="text-xs">
            {{ row.original.team_owner }}
          </div>
        </div>
      </div>
    </template>

    <template #clean_sheets-header>
      <UTooltip text="Total clean sheets">
        <span>
          CS.
        </span>
      </UTooltip>
    </template>

    <template #red_cards-header>
      <UTooltip text="Total red cards">
        <span>
          RC.
        </span>
      </UTooltip>
    </template>

    <template #week_points-header>
      <UTooltip text="Weekly points total">
        <span class="whitespace-nowrap">
          Wk Pts.
        </span>
      </UTooltip>
    </template>
    <template #week_points-cell="{ row }">
      <div class="flex items-center gap-2.5">
        <div>{{ row.original.week_points }}</div>
        <Icon
          v-if="row.original.weekly_winner"
          size="16"
          class="text-yellow-500"
          name="tabler:star-filled"
        />
      </div>
    </template>

    <template #total_points-header>
      <UTooltip text="Total Points">
        <span class="whitespace-nowrap">
          Tot Pts.
        </span>
      </UTooltip>
    </template>
  </UTable>
  <SkeletonTable v-else />
</template>
