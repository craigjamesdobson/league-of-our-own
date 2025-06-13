<template>
  <div>
    <Fireworks
      v-if="mounted"
      ref="fw"
      :autostart="true"
      :options="options"
      :style="{
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        position: 'fixed',
        background: 'linear-gradient(rgb(6 3 16) 0%, rgb(26, 39, 64) 100%)',
      }"
    />
    <div class="relative z-5 text-primary font-display flex flex-col items-center justify-center">
      <div class="flex flex-col rounded-sm text-white p-10 text-center">
        <div class="flex justify-items-center self-center rounded-full p-4">
          <Icon
            class="text-slate-100"
            size="64"
            name="carbon:soccer"
          />
        </div>
        <h1
          class="mb-6 text-4xl font-black uppercase tracking-wider"
        >
          League of our own
        </h1>
        <span class="text-sm mb-5">ESTABLISHED. 1989/1990</span>
        <hr>
      </div>
      <div class="p-5 flex flex-col gap-5 text-4xl text-center text-white">
        <p>The 2024/25 season has officially concluded!</p>
        <p> Congratulations to <strong>Sarah Cornish</strong> on a fantastic win!</p>
        <NuxtLink class="text-sm uppercase" :to="'/table?week=38'">Click here to view the final week 38 table</NuxtLink>
        <hr class="m-5">
        <p class="text-lg">
          A huge thank you to everyone who took part this season — we hope you enjoyed the ride. We will be in touch over the next few weeks to arrange prize distribution.
        </p>
        <p class="text-2xl">
          Have a great summer, and we look forward to seeing you all again next season!
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Fireworks } from '@fireworks-js/vue';
import type { FireworksOptions } from '@fireworks-js/vue';

const fw = ref<InstanceType<typeof Fireworks>>();
const options = ref<FireworksOptions>({ opacity: 0.5 });
const mounted = ref(true);
</script>
