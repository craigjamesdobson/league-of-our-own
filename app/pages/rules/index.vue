<template>
  <div class="flex flex-col flex-wrap text-center">
    <p class="m-5">
      Unable to display PDF file?
      <UButton
        class="ml-5 mt-5 lg:inline-flex"
        label="Download here"
        icon="i-lucide-download"
        target="_blank"
        color="primary"
        href="/rules.pdf"
      />
    </p>
    <object
      class="mx-auto w-full lg:w-3/4"
      data="/rules.pdf"
    />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
object {
  height: calc(100vh - 2.5rem);
}
</style>
