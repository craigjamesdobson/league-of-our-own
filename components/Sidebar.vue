<script setup>
const routes = reactive([
  {
    title: 'Dashboard',
    icon: 'material-symbols:home-outline-rounded',
    path: '/',
  },
  {
    title: 'Players',
    icon: 'material-symbols:list-alt-outline-rounded',
    path: '/players',
  },
  {
    title: 'Teams',
    icon: 'fluent:people-team-24-regular',
    path: '/teams',
  },
  {
    title: 'Rules',
    icon: 'ic:outline-rule',
    path: '/rules',
  },
]);
</script>

<template>
  <nav
    class="fixed bottom-0 z-10 flex items-center justify-between w-full p-4 xl:flex-col xl:sticky xl:top-0 xl:h-screen xl:w-auto bg-primary"
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
            class="flex flex-col items-center justify-center w-10 h-10 text-base transition duration-300 ease-in-out border rounded-xl xl:mb-8 text-offWhite border-offWhite hover:bg-offWhite hover:text-primary"
          >
            <Icon size="24" :name="route.icon" />
            <span class="hidden ml-4 capitalize">{{ route.name }}</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      to="/account"
      class="flex flex-col items-center justify-center w-10 h-10 text-base transition duration-300 ease-in-out border rounded-full text-offWhite border-offWhite hover:bg-white hover:text-primary"
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
