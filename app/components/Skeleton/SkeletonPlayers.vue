<template>
  <div>
    <h1 class="main-heading">
      Loading...
    </h1>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
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
