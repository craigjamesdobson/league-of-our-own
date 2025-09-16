<script setup lang="ts">
import type { NuxtError } from '#app';

const { error } = defineProps({
  error: Object as () => NuxtError,
});

const handleClearError = () => clearError({ redirect: '/' });
const handleRetry = () => clearError();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
      <div class="text-center">
        <Icon
          name="carbon:warning"
          size="64"
          class="mx-auto text-red-400 mb-4"
        />

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          {{ error?.statusCode || 'Error' }}
        </h1>

        <h2 class="text-xl font-semibold text-gray-700 mb-4">
          {{ error?.statusMessage || 'Something went wrong' }}
        </h2>

        <p class="text-gray-600 mb-6">
          {{ error?.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.' }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            label="Try Again"
            icon="pi pi-refresh"
            @click="handleRetry"
          />
          <Button
            label="Go Home"
            severity="secondary"
            icon="pi pi-home"
            @click="handleClearError"
          />
        </div>
      </div>
    </div>
  </div>
</template>
