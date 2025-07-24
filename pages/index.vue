<template>
  <div class="min-h-full flex items-center justify-center px-4 -m-5 xl:-m-10">
    <div class="text-center max-w-xl">
      <div class="mb-8 inline-flex items-center justify-center w-24 h-24 bg-slate-200 rounded-full border border-slate-300 shadow-md">
        <Icon
          class="text-slate-800"
          size="40"
          name="carbon:soccer"
        />
      </div>
      <h1 class="mb-4 text-5xl font-black font-display uppercase text-slate-800">
        League of our own
      </h1>
      <div class="mb-6 inline-block px-4 py-2 border border-primary text-primary text-sm font-medium tracking-wide rounded-full">
        ESTABLISHED 1989/1990
      </div>

      <div class="flex flex-col gap-5 mt-10">
        <h2 class="text-3xl font-bold text-primary">
          Here we go again!
        </h2>
        <p class="text-lg text-slate-600">
          Ready for the 2025-2026 season?
        </p>

        <NuxtLink to="/team-builder">
          <Button
            severity="primary"
            size="large"
            label="Submit Your Team"
            class="w-full max-w-xs"
          />
        </NuxtLink>

        <Message
          severity="info"
          :closable="false"
          class="flex justify-center"
        >
          Team submission deadline: <strong>Wed 13th August 2025</strong>
        </Message>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
</script>
