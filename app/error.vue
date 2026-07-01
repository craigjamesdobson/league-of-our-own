<script setup lang="ts">
import type { NuxtError } from '#app';

const { error } = defineProps({
  error: Object as () => NuxtError,
});

const handleClearError = () => clearError({ redirect: '/' });
const handleRetry = () => clearError();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-6 dark:bg-slate-900 dark:border dark:border-slate-700">
      <div class="text-center">
        <Icon
          name="carbon:warning"
          size="64"
          class="mx-auto text-red-400 mb-4"
        />

        <h1 class="text-3xl font-bold text-gray-900 mb-2 dark:text-slate-100">
          {{ error?.statusCode || 'Error' }}
        </h1>

        <h2 class="text-xl font-semibold text-gray-700 mb-4 dark:text-slate-200">
          {{ error?.statusMessage || 'Something went wrong' }}
        </h2>

        <p class="text-gray-600 mb-6 dark:text-slate-300">
          {{ error?.message || 'An unexpected error occurred. Please try again or contact support if the problem persists.' }}
        </p>

        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <UButton
            label="Try Again"
            icon="i-lucide-refresh-cw"
            @click="handleRetry"
          />
          <UButton
            label="Go Home"
            color="neutral"
            variant="soft"
            icon="i-lucide-home"
            @click="handleClearError"
          />
        </div>
      </div>
    </div>
  </div>
</template>
