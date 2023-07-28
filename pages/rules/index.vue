<template>
  <div class="flex flex-col flex-wrap text-center">
    <p class="m-5">
      Unable to display PDF file?
      <a
        class="block px-6 py-2 mt-5 ml-5 text-white rounded-md lg:inline-flex bg-primary"
        href="/2023-2024-rules.pdf"
        >Download here</a
      >
    </p>
    <object
      class="w-full mx-auto lg:w-3/4"
      data="/2023-2024-rules.pdf"
    ></object>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
object {
  height: calc(100vh - 2.5rem);
}
</style>
