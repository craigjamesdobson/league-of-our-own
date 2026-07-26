<script setup lang="ts">
definePageMeta({
  layout: false,
});

useHead({
  title: 'League of Our Own returns soon',
  meta: [
    {
      name: 'description',
      content: 'League of Our Own is preparing for the new fantasy football season.',
    },
  ],
});
</script>

<template>
  <main class="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary px-6 py-16 text-white">
    <div class="absolute inset-0 opacity-20">
      <div class="absolute -left-24 -top-24 h-80 w-80 rounded-full border-[3rem] border-white" />
      <div class="absolute -bottom-32 -right-24 h-96 w-96 rounded-full border-[4rem] border-white" />
    </div>

    <section class="relative z-10 mx-auto max-w-2xl text-center">
      <div class="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border border-white/30 bg-white/10">
        <Icon
          name="carbon:soccer"
          size="44"
        />
      </div>

      <p class="mb-4 text-sm font-bold uppercase tracking-[0.3em] text-white/70">
        New season incoming
      </p>
      <h1 class="text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">
        League of Our Own returns soon
      </h1>
      <p class="mx-auto mt-6 max-w-xl text-lg leading-8 text-white/75">
        We’re getting everything ready for the new fantasy football season.
        Check back soon for team registration and the league relaunch.
      </p>

      <NuxtLink
        to="/account/login"
        class="mt-12 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
      >
        <Icon
          name="carbon:locked"
          size="16"
        />
        Admin sign in
      </NuxtLink>
    </section>
  </main>
</template>
