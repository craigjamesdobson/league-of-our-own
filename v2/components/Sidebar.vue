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
      <LogoIcon class='h-8 w-8 fill-white'/>
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
    </div>

    <!-- <nuxt-link
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
    </nuxt-link> -->
  </nav>
</template>

<script setup>
import { reactive } from 'vue';
import LogoIcon from './icons/LogoIcon.vue'

    const routes = reactive([
      {
        title: 'Players',
        icon: 'user-alt',
        path: '/players',
      }
    ])
</script>

<style scoped>
.nuxt-link-exact-active {
  @apply bg-opacity-100;
}
</style>
