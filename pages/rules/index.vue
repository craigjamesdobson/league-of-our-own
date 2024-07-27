<template>
  <div class="flex flex-col flex-wrap text-center">
    <p class="m-5">
      Unable to display PDF file?
      <a
        class="bg-primary ml-5 mt-5 block rounded-md px-6 py-2 text-white lg:inline-flex"
        href="/rules.pdf"
        >Download here</a
      >
    </p>
    <object
      class="mx-auto w-full lg:w-3/4"
      data="/rules.pdf"
    ></object>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
object {
  height: calc(100vh - 2.5rem);
}
</style>
