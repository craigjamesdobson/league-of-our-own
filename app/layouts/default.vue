<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
</script>

<template>
  <div class="grid xl:grid-cols-[5rem_1fr]">
    <Sidebar />
    <main
      class="flex min-h-screen flex-row bg-surface-100 pb-20 transition duration-500 ease-in-out xl:pb-0"
    >
      <div class="flex flex-1 flex-col p-5 xl:p-10">
        <slot />
      </div>
    </main>
  </div>
</template>
