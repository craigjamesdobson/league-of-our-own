<template>
  <div class="flex justify-around">
    <div class="flex flex-col items-center gap-2.5">
      <Skeleton
        shape="circle"
        size="4rem"
      />
      <Skeleton width="5rem" />
      <Skeleton width="2rem" />
    </div>
    <div class="flex flex-col items-center gap-2.5">
      <Skeleton
        shape="circle"
        size="4rem"
      />
      <Skeleton width="5em" />
      <Skeleton width="2rem" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped></style>
