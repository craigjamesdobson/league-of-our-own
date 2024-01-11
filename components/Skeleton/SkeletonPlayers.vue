<template>
  <div>
    <h1 class="main-heading">Loading...</h1>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div v-for="i in 50" :key="i" class="flex flex-row gap-5 mb-2">
        <SkeletonLoader class="w-1/12 h-5" />
        <SkeletonLoader type="circle" class="w-5 h-5" />
        <SkeletonLoader class="w-2/12 h-5" />
        <SkeletonLoader class="w-5/12 h-5" />
        <SkeletonLoader class="w-2/12 h-5" />
      </div>
    </div>
  </div>
</template>
