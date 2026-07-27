<template>
  <div class="mx-auto flex min-h-full w-full max-w-6xl items-center py-6 lg:py-12">
    <div class="grid w-full overflow-hidden rounded-3xl bg-brand text-white shadow-xl lg:grid-cols-[1.2fr_0.8fr]">
      <section class="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
        <div class="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
          <Icon
            name="carbon:soccer"
            size="38"
          />
        </div>

        <p class="mb-4 text-sm font-black uppercase tracking-[0.25em] text-white/60">
          Fantasy football 2026/27
        </p>
        <h1 class="max-w-3xl text-4xl font-black uppercase leading-tight tracking-tight sm:text-6xl">
          Welcome back to League of Our Own
        </h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-white/75">
          A new Premier League season is nearly here. Pick your eleven-player squad,
          choose whether to use transfers, and submit your team for the new campaign.
        </p>

        <div class="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
          <UButton
            to="/team-builder"
            label="Build your team"
            trailing-icon="i-lucide-arrow-right"
            color="neutral"
            size="lg"
            class="font-black uppercase text-brand"
          />
          <NuxtLink
            to="/rules"
            class="text-center text-sm font-bold uppercase tracking-wide text-white/70 transition hover:text-white"
          >
            Read the rules
          </NuxtLink>
        </div>
      </section>

      <aside class="grid gap-px bg-white/10 sm:grid-cols-3 lg:grid-cols-1">
        <div class="bg-white/5 p-8 lg:p-10">
          <div class="flex items-center gap-3">
            <Icon
              name="tabler:calendar-event"
              size="24"
              class="text-white/40"
            />
            <p class="text-4xl font-black">
              20th Aug
            </p>
          </div>
          <p class="mt-2 text-sm font-bold uppercase tracking-wide text-white/60">
            Submission deadline
          </p>
        </div>
        <div class="bg-white/5 p-8 lg:p-10">
          <div class="flex items-center gap-3">
            <Icon
              name="tabler:coins"
              size="24"
              class="text-white/40"
            />
            <p class="text-4xl font-black">
              £90m
            </p>
          </div>
          <p class="mt-2 text-sm font-bold uppercase tracking-wide text-white/60">
            Standard budget
          </p>
        </div>
        <div class="bg-white/5 p-8 lg:p-10">
          <div class="flex items-center gap-3">
            <Icon
              name="tabler:arrows-exchange"
              size="24"
              class="text-white/40"
            />
            <p class="text-4xl font-black">
              £85m
            </p>
          </div>
          <p class="mt-2 text-sm font-bold uppercase tracking-wide text-white/60">
            With transfers
          </p>
        </div>
      </aside>
    </div>
  </div>
</template>
