<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
import { useFixtureStore } from '~/stores/fixtures';

type PageHeaderState = {
  title?: string;
  subtitle?: string;
};

const route = useRoute();
const fixtureStore = useFixtureStore();

const sidebarOpen = ref(false);
const pageHeader = useState<PageHeaderState>('page-header', () => ({}));
const routeTitles: Record<string, string> = {
  '/': 'Summary Dashboard',
  '/players': 'Players',
  '/teams': 'Teams',
  '/rules': 'Rules',
  '/table': 'Table',
  '/fixtures': 'Fixtures',
  '/account': 'Admin Dashboard',
  '/account/login': 'Admin Dashboard',
  '/team-builder': 'Team builder',
};

const fixtureId = computed(() => {
  const id = route.params.id;
  const routeId = Array.isArray(id) ? id[0] : id;

  if (!route.path.startsWith('/fixtures/') || !routeId) {
    return null;
  }

  const parsedId = Number(routeId);

  return Number.isNaN(parsedId) ? null : parsedId;
});
const routeFixture = computed(() => {
  if (!fixtureId.value) {
    return null;
  }

  return fixtureStore.fixtures?.find(fixture => fixture.id === fixtureId.value) ?? null;
});
const fixtureTitle = computed(() => {
  if (!routeFixture.value) {
    return null;
  }

  return `${routeFixture.value.home_team.name} vs ${routeFixture.value.away_team.name}`;
});
const pageTitle = computed(() => {
  if (pageHeader.value.title) {
    return pageHeader.value.title;
  }

  if (fixtureTitle.value) {
    return fixtureTitle.value;
  }

  if (typeof route.meta.title === 'string') {
    return route.meta.title;
  }

  if (fixtureId.value) {
    return 'Fixture';
  }

  return routeTitles[route.path] ?? 'League of Our Own';
});
const pageSubtitle = computed(() => {
  if (pageHeader.value.subtitle) {
    return pageHeader.value.subtitle;
  }

  if (fixtureId.value && fixtureTitle.value) {
    return `Fixture ${fixtureId.value}`;
  }

  return undefined;
});
watch(
  () => route.fullPath,
  () => {
    pageHeader.value = {};
  },
  { flush: 'sync' },
);
</script>

<template>
  <div class="flex min-h-screen">
    <Sidebar v-model:open="sidebarOpen" />
    <main
      class="flex min-h-screen min-w-0 flex-1 flex-col bg-surface-100 transition duration-500 ease-in-out dark:bg-slate-950"
    >
      <header class="sticky top-0 z-10 flex min-h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/90 px-5 py-2 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 xl:px-10">
        <UButton
          icon="i-lucide-menu"
          color="neutral"
          variant="ghost"
          square
          aria-label="Open navigation"
          class="xl:hidden"
          @click="sidebarOpen = !sidebarOpen"
        />
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          square
          aria-label="Toggle sidebar"
          class="hidden xl:inline-flex"
          @click="sidebarOpen = !sidebarOpen"
        />
        <div class="min-w-0">
          <p class="truncate text-2xl font-black uppercase tracking-wider text-slate-900 dark:text-slate-100">
            {{ pageTitle }}
          </p>
          <p
            v-if="pageSubtitle"
            class="truncate text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400"
          >
            {{ pageSubtitle }}
          </p>
        </div>
      </header>

      <div class="flex flex-1 flex-col p-5 xl:p-10">
        <slot />
      </div>
    </main>
  </div>
</template>
