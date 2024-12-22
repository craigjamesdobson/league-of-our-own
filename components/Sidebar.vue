<script setup>
import { useAccountStore } from '@/stores/account';

const accountStore = useAccountStore();

const routes = reactive([
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
    icon: 'gravity-ui:list-ol',
    path: '/table',
    admin: false,
  },
]);
</script>

<template>
  <nav
    class="bg-primary fixed bottom-0 z-10 flex w-full items-center justify-between p-4 xl:sticky xl:top-0 xl:h-screen xl:w-auto xl:flex-col"
  >
    <!-- SideNavBar -->

    <nuxt-link
      to="/"
      class="logo flex items-center rounded-full"
    >
      <!-- Header -->
      <Icon
        class="text-slate-100"
        size="32"
        name="carbon:soccer"
      />
    </nuxt-link>

    <div>
      <ul class="flex gap-4 xl:flex-col">
        <!-- Links -->
        <li
          v-for="route in routes"
          :key="route.title"
        >
          <nuxt-link
            :to="route.path"
            class="hover:text-primary flex h-10 w-10 flex-col items-center justify-center rounded-xl border-slate-100 text-base text-slate-100 transition duration-300 ease-in-out hover:bg-slate-100 lg:border xl:mb-8"
          >
            <Icon
              size="24"
              :name="route.icon"
            />
            <span class="ml-4 hidden capitalize">{{ route.name }}</span>
          </nuxt-link>
        </li>
        <li v-if="accountStore.userIsLoggedIn">
          <nuxt-link
            to="/fixtures"
            class="hover:text-primary flex h-10 w-10 flex-col items-center justify-center rounded-xl text-base text-slate-100 transition duration-300 ease-in-out hover:bg-slate-100 lg:border lg:border-slate-100 xl:mb-8"
          >
            <Icon
              size="24"
              name="fluent:text-bullet-list-square-edit-20-regular"
            />
            <span class="ml-4 hidden capitalize">Fixtures</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      to="/account"
      class="hover:text-primary flex h-8 w-8 flex-col items-center justify-center rounded-full border border-slate-100 text-base text-slate-100 transition duration-300 ease-in-out hover:bg-white lg:h-10 lg:w-10"
    >
      <Icon name="uil:setting" />
    </nuxt-link>
  </nav>
</template>

<style scoped>
.router-link-active:not(.logo) {
  @apply bg-neutral-200 text-primary;
}
</style>
