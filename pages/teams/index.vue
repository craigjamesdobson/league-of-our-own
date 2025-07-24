<script setup lang="ts">
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

const user = useSupabaseUser();

const draftedTeamsStore = useDraftedTeamsStore();
if (user.value) {
  await draftedTeamsStore.fetchDraftedTeams();
}
</script>

<template>
  <div v-if="user">
    <div v-if="draftedTeamsStore.getDraftedTeams">
      <h1 class="main-heading">
        Teams
      </h1>
      <div class="grid lg:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="draftedTeam in draftedTeamsStore.getDraftedTeams"
          :key="draftedTeam.drafted_team_id"
          class="m-2"
        >
          <DraftedTeam
            v-if="draftedTeam"
            :drafted-team="draftedTeam"
          />
          <Message
            v-if="user"
            class="mt-4"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-2 text-sm">
                <Icon
                  name="mdi:calendar-plus"
                  class="flex-shrink-0"
                  size="16"
                />
                <span class="text-surface-600 font-bold">Created:</span>
                <span class="text-surface-800">
                  {{ new Date(draftedTeam.created_at).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }) }}
                </span>
              </div>

              <div
                v-if="draftedTeam.updated_at"
                class="flex items-center gap-2 text-sm"
              >
                <Icon
                  name="mdi:calendar-edit"
                  class="flex-shrink-0"
                  size="16"
                />
                <span class="text-surface-600 font-bold">Updated:</span>
                <span class="text-surface-800">
                  {{ new Date(draftedTeam.updated_at).toLocaleString('en-GB', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  }) }}
                </span>
              </div>

              <div
                v-if="draftedTeam.edited_count && draftedTeam.edited_count > 0"
                class="flex items-center gap-2 text-sm"
              >
                <Icon
                  name="mdi:pencil"
                  class="flex-shrink-0"
                  size="16"
                />
                <span class="text-surface-600 font-bold">Edited:</span>
                <span class="text-surface-800">
                  {{ draftedTeam.edited_count }} time{{ draftedTeam.edited_count === 1 ? '' : 's' }}
                </span>
              </div>
            </div>
          </Message>
        </div>
      </div>
    </div>
    <div v-else>
      <h1 class="main-heading">
        Loading...
      </h1>
      <div class="grid lg:grid-cols-2 xl:grid-cols-4">
        <div
          v-for="i in 12"
          :key="i"
          class="m-2"
        >
          <SkeletonDraftedTeam />
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="flex flex-col h-full items-center justify-center"
  >
    <Message
      severity="info"
    >
      Teams will be available once the season starts
    </Message>
  </div>
</template>
