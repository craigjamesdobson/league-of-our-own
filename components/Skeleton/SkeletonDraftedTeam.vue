<template>
  <div class="rounded-sm bg-white p-4">
    <div class="flex flex-col gap-5 px-5">
      <SkeletonLoader class="h-5 w-32" />
      <SkeletonLoader class="h-5 w-20" />
      <hr>
      <div
        v-for="j in 11"
        :key="j"
        class="flex flex-row gap-5"
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
