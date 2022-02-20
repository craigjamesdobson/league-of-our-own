<template>
  <nav
    class="
      sticky
      top-0
      flex flex-col
      items-center
      justify-between
      h-screen
      p-4
      bg-primary
    "
  >
    <!-- SideNavBar -->

    <div class="flex items-center rounded-full">
      <!-- Header -->
      <img
        class="w-8 h-8 mr-2"
        src="~/assets/images/pl-logo.svg"
        alt="main logo"
      />
    </div>

    <div>
      <ul class="flex flex-col">
        <!-- Links -->
        <li v-for="route in routes" :key="route.path">
          <nuxt-link
            :to="route.path"
            class="
              flex flex-col
              items-center
              justify-center
              w-10
              h-10
              mb-8
              text-base text-white
              transition
              duration-300
              ease-in-out
              bg-indigo-800 bg-opacity-25
              rounded-md
              hover:opacity-100
            "
          >
            <font-awesome-icon :icon="['fa', route.icon]" />
            <span class="hidden ml-4 capitalize">{{ route.title }}</span>
          </nuxt-link>
        </li>
      </ul>

      <ul v-if="isLoggedIn" class="flex flex-col">
        <!-- Links -->
        <li v-for="route in authRoutes" :key="route.path">
          <nuxt-link
            :to="route.path"
            class="
              flex flex-col
              items-center
              justify-center
              w-10
              h-10
              mb-8
              text-base text-white
              transition
              duration-300
              ease-in-out
              bg-indigo-800 bg-opacity-25
              rounded-md
              hover:opacity-100
            "
          >
            <font-awesome-icon :icon="['fa', route.icon]" />
            <span class="hidden ml-4 capitalize">{{ route.title }}</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      v-if="!isLoggedIn"
      to="/account/login"
      class="
        flex
        items-center
        justify-center
        w-10
        h-10
        text-center
        bg-white
        rounded-full
      "
    >
      <font-awesome-icon :icon="['fa', 'sign-in-alt']" />
    </nuxt-link>
    <nuxt-link
      v-else-if="isLoggedIn"
      to="/account"
      class="
        flex
        items-center
        justify-center
        w-10
        h-10
        text-center
        bg-white
        rounded-full
      "
    >
      <font-awesome-icon class="fa-2x" :icon="['fas', 'user-circle']" />
    </nuxt-link>
  </nav>
</template>

<script>
import { reactive, useContext, computed } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { store } = useContext()
    const isLoggedIn = computed(() => store.getters.isLoggedIn)
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
      {
        title: 'Table',
        icon: 'list-ol',
        path: '/table',
      },
    ])
    const authRoutes = reactive([
      {
        title: 'Fixtures',
        icon: 'calendar-alt',
        path: '/fixtures',
      },
    ])
    return { routes, authRoutes, isLoggedIn }
  },
}
</script>

<style lang="scss" scoped>
.nuxt-link-exact-active {
  @apply bg-opacity-100;
}
</style>
