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
    <div class="fixed top-0 left-0 right-0 z-5 text-primary font-display flex items-center justify-center">
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
        <span class="text-xl">ESTABLISHED. 1989/1990</span>
      </div>
    </div>
    <div class="fixed inset-0 z-5 text-primary font-display flex items-center justify-center">
      <div class="p-5 flex flex-col gap-5 text-4xl text-center text-white">
        <p>The 2024/25 season has officially concluded!</p>
        <p> Congratulations to <strong>Sarah Cornish (SARAHSCARERS)</strong> on a fantastic win!</p>
        <p class="text-lg">
          A huge thank you to everyone who took part this season — we hope you enjoyed the ride. Have a great summer, and we look forward to seeing you all again next season!
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
