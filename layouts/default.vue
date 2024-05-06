<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
</script>

<template>
  <div class="flex flex-col-reverse md:flex-row">
    <Sidebar />
    <main
      class="bg-slate-100 flex min-h-screen w-full flex-row pb-20 transition duration-500 ease-in-out xl:pb-0"
    >
      <div class="m-5 flex w-full flex-col">
        <slot />
      </div>
    </main>
  </div>
</template>
