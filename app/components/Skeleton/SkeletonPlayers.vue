<template>
  <div class="rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div class="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <div class="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div class="space-y-2">
          <USkeleton class="h-6 w-28" />
          <USkeleton class="h-4 w-36" />
        </div>
        <div class="flex flex-wrap gap-2">
          <USkeleton
            v-for="i in 5"
            :key="`position-${i}`"
            class="h-8 w-16"
          />
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <USkeleton
          v-for="i in 4"
          :key="`availability-${i}`"
          class="h-8 w-24"
        />
      </div>
    </div>

    <div class="overflow-x-auto">
      <div class="min-w-[760px]">
        <div class="grid grid-cols-[80px_minmax(220px,1fr)_120px_120px_96px_176px_112px] gap-4 border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
          <USkeleton
            v-for="i in 7"
            :key="`heading-${i}`"
            class="h-4"
          />
        </div>
        <div
          v-for="i in 10"
          :key="`player-${i}`"
          class="grid grid-cols-[80px_minmax(220px,1fr)_120px_120px_96px_176px_112px] items-center gap-4 border-b border-slate-100 p-3 dark:border-slate-800"
        >
          <USkeleton class="h-4 w-10" />
          <div class="flex items-center gap-3">
            <USkeleton class="h-9 w-9 rounded-full" />
            <div class="space-y-2">
              <USkeleton class="h-4 w-28" />
              <USkeleton class="h-3 w-44" />
            </div>
          </div>
          <USkeleton class="h-6 w-14" />
          <USkeleton class="h-6 w-16" />
          <USkeleton class="h-4 w-12 justify-self-end" />
          <USkeleton class="h-6 w-24" />
          <USkeleton class="h-4 w-16 justify-self-end" />
        </div>
      </div>
    </div>
  </div>
</template>
