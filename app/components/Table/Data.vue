<script lang="ts" setup>
import type { } from '~/types/database.types';
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
</script>

<template>
  <DataTable
    v-if="props.weeklyData"
    scrollable
    striped-rows
    :value="props.weeklyData"
  >
    <Column field="index">
      <template #header="">
        <div v-tooltip.click.top="'Current Position'">
          Pos.
        </div>
      </template>
      <template #body="slotProps">
        <div>{{ slotProps.index + 1 }}</div>
      </template>
    </Column>
    <Column field="prev_week_position">
      <template #header>
        <div v-tooltip.top="'Previous Position'">
          Prv Pos.
        </div>
      </template>
      <template #body="slotProps">
        <div
          v-if="!!slotProps.data.prev_week_position"
          class="grid grid-cols-[35px_auto]"
        >
          <div>{{ slotProps.data.prev_week_position }}</div>
          <div v-if="slotProps.data.prev_week_position < slotProps.index + 1">
            <Icon
              size="16"
              class="text-red-500"
              name="flowbite:caret-down-solid"
            />
          </div>
          <div v-if="slotProps.data.prev_week_position > slotProps.index + 1">
            <Icon
              size="16"
              class="text-green-500"
              name="flowbite:caret-up-solid"
            />
          </div>
          <div v-if="slotProps.data.prev_week_position === slotProps.index + 1">
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
      </template>
    </Column>
    <Column
      field="team_name"
      header="Team"
    >
      <template #body="slotProps">
        <div class="flex gap-2.5">
          <Button
            v-tooltip.top="`Show points breakdown`"
            class="w-8 h-8 !p-1"
            rounded
            text
            aria-label="Team information"
            @click="showTeamPoints(slotProps.data.drafted_team_id)"
          >
            <Icon
              size="18"
              name="lucide:info"
            />
          </Button>
          <div class="flex flex-col gap-1 uppercase">
            <div class="font-black lg:text-base">
              {{ slotProps.data.team_name }}
            </div>
            <div class="text-xs">
              {{ slotProps.data.team_owner }}
            </div>
          </div>
        </div>
      </template>
    </Column>
    <Column
      field="goals"
      header="Goals"
    />
    <Column
      field="assists"
      header="Assists"
    />
    <Column field="clean_sheets">
      <template #header>
        <div v-tooltip.top="'Total clean sheets'">
          CS.
        </div>
      </template>
    </Column>
    <Column field="red_cards">
      <template #header>
        <div v-tooltip.top="'Total red cards'">
          RC.
        </div>
      </template>
    </Column>
    <Column field="week_points">
      <template #header>
        <div
          v-tooltip.top="'Weekly points total'"
          class="whitespace-nowrap"
        >
          Wk Pts.
        </div>
      </template>
      <template #body="slotProps">
        <div class="flex items-center gap-2.5">
          <div>{{ slotProps.data.week_points }}</div>
          <Icon
            v-if="slotProps.data.weekly_winner"
            size="16"
            class="text-yellow-500"
            name="tabler:star-filled"
          />
        </div>
      </template>
    </Column>
    <Column field="total_points">
      <template #header>
        <div
          v-tooltip.top="'Total Points'"
          class="whitespace-nowrap"
        >
          Tot Pts.
        </div>
      </template>
    </Column>
  </DataTable>
  <SkeletonTable v-else />
</template>
