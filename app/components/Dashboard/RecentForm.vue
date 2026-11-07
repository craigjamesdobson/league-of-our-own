<script setup lang="ts">
import type { FormLeader, RecentFormSummary } from '~/logic/recent-form';

const props = defineProps<{ summary: RecentFormSummary; isLoading: boolean; error: string | null }>();
const emit = defineEmits<{ retry: [] }>();
const format = (value: number) => value.toLocaleString('en-GB', { maximumFractionDigits: 1 });
const gameweekList = new Intl.ListFormat('en-GB');
const formatAboveAverageWeeks = (team: FormLeader) => gameweekList.format(
  team.scores.filter(score => score.points > score.leagueAverage).map(score => String(score.week)),
);
const first = computed(() => ({ form: props.summary.inForm[0], improved: props.summary.improved[0], regular: props.summary.regularScorers[0], climber: props.summary.climbers[0] }));
const weekLabel = computed(() => {
  const weeks = props.summary.weeks;
  const start = weeks[0];
  if (start === undefined) return '';
  if (weeks.length === 1) return `GW ${start}`;
  return weeks.every((week, index) => week === start + index) ? `GW ${start}–${weeks.at(-1)}` : weeks.map(week => `GW ${week}`).join(', ');
});
const periodLabel = computed(() => props.summary.weeks.length && props.summary.weeks.length < 5 ? `${props.summary.weeks.length} completed gameweeks available` : 'Last 5 completed gameweeks');
const comparisonWidth = (value: number, team: FormLeader) => `${value / Math.max(1, team.totalPoints, team.previousPoints ?? 0) * 100}%`;
</script>

<template>
  <section aria-labelledby="recent-form-heading">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2
          id="recent-form-heading"
          class="text-base font-black uppercase tracking-wide text-slate-900 dark:text-slate-100 md:text-lg"
        >
          Recent Form
        </h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {{ periodLabel }}
        </p>
      </div>
      <span
        v-if="!isLoading && !error && weekLabel"
        class="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium tabular-nums text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        aria-live="polite"
      >{{ weekLabel }}</span>
    </div>
    <UCard
      :ui="{ body: 'p-0 sm:p-0' }"
      class="overflow-hidden bg-white shadow-sm ring-slate-200 dark:bg-slate-900 dark:shadow-none dark:ring-slate-700"
    >
      <div
        v-if="isLoading"
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
        role="status"
        aria-label="Loading recent form"
      >
        <div
          v-for="n in 4"
          :key="n"
          class="form-stat space-y-4"
        >
          <USkeleton class="h-4 w-28" /><USkeleton class="h-10 w-20" /><USkeleton class="h-4 w-36" /><USkeleton class="h-10 w-full" />
        </div>
      </div>
      <div
        v-else-if="error || !summary.weeks.length"
        class="p-6"
      >
        <p
          :role="error ? 'alert' : 'status'"
          class="text-sm text-slate-600 dark:text-slate-300"
        >
          {{ error || 'Recent form will appear after the first gameweek’s scores are recorded and verified.' }}
        </p>
        <UButton
          v-if="error"
          label="Try again"
          variant="soft"
          class="mt-3 dark:text-primary-300"
          @click="emit('retry')"
        />
      </div>
      <div
        v-else
        class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
      >
        <article
          class="form-stat"
          aria-labelledby="form-team-heading"
        >
          <div class="stat-heading">
            <Icon
              mode="svg"
              name="lucide:chart-no-axes-combined"
              class="stat-icon"
              size="16"
              aria-hidden="true"
            /><h3
              id="form-team-heading"
              class="stat-title"
            >
              In-form team
            </h3>
          </div>
          <div
            v-if="first.form"
            class="mt-3"
          >
            <div class="flex items-baseline gap-2">
              <p class="stat-value text-primary dark:text-primary-300">
                {{ format(first.form.value) }}
              </p><span class="stat-unit">pts</span>
            </div>
            <p class="stat-caption">
              {{ format(first.form.average) }} points per gameweek
            </p>
            <ul
              class="mt-4 space-y-1.5"
              aria-label="In-form teams"
            >
              <li
                v-for="team in summary.inForm"
                :key="team.drafted_team_id"
                class="team-name"
              >
                {{ team.team_name }}
              </li>
            </ul>
            <ol
              v-if="summary.inForm.length === 1"
              class="mt-4 grid grid-cols-5 gap-1.5"
              aria-label="Points in each gameweek"
            >
              <li
                v-for="score in first.form.scores"
                :key="score.week"
                class="rounded-md bg-slate-50 py-2 text-center dark:bg-slate-800/70"
              >
                <span class="block text-[11px] font-medium text-slate-500 dark:text-slate-400">GW {{ score.week }}</span><span
                  class="mt-1 block text-sm font-bold tabular-nums"
                  :class="score.points < 0 ? 'text-red-600 dark:text-red-300' : 'text-slate-800 dark:text-slate-100'"
                >{{ score.points }}</span>
              </li>
            </ol>
            <p
              v-if="summary.inForm.length > 1"
              class="stat-caption mt-2"
            >
              Joint highest total
            </p>
          </div>
        </article>
        <article
          class="form-stat"
          aria-labelledby="form-improved-heading"
        >
          <div class="stat-heading">
            <Icon
              mode="svg"
              name="lucide:trending-up"
              class="stat-icon"
              size="16"
              aria-hidden="true"
            /><h3
              id="form-improved-heading"
              class="stat-title"
            >
              Most improved
            </h3>
          </div>
          <template v-if="first.improved">
            <div class="mt-3 flex items-baseline gap-2">
              <p class="stat-value text-emerald-700 dark:text-emerald-400">
                +{{ format(first.improved.value) }}
              </p><span class="stat-unit">pts</span>
            </div>
            <p class="stat-caption">
              More than the previous five gameweeks
            </p>
            <div
              v-for="team in summary.improved"
              :key="team.drafted_team_id"
              class="mt-4"
            >
              <p class="team-name">
                {{ team.team_name }}
              </p>
              <dl class="mt-3 space-y-2.5">
                <div>
                  <div class="flex items-center justify-between gap-2 text-xs">
                    <dt class="text-slate-500 dark:text-slate-400">
                      Previous 5
                    </dt><dd class="font-semibold tabular-nums text-slate-600 dark:text-slate-300">
                      {{ team.previousPoints }} pts
                    </dd>
                  </div><div
                    v-if="(team.previousPoints ?? 0) >= 0 && team.totalPoints >= 0"
                    class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                    aria-hidden="true"
                  >
                    <div
                      class="h-full rounded-full bg-slate-300 dark:bg-slate-600"
                      :style="{ width: comparisonWidth(team.previousPoints ?? 0, team) }"
                    />
                  </div>
                </div>
                <div>
                  <div class="flex items-center justify-between gap-2 text-xs">
                    <dt class="text-slate-500 dark:text-slate-400">
                      Last 5
                    </dt><dd class="font-semibold tabular-nums text-slate-800 dark:text-slate-100">
                      {{ team.totalPoints }} pts
                    </dd>
                  </div><div
                    v-if="(team.previousPoints ?? 0) >= 0 && team.totalPoints >= 0"
                    class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                    aria-hidden="true"
                  >
                    <div
                      class="h-full rounded-full bg-primary dark:bg-primary-300"
                      :style="{ width: comparisonWidth(team.totalPoints, team) }"
                    />
                  </div>
                </div>
              </dl>
            </div>
          </template>
          <p
            v-else
            class="stat-empty"
          >
            {{ summary.canCompare ? 'No team improved on the previous five gameweeks.' : 'Available after 10 completed gameweeks.' }}
          </p>
        </article>
        <article
          class="form-stat"
          aria-labelledby="form-regular-heading"
        >
          <div class="stat-heading">
            <Icon
              mode="svg"
              name="lucide:chart-column-increasing"
              class="stat-icon"
              size="16"
              aria-hidden="true"
            /><h3
              id="form-regular-heading"
              class="stat-title"
            >
              Regular high scorer
            </h3>
          </div>
          <template v-if="first.regular">
            <div class="mt-3 flex items-baseline gap-1">
              <p class="stat-value text-slate-900 dark:text-slate-100">
                {{ first.regular.value }}
              </p><span class="text-xl font-medium tabular-nums text-slate-500 dark:text-slate-400">/ {{ summary.weeks.length }}</span>
            </div>
            <p class="stat-caption">
              {{ first.regular.value === summary.weeks.length ? `Beat the league average in ${weekLabel}` : 'Gameweeks above the league average' }}
            </p>
            <ul
              class="mt-4 space-y-3"
              aria-label="Regular high scorers"
            >
              <li
                v-for="team in summary.regularScorers"
                :key="team.drafted_team_id"
              >
                <p class="team-name">
                  {{ team.team_name }}
                </p>
                <p
                  v-if="team.value < summary.weeks.length"
                  class="stat-caption mt-1"
                >
                  Beat the average in GW {{ formatAboveAverageWeeks(team) }}
                </p>
              </li>
            </ul>
            <p
              v-if="summary.regularScorers.length > 1"
              class="stat-caption mt-3"
            >
              {{ summary.regularScorers.length }} teams share the best record
            </p>
          </template>
          <p
            v-else
            class="stat-empty"
          >
            No team scored above the league average.
          </p>
        </article>
        <article
          class="form-stat"
          aria-labelledby="form-climber-heading"
        >
          <div class="stat-heading">
            <Icon
              mode="svg"
              name="lucide:arrow-up-right"
              class="stat-icon"
              size="16"
              aria-hidden="true"
            /><h3
              id="form-climber-heading"
              class="stat-title"
            >
              Biggest climber
            </h3>
          </div>
          <template v-if="first.climber">
            <div class="mt-3 flex items-baseline gap-2">
              <p class="stat-value text-emerald-700 dark:text-emerald-400">
                +{{ first.climber.value }}
              </p><span class="stat-unit">{{ first.climber.value === 1 ? 'place' : 'places' }}</span>
            </div>
            <p class="stat-caption">
              Gained over the last {{ summary.weeks.length }} gameweeks
            </p>
            <ul
              class="mt-4 space-y-2"
              aria-label="Biggest climbers"
            >
              <li
                v-for="team in summary.climbers"
                :key="team.drafted_team_id"
                class="flex items-center justify-between gap-3"
              >
                <span class="team-name">{{ team.team_name }}</span><span class="flex shrink-0 items-center gap-1.5 text-xs tabular-nums"><span class="text-slate-500 dark:text-slate-400">{{ team.startPosition }}</span><Icon
                  mode="svg"
                  name="lucide:arrow-right"
                  size="12"
                  class="text-slate-400 dark:text-slate-500"
                  aria-hidden="true"
                /><span class="font-bold text-slate-800 dark:text-slate-100">{{ team.endPosition }}</span></span>
              </li>
            </ul>
          </template>
          <p
            v-else
            class="stat-empty"
          >
            {{ summary.canRank ? 'No team gained places in this period.' : 'Needs a verified league table before this period.' }}
          </p>
        </article>
      </div>
    </UCard>
  </section>
</template>

<style scoped>
@reference "@/assets/styles/base.css";
.form-stat { @apply min-w-0 p-5 sm:p-6; }
.form-stat + .form-stat { @apply border-t border-slate-200 dark:border-slate-800; }
.stat-heading { @apply flex items-center gap-2; }
.stat-title { @apply text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200; }
.stat-icon { @apply shrink-0 text-primary dark:text-primary-300; }
.stat-value { @apply text-4xl font-bold leading-none tracking-tight tabular-nums; }
.stat-unit { @apply text-sm font-medium text-slate-500 dark:text-slate-400; }
.stat-caption { @apply mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400; }
.team-name { @apply min-w-0 break-words text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100; }
.stat-empty { @apply mt-5 text-sm leading-relaxed text-slate-500 dark:text-slate-400; }
@media (min-width: 640px) {
  .form-stat + .form-stat { @apply border-t-0; }
  .form-stat:nth-child(even) { @apply border-l; }
  .form-stat:nth-child(n+3) { @apply border-t; }
}
@media (min-width: 1280px) {
  .form-stat + .form-stat { @apply border-l; }
  .form-stat:nth-child(n+3) { @apply border-t-0; }
}
</style>
