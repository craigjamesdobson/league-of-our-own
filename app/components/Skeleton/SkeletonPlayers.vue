<template>
  <div>
    <h1 class="main-heading">
      Loading...
    </h1>

    <!-- Mobile: card-shaped skeletons -->
    <div class="md:hidden flex flex-col gap-2">
      <div
        v-for="i in 10"
        :key="i"
        class="p-3 border border-surface-200 rounded-lg flex flex-col gap-3"
      >
        <div class="flex gap-3 items-center">
          <SkeletonLoader
            type="circle"
            class="h-10 w-10 shrink-0"
          />
          <div class="flex-1 flex flex-col gap-1.5">
            <SkeletonLoader class="h-3 w-24" />
            <SkeletonLoader class="h-4 w-32" />
          </div>
          <SkeletonLoader class="h-5 w-16 rounded-full" />
        </div>
        <div class="flex gap-4 pt-2 border-t border-surface-100">
          <SkeletonLoader class="h-8 w-10" />
          <SkeletonLoader class="h-8 w-10" />
          <SkeletonLoader class="h-8 w-10" />
          <SkeletonLoader class="h-8 w-10" />
        </div>
      </div>
    </div>

    <!-- Desktop: existing layout -->
    <div class="hidden md:grid grid-cols-2 gap-3">
      <div
        v-for="i in 50"
        :key="i"
        class="mb-2 flex flex-row gap-5"
      >
        <SkeletonLoader class="h-5 w-1/12" />
        <SkeletonLoader
          type="circle"
          class="h-5 w-5"
        />
        <SkeletonLoader class="h-5 w-2/12" />
        <SkeletonLoader class="h-5 w-5/12" />
        <SkeletonLoader class="h-5 w-2/12" />
      </div>
    </div>
  </div>
</template>
