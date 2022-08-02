<template>
  <nav
    class="sticky top-0 flex flex-col items-center justify-between h-screen p-4 bg-primary"
  >
    <!-- SideNavBar -->

    <div class="flex items-center rounded-full">
      <!-- Header -->
      <LogoIcon class="h-10 w-10 fill-white" />
    </div>

    <div>
      <ul class="flex flex-col">
        <!-- Links -->
        <li>
          <nuxt-link
            to="/players"
            class="flex flex-col items-center justify-center w-10 h-10 mb-8 text-base text-white transition duration-300 ease-in-out bg-indigo-800 bg-opacity-25 rounded-md hover:opacity-100"
          >
            <IcRoundGroups></IcRoundGroups>
            <span class="hidden ml-4 capitalize">Players</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      v-if="!isLoggedIn"
      to="/account"
      class="flex items-center justify-center w-10 h-10 text-center bg-white rounded-full"
    >
      <UiwLogin></UiwLogin>
    </nuxt-link>
    <nuxt-link
      v-else-if="isLoggedIn"
      to="/account"
      class="flex items-center justify-center w-10 h-10 text-center bg-white rounded-full"
    >
      <PhUserCircleDuotone></PhUserCircleDuotone>
    </nuxt-link>
  </nav>
</template>

<script setup>
import { reactive } from 'vue';
import LogoIcon from './icons/LogoIcon.vue';
import PhUserCircleDuotone from '~icons/ph/user-circle-duotone';
import UiwLogin from '~icons/uiw/login';
import IcRoundGroups from '~icons/ic/round-groups';

const routes = reactive([
  {
    title: 'Players',
    icon: 'IcRoundGroups',
    path: '/players',
  },
]);
</script>

<style scoped>
.nuxt-link-exact-active {
  @apply bg-opacity-100;
}
</style>
