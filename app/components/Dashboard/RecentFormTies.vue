<script setup lang="ts">
import type { FormLeader } from '~/logic/recent-form';

defineProps<{
  teams: Pick<FormLeader, 'drafted_team_id' | 'team_name'>[];
  label: string;
  record: string;
}>();
</script>

<template>
  <UPopover>
    <UButton
      class="ml-auto shrink-0 rounded-full tabular-nums"
      color="neutral"
      trailing-icon="i-lucide-chevron-down"
      variant="soft"
      size="xs"
      :label="`+${teams.length}`"
      :aria-label="label"
      :title="label"
    />
    <template #content>
      <div class="max-h-64 w-64 max-w-[calc(100vw-2rem)] overflow-y-auto p-3">
        <p class="mb-2 text-xs font-semibold text-muted">
          More tied teams
        </p>
        <ul class="divide-y divide-slate-200 dark:divide-slate-800">
          <li
            v-for="team in teams"
            :key="team.drafted_team_id"
            class="flex items-baseline justify-between gap-3 py-1.5"
          >
            <span class="min-w-0 break-words text-xs font-medium uppercase leading-snug text-slate-900 dark:text-slate-100">{{ team.team_name }}</span>
            <span class="shrink-0 text-xs font-semibold tabular-nums">{{ record }}</span>
          </li>
        </ul>
      </div>
    </template>
  </UPopover>
</template>
