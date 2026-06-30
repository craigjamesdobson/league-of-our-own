<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
import { useAppSettings } from '~/composables/useAppSettings';
import { useTableStore } from '~/stores/table';
import type { WeeklyData } from '~/types/Table';

const route = useRoute();
const appSettings = useAppSettings();
const tableStore = useTableStore();

const publicFinaleRoutes = new Set(['/', '/players', '/teams', '/rules', '/table']);

const seasonComplete = ref(false);
const finaleDismissed = ref(false);
const finalStandings = ref<WeeklyData[]>([]);

const isPublicFinaleRoute = computed(() => publicFinaleRoutes.has(route.path));
const finaleVisible = computed({
  get: () => seasonComplete.value && isPublicFinaleRoute.value && finalStandings.value.length > 0 && !finaleDismissed.value,
  set: (value: boolean) => {
    if (!value) {
      finaleDismissed.value = true;
    }
  },
});

onMounted(async () => {
  try {
    seasonComplete.value = await appSettings.getSeasonComplete();

    if (!seasonComplete.value) {
      return;
    }

    const currentGameweek = await appSettings.getCurrentGameweek();
    const standings = await tableStore.fetchFinalStandings(currentGameweek);
    finalStandings.value = standings.slice(0, 5);
  }
  catch (error) {
    console.error('Failed to load season finale dialog:', error);
  }
});
</script>

<template>
  <div class="grid xl:grid-cols-[5rem_1fr]">
    <Sidebar />
    <main
      class="flex min-h-screen flex-row bg-surface-100 pb-20 transition duration-500 ease-in-out dark:bg-slate-950 xl:pb-0"
    >
      <div class="flex flex-1 flex-col p-5 xl:p-10">
        <slot />
      </div>
    </main>
    <SeasonFinaleDialog
      v-model:visible="finaleVisible"
      :standings="finalStandings"
    />
  </div>
</template>
