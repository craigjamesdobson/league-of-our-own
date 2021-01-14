<template>
  <nav
    class="flex flex-col items-center justify-between bg-primary p-4 h-screen sticky top-0"
  >
    <!-- SideNavBar -->

    <div class="flex items-center rounded-full">
      <!-- Header -->
      <img
        class="h-8 w-8 mr-2"
        src="~/assets/images/pl-logo.svg"
        alt="main logo"
      />
    </div>

    <ul class="flex flex-col">
      <!-- Links -->
      <li v-for="route in routes" :key="route.path">
        <nuxt-link
          :to="route.path"
          class="flex flex-col items-center justify-center transition duration-300 ease-in-out h-10 w-10 rounded-md text-base bg-indigo-800 mb-8 text-white bg-opacity-25 hover:opacity-100"
        >
          <font-awesome-icon :icon="['fa', route.icon]" />
          <span class="ml-4 capitalize hidden">{{ route.title }}</span>
        </nuxt-link>
      </li>
    </ul>

    <div class="text-white text-center">
      <!-- User info -->
      <img
        class="h-10 w-10 border-2 border-white rounded-full object-cover m-auto"
        src="https://appzzang.me/data/editor/1608/f9c387cb6bd7a0b004f975cd92cbe2d9_1471626325_6802.png"
        alt="enoshima profile"
      />
    </div>
  </nav>
</template>

<script>
import { reactive } from '@nuxtjs/composition-api'
export default {
  setup() {
    const routes = reactive([
      {
        title: 'Dashboard',
        icon: 'chart-area',
        path: '/',
      },
      {
        title: 'Teams',
        icon: 'users',
        path: '/teams',
      },
      {
        title: 'Players',
        icon: 'user-alt',
        path: '/players',
      },
    ])
    return { routes }
  },
}
</script>

<style lang="postcss" scoped>
.nuxt-link-exact-active {
  @apply bg-opacity-100;
}
</style>
