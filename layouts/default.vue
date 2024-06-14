<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue';
</script>

<template>
  <div class="flex flex-col-reverse md:flex-row">
    <Sidebar />
    <main
      class="flex min-h-screen w-full flex-row bg-slate-100 pb-20 transition duration-500 ease-in-out xl:pb-0"
    >
      <div class="flex w-full flex-col p-5 xl:p-10">
        <slot />
      </div>
    </main>
  </div>
</template>
