<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
</script>

<template>
  <div class="flex flex-col-reverse md:flex-row">
    <Sidebar />
    <main
      class="flex flex-row w-full min-h-screen transition duration-500 ease-in-out bg-offWhite dark:bg-gray-700"
    >
      <div class="flex flex-col w-full m-5">
        <slot />
      </div>
    </main>
  </div>
</template>
