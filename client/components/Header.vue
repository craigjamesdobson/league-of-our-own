<template>
  <div
    class="sticky top-0 z-50 w-full p-4 mb-2 bg-white border-b-2 border-gray-300 "
  >
    <div>
      <h1 class="text-2xl">{{ headingTitle }}</h1>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    headingTitle: {
      default: 'Page Title',
      type: String,
    },
  },
}
</script>
