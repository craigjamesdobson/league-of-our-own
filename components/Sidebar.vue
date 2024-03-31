<script setup>
const routes = reactive([
  {
    title: 'Dashboard',
    icon: 'material-symbols:home-outline-rounded',
    path: '/'
  },
  {
    title: 'Players',
    icon: 'material-symbols:list-alt-outline-rounded',
    path: '/players'
  },
  {
    title: 'Teams',
    icon: 'fluent:people-team-24-regular',
    path: '/teams'
  },
  {
    title: 'Rules',
    icon: 'ic:outline-rule',
    path: '/rules'
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
      <Icon class="text-offWhite" size="48" name="carbon:soccer" />
    </div>

    <div>
      <ul class="flex gap-4 xl:flex-col">
        <!-- Links -->
        <li v-for="route in routes" :key="route.title">
          <nuxt-link
            :to="route.path"
            class="text-offWhite border-offWhite hover:bg-offWhite hover:text-primary flex h-10 w-10 flex-col items-center justify-center rounded-xl border text-base transition duration-300 ease-in-out xl:mb-8"
          >
            <Icon size="24" :name="route.icon" />
            <span class="ml-4 hidden capitalize">{{ route.name }}</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      to="/account"
      class="text-offWhite border-offWhite hover:text-primary flex h-10 w-10 flex-col items-center justify-center rounded-full border text-base transition duration-300 ease-in-out hover:bg-white"
    >
      <Icon name="uil:setting" />
    </nuxt-link>
  </nav>
</template>

<style scoped>
.router-link-exact-active {
  @apply bg-offWhite text-primary;
}
</style>
