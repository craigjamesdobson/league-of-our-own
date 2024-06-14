<script lang="ts" setup>
import { useTableStore } from '@/stores/table';
const tableStore = useTableStore();

onMounted(() => {
  tableStore.fetchWeeklyWinners();
});
</script>

<template>
  <h2 class="mb-12 text-xl font-black uppercase">Weekly Winners</h2>
  <DataTable striped-rows :value="tableStore.weeklyWinners">
    <Column class="w-1/12" field="week" header="Week"></Column>
    <Column class="w-10/12" header="Team">
      <template #body="slotProps">
        <template v-if="!!slotProps.data.points">
          <div v-for="(winner, index) in slotProps.data.top_teams" :key="index">
            <div class="flex items-center gap-1 text-sm font-black">
              {{ winner.team_name }} -
              <div class="text-xs font-normal">{{ winner.team_owner }}</div>
            </div>
          </div>
        </template>
        <Tag v-else severity="secondary" value="Pending..."></Tag>
      </template>
    </Column>
    <Column class="w-1/12" field="points" header="Points"></Column>
  </DataTable>
</template>
