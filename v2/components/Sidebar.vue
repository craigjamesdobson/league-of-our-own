<template>
  <nav
    class="sticky top-0 flex flex-col items-center justify-between h-screen p-4 bg-primary"
  >
    <!-- SideNavBar -->

    <div class="flex items-center rounded-full">
      <!-- Header -->
      <Icon class="text-offWhite" size="48" name="carbon:soccer" />
    </div>

    <div>
      <ul class="flex flex-col">
        <!-- Links -->
        <li>
          <nuxt-link
            to="/"
            class="flex flex-col items-center justify-center w-10 h-10 mb-8 text-base text-offWhite transition duration-300 ease-in-out border border-offWhite rounded-md hover:bg-offWhite hover:text-primary"
          >
            <Icon size="24" name="material-symbols:home-outline-rounded" />
            <span class="hidden ml-4 capitalize">Dashboard</span>
          </nuxt-link>
          <nuxt-link
            to="/players"
            class="flex flex-col items-center justify-center w-10 h-10 mb-8 text-base text-offWhite transition duration-300 ease-in-out border border-offWhite rounded-md hover:bg-offWhite hover:text-primary"
          >
            <Icon size="24" name="material-symbols:list-alt-outline-rounded" />
            <span class="hidden ml-4 capitalize">Players</span>
          </nuxt-link>
          <nuxt-link
            to="/teams"
            class="flex flex-col items-center justify-center w-10 h-10 mb-8 text-base text-offWhite transition duration-300 ease-in-out border border-offWhite rounded-md hover:bg-offWhite hover:text-primary"
          >
            <Icon size="24" name="fluent:people-team-24-regular" />
            <span class="hidden ml-4 capitalize">Teams</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      v-if="!isLoggedIn"
      to="/account"
      class="flex flex-col items-center justify-center w-10 h-10 text-base text-offWhite transition duration-300 ease-in-out border border-offWhite rounded-full hover:bg-offWhite hover:text-primary"
    >
      <Icon name="uil:setting" size="24"></Icon>
    </nuxt-link>
    <nuxt-link
      v-else-if="isLoggedIn"
      to="/account"
      class="flex flex-col items-center justify-center w-10 h-10 text-base text-offWhite transition duration-300 ease-in-out border border-offWhite rounded-full hover:bg-white hover:text-primary"
    >
      <Icon name="uil:setting"></Icon>
    </nuxt-link>
  </nav>
</template>

<script setup></script>

<style scoped>
.router-link-exact-active {
  @apply bg-offWhite text-primary;
}
</style>
