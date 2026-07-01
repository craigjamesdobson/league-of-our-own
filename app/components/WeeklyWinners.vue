<script lang="ts" setup>
import { useTableStore } from '@/stores/table';

const tableStore = useTableStore();

onMounted(() => {
  tableStore.fetchWeeklyWinners();
});
</script>

<template>
  <h2 class="mb-5 lg:mb-12 text-xl font-black uppercase">
    Weekly Winners
  </h2>
  <div class="overflow-hidden rounded border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
    <table class="w-full text-left text-sm">
      <thead class="bg-slate-50 text-xs font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-300">
        <tr>
          <th class="w-1/12 p-3">
            Week
          </th>
          <th class="w-10/12 p-3">
            Team
          </th>
          <th class="w-1/12 p-3 text-right">
            Points
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
        <tr
          v-for="winnerWeek in tableStore.weeklyWinners"
          :key="winnerWeek.week"
          class="odd:bg-white even:bg-slate-50/70 dark:odd:bg-slate-900 dark:even:bg-slate-800/40"
        >
          <td class="p-3 font-bold">
            {{ winnerWeek.week }}
          </td>
          <td class="p-3">
            <template v-if="!!winnerWeek.points">
              <div class="flex flex-col gap-2.5">
                <div
                  v-for="(winner, index) in winnerWeek.top_teams"
                  :key="index"
                >
                  <div class="flex flex-col gap-1 text-sm font-black uppercase">
                    <div>{{ winner.team_name }}</div>
                    <div class="text-xs font-normal text-slate-500 dark:text-slate-400">
                      {{ winner.team_owner }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
            <UBadge
              v-else
              color="neutral"
              variant="soft"
              label="Pending..."
            />
          </td>
          <td class="p-3 text-right font-bold">
            {{ winnerWeek.points }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
