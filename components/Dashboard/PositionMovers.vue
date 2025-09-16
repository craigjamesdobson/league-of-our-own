<script setup lang="ts">
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';
import type { PositionMovers } from '@/types/Dashboard';

defineProps({
  positionMovers: {
    type: Object as PropType<PositionMovers>,
    default: () => ({ biggestRisers: [], biggestFallers: [] }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  hasResults: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <WeeklySummaryCard
    :is-loading="isLoading"
  >
    <div
      v-if="positionMovers.biggestRisers.length > 0 || positionMovers.biggestFallers.length > 0"
      class="flex-1 flex flex-col justify-between"
    >
      <!-- Biggest Risers -->
      <div
        v-if="positionMovers.biggestRisers.length > 0"
        class="flex-1 flex flex-col"
      >
        <h4 class="text-sm font-bold text-green-700 mb-4 flex items-center uppercase tracking-wide">
          <Icon
            name="tabler:chevrons-up"
            size="16"
            class="mr-2 text-green-600"
          />
          Biggest Risers
        </h4>
        <div class="flex-1 flex flex-col justify-evenly space-y-2">
          <div
            v-for="team in positionMovers.biggestRisers"
            :key="team.drafted_team_id"
            class="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
          >
            <div class="flex items-center space-x-3">
              <div class="text-left">
                <div class="font-bold text-sm text-slate-800 uppercase">
                  {{ team.team_name }}
                </div>
                <div class="text-xs text-slate-600 uppercase">
                  {{ team.team_owner }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="text-sm text-slate-600 font-medium flex items-center gap-1">
                {{ team.prev_week_position }}
                <Icon
                  name="lucide:arrow-right"
                  size="12"
                />
                {{ team.currentPosition }}
              </div>
              <Badge
                :value="`+${team.positionChange}`"
                severity="success"
                class="font-bold"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Biggest Fallers -->
      <div
        v-if="positionMovers.biggestFallers.length > 0"
        class="flex-1 flex flex-col mt-6"
      >
        <h4 class="text-sm font-bold text-red-700 mb-4 flex items-center uppercase tracking-wide">
          <Icon
            name="tabler:chevrons-down"
            size="16"
            class="mr-2 text-red-600"
          />
          Biggest Fallers
        </h4>
        <div class="flex-1 flex flex-col justify-evenly space-y-2">
          <div
            v-for="team in positionMovers.biggestFallers"
            :key="team.drafted_team_id"
            class="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-red-50 to-rose-50 border border-red-200"
          >
            <div class="flex items-center space-x-3">
              <div class="text-left">
                <div class="font-bold text-sm text-slate-800 uppercase">
                  {{ team.team_name }}
                </div>
                <div class="text-xs text-slate-600 uppercase">
                  {{ team.team_owner }}
                </div>
              </div>
            </div>
            <div class="flex items-center space-x-3">
              <div class="text-sm text-slate-600 font-medium flex items-center gap-1">
                {{ team.prev_week_position }}
                <Icon
                  name="lucide:arrow-right"
                  size="12"
                />
                {{ team.currentPosition }}
              </div>
              <Badge
                :value="team.positionChange.toString()"
                severity="danger"
                class="font-bold"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      <Icon
        name="carbon:arrows-vertical"
        size="48"
        class="mx-auto text-slate-400 mb-2"
      />
      <p class="text-slate-500 mb-2">
        <span v-if="hasResults">No significant position changes</span>
        <span v-else>Gameweek in progress</span>
      </p>
      <Tag
        v-if="hasResults"
        severity="secondary"
        value="Positions stable"
      />
      <Tag
        v-else
        severity="secondary"
        value="Awaiting final results..."
      />
    </div>
  </WeeklySummaryCard>
</template>
