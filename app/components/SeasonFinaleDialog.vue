<script setup lang="ts">
import type { WeeklyData } from '~/types/Table';

const visible = defineModel<boolean>('visible', { required: true });

const props = defineProps<{
  standings: WeeklyData[];
}>();

const ribbonCount = 18;

const champion = computed(() => props.standings[0]);
const runnersUp = computed(() => props.standings.slice(1, 5));
</script>

<template>
  <UModal
    v-model:open="visible"
    :dismissible="true"
    :ui="{
      overlay: 'bg-slate-950/75',
      content: 'w-[92vw] max-w-2xl bg-white text-slate-900 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700',
      header: 'pb-0',
    }"
  >
    <template #content>
      <div class="border-b border-slate-200 p-4 pb-0 dark:border-slate-700">
        <div class="flex items-center gap-3 pr-4">
          <div class="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-100 text-yellow-700">
            <Icon
              name="solar:cup-star-bold"
              size="26"
            />
          </div>
          <div>
            <p class="text-xs font-black uppercase text-slate-500 dark:text-slate-400">
              Season complete
            </p>
            <h2 class="text-xl font-black uppercase text-slate-900 dark:text-slate-100 md:text-2xl">
              Congratulations
            </h2>
          </div>
        </div>
      </div>

      <div
        v-if="champion"
        class="relative overflow-hidden rounded-b-xl p-4 pt-5"
      >
        <div
          class="celebration-effects"
          aria-hidden="true"
        >
          <span
            v-for="index in ribbonCount"
            :key="`ribbon-${index}`"
            class="celebration-ribbon"
          />
          <span class="celebration-burst celebration-burst-left" />
          <span class="celebration-burst celebration-burst-right" />
          <span class="celebration-burst celebration-burst-centre" />
        </div>

        <div class="relative z-10 space-y-6">
          <section class="rounded-3xl border border-yellow-300 bg-gradient-to-br from-yellow-50/95 via-white/95 to-slate-50/95 p-6 text-center shadow-sm backdrop-blur-sm dark:border-yellow-500/50 dark:from-yellow-950/60 dark:via-slate-900/95 dark:to-slate-800/95">
            <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-400 text-slate-950 shadow-sm">
              <Icon
                name="ph:crown-simple-fill"
                size="38"
              />
            </div>
            <p class="mb-2 text-sm font-black uppercase tracking-[0.2em] text-yellow-700 dark:text-yellow-300">
              League champion
            </p>
            <h3 class="text-3xl font-black uppercase text-slate-950 dark:text-slate-100 md:text-4xl">
              {{ champion.team_name }}
            </h3>
            <p class="mt-2 text-sm font-bold uppercase text-slate-500 dark:text-slate-400">
              {{ champion.team_owner }}
            </p>
            <div class="mt-5 inline-flex items-end gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-white">
              <span class="text-4xl font-black leading-none">{{ champion.total_points }}</span>
              <span class="pb-1 text-sm font-bold uppercase tracking-wide text-slate-300">points</span>
            </div>
          </section>

          <section
            v-if="runnersUp.length"
            class="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/80"
          >
            <h3 class="mb-4 text-sm font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              Top 5 overall
            </h3>
            <div class="space-y-3">
              <div
                v-for="(team, index) in runnersUp"
                :key="team.drafted_team_id"
                class="flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-900"
              >
                <div class="flex min-w-0 items-center gap-3">
                  <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-sm font-black text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                    {{ index + 2 }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate font-black uppercase text-slate-900 dark:text-slate-100">
                      {{ team.team_name }}
                    </p>
                    <p class="truncate text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
                      {{ team.team_owner }}
                    </p>
                  </div>
                </div>
                <div class="shrink-0 text-right">
                  <p class="text-lg font-black text-slate-900 dark:text-slate-100">
                    {{ team.total_points }}
                  </p>
                  <p class="text-[0.65rem] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    points
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.celebration-effects {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 20;
}

.celebration-ribbon {
  --ribbon-left: 50%;
  --ribbon-delay: 0s;
  --ribbon-duration: 4.8s;
  --ribbon-colour: #facc15;
  --ribbon-rotation: 24deg;

  animation: ribbon-fall var(--ribbon-duration) linear infinite;
  animation-delay: var(--ribbon-delay);
  background: var(--ribbon-colour);
  border-radius: 999px;
  box-shadow: 0 0 0 1px rgb(15 23 42 / 0.05);
  height: 34px;
  left: var(--ribbon-left);
  opacity: 0;
  position: absolute;
  top: -48px;
  transform: rotate(var(--ribbon-rotation));
  width: 8px;
}

.celebration-ribbon:nth-child(1) { --ribbon-left: 5%; --ribbon-delay: -0.5s; --ribbon-duration: 4.4s; --ribbon-colour: #facc15; --ribbon-rotation: 18deg; }
.celebration-ribbon:nth-child(2) { --ribbon-left: 11%; --ribbon-delay: -2.1s; --ribbon-duration: 5.2s; --ribbon-colour: #38bdf8; --ribbon-rotation: -16deg; }
.celebration-ribbon:nth-child(3) { --ribbon-left: 17%; --ribbon-delay: -1.2s; --ribbon-duration: 4.8s; --ribbon-colour: #fb7185; --ribbon-rotation: 34deg; }
.celebration-ribbon:nth-child(4) { --ribbon-left: 24%; --ribbon-delay: -3.3s; --ribbon-duration: 5.5s; --ribbon-colour: #22c55e; --ribbon-rotation: -26deg; }
.celebration-ribbon:nth-child(5) { --ribbon-left: 31%; --ribbon-delay: -0.9s; --ribbon-duration: 4.7s; --ribbon-colour: #a78bfa; --ribbon-rotation: 12deg; }
.celebration-ribbon:nth-child(6) { --ribbon-left: 39%; --ribbon-delay: -2.6s; --ribbon-duration: 5.1s; --ribbon-colour: #f97316; --ribbon-rotation: -38deg; }
.celebration-ribbon:nth-child(7) { --ribbon-left: 46%; --ribbon-delay: -1.7s; --ribbon-duration: 4.3s; --ribbon-colour: #14b8a6; --ribbon-rotation: 28deg; }
.celebration-ribbon:nth-child(8) { --ribbon-left: 53%; --ribbon-delay: -3.9s; --ribbon-duration: 5.6s; --ribbon-colour: #facc15; --ribbon-rotation: -18deg; }
.celebration-ribbon:nth-child(9) { --ribbon-left: 60%; --ribbon-delay: -0.3s; --ribbon-duration: 4.9s; --ribbon-colour: #38bdf8; --ribbon-rotation: 42deg; }
.celebration-ribbon:nth-child(10) { --ribbon-left: 67%; --ribbon-delay: -2.8s; --ribbon-duration: 5.4s; --ribbon-colour: #fb7185; --ribbon-rotation: -22deg; }
.celebration-ribbon:nth-child(11) { --ribbon-left: 73%; --ribbon-delay: -1.4s; --ribbon-duration: 4.6s; --ribbon-colour: #22c55e; --ribbon-rotation: 16deg; }
.celebration-ribbon:nth-child(12) { --ribbon-left: 79%; --ribbon-delay: -3.6s; --ribbon-duration: 5.3s; --ribbon-colour: #a78bfa; --ribbon-rotation: -30deg; }
.celebration-ribbon:nth-child(13) { --ribbon-left: 86%; --ribbon-delay: -0.8s; --ribbon-duration: 4.5s; --ribbon-colour: #f97316; --ribbon-rotation: 24deg; }
.celebration-ribbon:nth-child(14) { --ribbon-left: 92%; --ribbon-delay: -2.4s; --ribbon-duration: 5.7s; --ribbon-colour: #14b8a6; --ribbon-rotation: -14deg; }
.celebration-ribbon:nth-child(15) { --ribbon-left: 8%; --ribbon-delay: -4.2s; --ribbon-duration: 5.8s; --ribbon-colour: #a78bfa; --ribbon-rotation: 38deg; }
.celebration-ribbon:nth-child(16) { --ribbon-left: 35%; --ribbon-delay: -4.5s; --ribbon-duration: 6s; --ribbon-colour: #fb7185; --ribbon-rotation: -34deg; }
.celebration-ribbon:nth-child(17) { --ribbon-left: 58%; --ribbon-delay: -4.1s; --ribbon-duration: 5.9s; --ribbon-colour: #facc15; --ribbon-rotation: 18deg; }
.celebration-ribbon:nth-child(18) { --ribbon-left: 88%; --ribbon-delay: -4.7s; --ribbon-duration: 6.1s; --ribbon-colour: #38bdf8; --ribbon-rotation: -28deg; }

.celebration-burst {
  --burst-colour: #facc15;

  animation: burst-pulse 2.8s ease-out infinite;
  background:
    radial-gradient(circle, var(--burst-colour) 0 4px, transparent 5px),
    radial-gradient(circle, var(--burst-colour) 0 3px, transparent 4px),
    radial-gradient(circle, var(--burst-colour) 0 3px, transparent 4px),
    radial-gradient(circle, var(--burst-colour) 0 3px, transparent 4px),
    radial-gradient(circle, var(--burst-colour) 0 3px, transparent 4px),
    radial-gradient(circle, #ffffff 0 2px, transparent 3px),
    radial-gradient(circle, #ffffff 0 2px, transparent 3px),
    radial-gradient(circle, #ffffff 0 2px, transparent 3px),
    radial-gradient(circle, var(--burst-colour) 0 2px, transparent 3px);
  background-position: 50% 0, 100% 50%, 50% 100%, 0 50%, 86% 15%, 15% 15%, 85% 85%, 18% 82%, 50% 50%;
  background-repeat: no-repeat;
  background-size: 10px 10px, 8px 8px, 8px 8px, 8px 8px, 7px 7px, 5px 5px, 5px 5px, 5px 5px, 6px 6px;
  filter: drop-shadow(0 0 8px var(--burst-colour));
  height: 116px;
  opacity: 0;
  position: absolute;
  width: 116px;
}

.celebration-burst-left {
  --burst-colour: #38bdf8;

  left: 7%;
  top: 14%;
}

.celebration-burst-right {
  --burst-colour: #fb7185;

  animation-delay: 0.9s;
  right: 5%;
  top: 9%;
}

.celebration-burst-centre {
  --burst-colour: #facc15;

  animation-delay: 1.6s;
  left: 43%;
  top: -1%;
}

@keyframes ribbon-fall {
  0% {
    opacity: 0;
    transform: translate3d(0, -64px, 0) rotate(var(--ribbon-rotation));
  }

  10% {
    opacity: 0.9;
  }

  100% {
    opacity: 0;
    transform: translate3d(34px, 620px, 0) rotate(calc(var(--ribbon-rotation) + 360deg));
  }
}

@keyframes burst-pulse {
  0% {
    opacity: 0;
    transform: scale(0.2) rotate(0deg);
  }

  18% {
    opacity: 1;
  }

  55% {
    opacity: 0.18;
    transform: scale(1.35) rotate(25deg);
  }

  100% {
    opacity: 0;
    transform: scale(1.35) rotate(25deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .celebration-ribbon,
  .celebration-burst {
    animation: none;
    opacity: 0.2;
  }
}
</style>
