<template>
  <div class="rounded-sm border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
    <div class="flex flex-col gap-5 px-5">
      <USkeleton class="h-5 w-32" />
      <USkeleton class="h-5 w-20" />
      <hr>
      <div
        v-for="j in 11"
        :key="j"
        class="flex flex-row gap-5"
      >
        <USkeleton class="h-5 w-1/12" />
        <USkeleton class="h-5 w-5 rounded-full" />
        <USkeleton class="h-5 w-2/12" />
        <USkeleton class="h-5 w-5/12" />
        <USkeleton class="h-5 w-2/12" />
      </div>
    </div>
  </div>
</template>
