<script setup>
import { useAccountStore } from '@/stores/account';

const accountStore = useAccountStore();

const routes = reactive([
  {
    title: 'Dashboard',
    icon: 'material-symbols:home-outline-rounded',
    path: '/',
    admin: false,
  },
  {
    title: 'Players',
    icon: 'material-symbols:list-alt-outline-rounded',
    path: '/players',
    admin: false,
  },
  {
    title: 'Teams',
    icon: 'fluent:people-team-24-regular',
    path: '/teams',
    admin: false,
  },
  {
    title: 'Rules',
    icon: 'ic:outline-rule',
    path: '/rules',
    admin: false,
  },
  {
    title: 'Table',
    icon: 'gg:list',
    path: '/table',
    admin: false,
  }
]);
</script>

<template>
  <nav
    class="bg-primary fixed bottom-0 z-10 flex w-full items-center justify-between p-4 xl:sticky xl:top-0 xl:h-screen xl:w-auto xl:flex-col"
  >
    <!-- SideNavBar -->

    <div class="flex items-center rounded-full">
      <!-- Header -->
      <Icon class="text-slate-100" size="48" name="carbon:soccer" />
    </div>

    <div>
      <ul class="flex gap-4 xl:flex-col">
        <!-- Links -->
        <li v-for="route in routes" :key="route.title">
          <nuxt-link
            :to="route.path"
            class="text-slate-100 border-slate-100 hover:bg-slate-100 hover:text-primary flex h-10 w-10 flex-col items-center justify-center rounded-xl border text-base transition duration-300 ease-in-out xl:mb-8"
          >
            <Icon size="24" :name="route.icon" />
            <span class="ml-4 hidden capitalize">{{ route.name }}</span>
          </nuxt-link>
        </li>
        <li v-if="accountStore.userIsLoggedIn">
          <nuxt-link
            to="/fixtures"
            class="text-slate-100 border-slate-100 hover:bg-slate-100 hover:text-primary flex h-10 w-10 flex-col items-center justify-center rounded-xl border text-base transition duration-300 ease-in-out xl:mb-8"
          >
            <Icon size="24" name="fluent:text-bullet-list-square-edit-20-regular" />
            <span class="ml-4 hidden capitalize">Fixtures</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      to="/account"
      class="text-slate-100 border-slate-100 hover:text-primary flex h-10 w-10 flex-col items-center justify-center rounded-full border text-base transition duration-300 ease-in-out hover:bg-white"
    >
      <Icon name="uil:setting" />
    </nuxt-link>
  </nav>
</template>

<style scoped>
.router-link-exact-active {
  @apply bg-slate-100 text-primary;
}
</style>
