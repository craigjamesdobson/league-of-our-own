<script lang="ts" setup>
import { useTableStore } from '@/stores/table';
const tableStore = useTableStore();

onMounted(() => {
    tableStore.fetchWeeklyWinners();
})
</script>

<template>
    <h2 class="text-xl font-black uppercase mb-12">Weekly Winners</h2>
    <DataTable stripedRows :value="tableStore.weeklyWinners">
        <Column class="w-1/12" field="week" header="Week"></Column>
        <Column class="w-10/12" header="Team">
            <template #body="slotProps">
                <div v-if="!!slotProps.data.points" v-for="winner in slotProps.data.top_teams">
                    <div class="flex gap-1 items-center font-black text-sm">
                        {{ winner.team_name }} -
                        <div class="text-xs font-normal"> {{ winner.team_owner }}</div>
                    </div>
                </div>
                <Tag v-else severity="secondary" value="Pending..."></Tag>
            </template>
        </Column>
        <Column class="w-1/12" field="points" header="Points"></Column>
    </DataTable>
</template>
