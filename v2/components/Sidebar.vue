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
        <li v-for="route in routes">
          <nuxt-link
            :to="route.path"
            class="flex flex-col items-center justify-center w-10 h-10 mb-8 text-base text-offWhite transition duration-300 ease-in-out border border-offWhite rounded-md hover:bg-offWhite hover:text-primary"
          >
            <Icon size="24" :name="route.icon" />
            <span class="hidden ml-4 capitalize">{{ route.name }}</span>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <nuxt-link
      v-if="!isLoggedIn"
      to="/account"
      class="flex flex-col items-center justify-center w-10 h-10 text-base text-offWhite rounded-full transition duration-300 ease-in-out hover:bg-offWhite hover:text-primary"
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

<script setup>
const routes = reactive([
  {
    title: "Dashboard",
    icon: "material-symbols:home-outline-rounded",
    path: "/",
  },
  {
    title: "Players",
    icon: "material-symbols:list-alt-outline-rounded",
    path: "/players",
  },
  {
    title: "Teams",
    icon: "fluent:people-team-24-regular",
    path: "/teams",
  },
]);
</script>

<style scoped>
.router-link-exact-active {
  @apply bg-offWhite text-primary;
}
</style>
