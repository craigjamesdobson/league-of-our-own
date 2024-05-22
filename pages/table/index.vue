<script lang="ts" setup>
import { useTableStore } from '@/stores/table';

const route = useRoute();
const router = useRouter();
const tableStore = useTableStore();
const weeks = ref(Array.from({ length: 38 }, (_, index) => index + 1));
const selectedWeek = ref(+route.query.week || 1);

onMounted(() => {
    tableStore.fetchWeeklyStats(selectedWeek.value);
})

watch(selectedWeek, async (newWeek) => {
    await tableStore.fetchWeeklyStats(newWeek);
    await router.push({
        path: 'table',
        query: { week: newWeek }
    });
})
</script>

<template>

    <div class="grid grid-cols-6 gap-10">
        <div class="col-span-4">
            <div class="flex justify-between">
                <h1 class="text-2xl font-black uppercase mb-5">Week {{ selectedWeek }}</h1>
                <div class="flex flex-col gap-2.5 mb-5 items-end">
                    <label class="font-bold uppercase" for="gameweeks">Select a game week</label>
                    <div class="flex gap-2.5">
                        <Dropdown v-model="selectedWeek" :options="weeks" placeholder="Select a gameweek"
                            scroll-height="400">
                            <template #value="slotProps">
                                <div class="flex items-center">
                                    <div>WEEK {{ slotProps.value }}</div>
                                </div>
                            </template>
                            <template #option="slotProps">
                                <div class="flex items-center">
                                    <div>WEEK {{ slotProps.option }}</div>
                                </div>
                            </template>
                        </Dropdown>
                    </div>
                </div>
            </div>
            <DataTable stripedRows :value="tableStore.weeklyData">
                <Column field="index">
                    <template #header="">
                        <div v-tooltip.click.top="'Current Position'">Pos.</div>
                    </template>
                    <template #body="slotProps">
                        <div>{{ slotProps.index + 1 }}</div>
                    </template>
                </Column>
                <Column field="prev_week_position">
                    <template #header>
                        <div v-tooltip.top="'Previous Position'">Prv Pos.</div>
                    </template>
                    <template #body="slotProps">
                        <div class="grid grid-cols-[35px_auto]">
                            <div>{{ slotProps.data.prev_week_position }}</div>
                            <div v-if="slotProps.data.prev_week_position < slotProps.index + 1">
                                <Icon size="16" class="text-red-500" name="flowbite:caret-down-solid" />
                            </div>
                            <div v-if="slotProps.data.prev_week_position > slotProps.index + 1">
                                <Icon size="16" class="text-green-500" name="flowbite:caret-up-solid" />
                            </div>
                            <div v-if="slotProps.data.prev_week_position === slotProps.index + 1">
                                <Icon size="20" class="text-primary" name="radix-icons:dot-filled" />
                            </div>
                        </div>
                    </template>
                </Column>
                <Column field="team_name" header="Team">
                    <template #body="slotProps">
                        <div class="flex flex-col gap-1">
                            <div class="font-black text-base">{{ slotProps.data.team_name }}</div>
                            <div class="text-xs">{{ slotProps.data.team_owner }}</div>
                        </div>
                    </template>
                </Column>
                <Column field="goals" header="Goals"></Column>
                <Column field="assists" header="Assists"></Column>
                <Column field="clean_sheets">
                    <template #header>
                        <div v-tooltip.top="'Total clean sheets'">CS.</div>
                    </template>
                </Column>
                <Column field="red_cards">
                    <template #header>
                        <div v-tooltip.top="'Total red cards'">RC.</div>
                    </template>
                </Column>
                <Column field="week_points">
                    <template #header>
                        <div v-tooltip.top="'Weekly points total'">Wk Pts.</div>
                    </template>
                    <template #body="slotProps">
                        <div class="flex items-center gap-2.5">
                            <div>{{ slotProps.data.week_points }}</div>
                            <Icon v-if="slotProps.data.weekly_winner" size="16" class="text-yellow-500"
                                name="tabler:star-filled" />
                        </div>
                    </template>
                </Column>
                <Column field="total_points">
                    <template #header>
                        <div v-tooltip.top="'Total Points'">Tot Pts.</div>
                    </template>
                </Column>
            </DataTable>
        </div>
        <div class="flex flex-col gap-2.5 col-span-2">
            <WeeklyWinners />
        </div>
    </div>
</template>
