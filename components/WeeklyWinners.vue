<script lang="ts" setup>
import { useTableStore } from '@/stores/table';
const tableStore = useTableStore();

onMounted(() => {
  tableStore.fetchWeeklyWinners();
});
</script>

<template>
  <h2 class="mb-5 lg:mb-12 text-xl font-black uppercase">Weekly Winners</h2>
  <DataTable striped-rows :value="tableStore.weeklyWinners">
    <Column class="w-1/12" field="week" header="Week"></Column>
    <Column class="w-10/12" header="Team">
      <template #body="slotProps">
        <template v-if="!!slotProps.data.points">
          <div class="flex flex-col gap-2.5">
            <div v-for="(winner, index) in slotProps.data.top_teams" :key="index">
              <div class="flex flex-col gap-1 text-sm font-black uppercase">
                <div>{{ winner.team_name }}</div>
                <div class="text-xs font-normal">{{ winner.team_owner }}</div>
              </div>
            </div>
          </div>
        </template>
        <Tag v-else severity="secondary" value="Pending..."></Tag>
      </template>
    </Column>
    <Column class="w-1/12" field="points" header="Points"></Column>
  </DataTable>
</template>
