<script setup lang="ts">
defineProps({
  title: {
    type: String,
    required: false,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <Card class="dashboard-card h-full">
    <template
      v-if="title"
      #title
    >
      <div class="flex items-center gap-2 text-slate-800">
        <i class="pi pi-chart-line text-primary" />
        <span class="font-bold text-lg">{{ title }}</span>
      </div>
    </template>

    <template #content>
      <div
        v-if="isLoading"
        class="flex justify-center items-center py-12"
      >
        <ProgressSpinner
          style="width:50px;height:50px"
          stroke-width="4"
          animation-duration=".8s"
        />
      </div>
      <div
        v-else
        class="h-full flex flex-col"
      >
        <slot />
      </div>
    </template>
  </Card>
</template>

<style scoped>
.dashboard-card {
  @apply flex flex-col;
}

.dashboard-card :deep(.p-card-body) {
  @apply flex-1 flex flex-col;
}

.dashboard-card :deep(.p-card-content) {
  @apply h-full flex flex-col;
}
</style>
