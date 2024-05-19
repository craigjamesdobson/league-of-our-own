<script lang="ts" setup>
import { useTableStore } from '@/stores/table';

const tableStore = useTableStore();
const selectedWeek = ref(2);

onMounted(() => {
    tableStore.fetchWeeklyStats(selectedWeek.value);
})

watch(selectedWeek, (val) => {
    console.log(val)
    tableStore.fetchWeeklyStats(val);
})
</script>

<template>
    <DataTable pt:column:headercell:class="!font-black !uppercase" :value="tableStore.weeklyData" class="w-2/3">
    <Column field="team_name" header="Team">
        <template #body="slotProps">
            <div class="flex flex-col gap-1">
                <div class="font-black text-base">{{ slotProps.data.team_name }}</div>
                <div class="text-xs">{{ slotProps.data.team_owner }}</div>
            </div>
        </template>
    </Column>
    <Column field="goals" header="Goals"></Column>
    <Column field="assists" header="Assist"></Column>
    <Column field="clean_sheets" header="Clean Sheets"></Column>
    <Column field="red_cards" header="Red Cards"></Column>
    <Column field="week_points" header="Weekly Points">
        <template #body="slotProps">
            <div class="flex items-center gap-2.5">
                <div>{{ slotProps.data.week_points }}</div>
                <Icon v-if="slotProps.data.weekly_winner" size="24" class="text-yellow-500" name="tabler:star-filled" />
            </div>
        </template>
    </Column>
    <Column field="total_points" header="Points"></Column>
</DataTable>
</template>
