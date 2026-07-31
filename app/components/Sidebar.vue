<script setup lang="ts">
import { useAccountStore } from '@/stores/account';
import { canAccessLeagueRoute } from '../../shared/utils/leagueRouteAccess';

const accountStore = useAccountStore();
const { leagueDataPublic, teamRegistrationOpen } = useAppSettings();

const open = defineModel<boolean>('open', { default: true });

const routes = [
  {
    label: 'Players',
    icon: 'material-symbols:list-alt-outline-rounded',
    to: '/players',
  },
  {
    label: 'Teams',
    icon: 'fluent:people-team-20-regular',
    to: '/teams',
  },
  {
    label: 'Rules',
    icon: 'ic:outline-rule',
    to: '/rules',
  },
  {
    label: 'Table',
    icon: 'gravity-ui:list-ol',
    to: '/table',
  },
];

const fixturesRoute = {
  label: 'Fixtures',
  icon: 'fluent:text-bullet-list-square-edit-20-regular',
  to: '/fixtures',
};

const teamBuilderRoute = {
  label: 'Team builder',
  icon: 'i-lucide-shirt',
  to: '/team-builder',
};

const navigationItems = computed(() => {
  const visibleRoutes = routes.filter(route => canAccessLeagueRoute(
    route.to,
    leagueDataPublic.value,
    accountStore.userIsLoggedIn,
  ));
  const publicRoutes = teamRegistrationOpen.value
    ? [teamBuilderRoute, ...visibleRoutes]
    : visibleRoutes;

  return accountStore.userIsLoggedIn
    ? [...publicRoutes, fixturesRoute]
    : publicRoutes;
});

const sidebarUi = {
  root: '[--sidebar-width:16.25rem] [--sidebar-width-icon:5rem]',
  container: 'h-svh',
  inner: 'bg-brand text-slate-100 divide-white/10',
  header: 'min-h-20 p-4',
  body: 'justify-center gap-4 p-4',
  footer: 'p-4',
  rail: 'hover:after:bg-white/30',
};

const mobileMenu = {
  direction: 'bottom' as const,
  handle: false,
  ui: {
    overlay: 'bg-slate-950/60',
    content: 'max-h-[85vh] flex-col bg-brand text-slate-100 ring-0',
  },
};

const navigationUi = {
  root: 'gap-0.5',
  list: 'flex flex-col gap-0.5',
  link: 'min-h-12 overflow-hidden rounded-lg px-3 text-sm font-medium text-slate-200 before:inset-0 hover:text-white hover:before:bg-white/10 data-[active]:text-white data-[active]:before:bg-white/15 data-[collapsed=true]:h-12 data-[collapsed=true]:w-12 data-[collapsed=true]:justify-center data-[collapsed=true]:p-0',
  linkLeadingIcon: 'size-5 text-slate-200 group-hover:text-white group-data-[active]:text-white',
  linkLabel: 'text-current',
  linkTrailing: 'text-slate-300',
};

const brandButtonUi = {
  base: 'min-h-12 w-full justify-start overflow-hidden px-3',
  leadingIcon: 'size-8 text-slate-100',
  label: 'truncate text-base font-bold text-slate-100',
};

const footerButtonUi = {
  base: 'min-h-12 w-full justify-start overflow-hidden px-3',
  leadingIcon: 'size-5 text-current',
  label: 'truncate text-sm font-medium',
};
</script>

<template>
  <USidebar
    v-model:open="open"
    collapsible="icon"
    rail
    mode="drawer"
    close
    :menu="mobileMenu"
    :ui="sidebarUi"
  >
    <template #header="{ state, close }">
      <UButton
        to="/"
        icon="carbon:soccer"
        :label="state === 'expanded' ? 'League of Our Own' : undefined"
        aria-label="Home"
        color="neutral"
        variant="ghost"
        class="hover:bg-white/10 hover:text-white"
        :ui="{
          ...brandButtonUi,
          base: state === 'collapsed'
            ? 'h-12 w-12 justify-center p-0'
            : brandButtonUi.base,
        }"
      />
      <UButton
        icon="i-lucide-x"
        aria-label="Close navigation"
        color="neutral"
        variant="ghost"
        square
        class="text-slate-200 hover:bg-white/10 hover:text-white lg:hidden"
        @click="close"
      />
    </template>

    <template #default="{ state }">
      <UNavigationMenu
        :key="state"
        :items="navigationItems"
        orientation="vertical"
        :collapsed="state === 'collapsed'"
        color="neutral"
        variant="pill"
        :tooltip="{ content: { side: 'right' } }"
        :ui="navigationUi"
      />
    </template>

    <template #footer="{ state }">
      <div class="flex w-full flex-col gap-2">
        <ColorModeControl :collapsed="state === 'collapsed'" />
        <UButton
          to="/account"
          icon="uil:setting"
          :label="state === 'expanded' ? 'Account' : undefined"
          aria-label="Account settings"
          color="neutral"
          variant="ghost"
          class="text-slate-200 hover:bg-white/10 hover:text-white"
          :ui="footerButtonUi"
        />
      </div>
    </template>
  </USidebar>
</template>
