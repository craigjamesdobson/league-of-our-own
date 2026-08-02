<script setup lang="ts">
import type { TeamAdminMetadata } from '~/types/DraftedTeam';

const props = defineProps<{
  metadata: TeamAdminMetadata;
}>();

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatDate = (value: string) => dateFormatter.format(new Date(value));
</script>

<template>
  <UPopover
    :content="{
      align: 'end',
      side: 'bottom',
    }"
  >
    <UButton
      icon="lucide:history"
      color="neutral"
      variant="ghost"
      size="xs"
      square
      aria-label="View submission history"
      title="View submission history"
    />

    <template #content>
      <div class="w-64 p-4 text-slate-900 dark:text-slate-100">
        <p class="mb-3 text-sm font-bold uppercase tracking-wide">
          Submission history
        </p>
        <dl class="space-y-2 text-sm">
          <div class="flex items-start justify-between gap-4">
            <dt class="text-slate-500 dark:text-slate-400">
              Created
            </dt>
            <dd class="text-right font-medium">
              {{ formatDate(props.metadata.created_at) }}
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4">
            <dt class="text-slate-500 dark:text-slate-400">
              Last edited
            </dt>
            <dd class="text-right font-medium">
              {{ props.metadata.updated_at ? formatDate(props.metadata.updated_at) : 'Never edited' }}
            </dd>
          </div>
          <div class="flex items-start justify-between gap-4">
            <dt class="text-slate-500 dark:text-slate-400">
              Edit count
            </dt>
            <dd class="text-right font-medium">
              {{ props.metadata.edited_count ?? 0 }}
            </dd>
          </div>
        </dl>
      </div>
    </template>
  </UPopover>
</template>
