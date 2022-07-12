<template>
  <div class="flex flex-row">
    <Sidebar></Sidebar>
    <main
      class="
        flex flex-row
        w-full
        transition
        duration-500
        ease-in-out
        bg-offWhite
        dark:bg-gray-700
      "
    >
      
      <div class="flex flex-col w-full m-5">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang='ts'>
  import Sidebar from '@/components/Sidebar.vue'
</script>