<template>
  <h1 class="main-heading">Loading...</h1>
  <div class="grid gap-5 p-5 mt-5 lg:grid-cols-2 xl:grid-cols-4">
    <div v-for="i in 8" :key="i" class="flex flex-col gap-5 px-5 mb-5">
      <SkeletonLoader class="w-32 h-5" />
      <SkeletonLoader class="w-20 h-5" />
      <hr />
      <div v-for="j in 11" :key="j" class="flex flex-row gap-5">
        <SkeletonLoader class="w-1/12 h-5" />
        <SkeletonLoader type="circle" class="w-5 h-5" />
        <SkeletonLoader class="w-2/12 h-5" />
        <SkeletonLoader class="w-5/12 h-5" />
        <SkeletonLoader class="w-2/12 h-5" />
      </div>
    </div>
  </div>
</template>
