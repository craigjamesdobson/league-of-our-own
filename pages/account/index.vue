<script setup lang="ts">
import { useAccount } from '@/logic/account/';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';

const draftedTeamStore = useDraftedTeamsStore();

definePageMeta({
  middleware: ['auth'],
});

const selectedDraftedTeamID = ref(0);
const selectedDraftedTeam = computed(() =>
  draftedTeamStore.getDraftedTeamByID(selectedDraftedTeamID.value)
);

const { updatePlayerData, loading, accountStore, playerData } = useAccount();
</script>

<template>
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="flex items-center main-heading">
      <span>Admin Login</span>
      <button title="Sign out" @click.prevent="accountStore.signOutUser">
        <Icon class="ml-2" name="la:sign-out-alt" />
      </button>
    </h1>
    <div v-if="accountStore.userIsLoggedIn">
      <p class="m-4 text-center underline">
        Hello {{ accountStore.user.email }}
      </p>
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div class="flex flex-col gap-4">
          <Textarea
            v-model="playerData"
            cols="75"
            rows="40"
            placeholder="Paste player data here..."
          />
          <Button
            :class="{ 'opacity-25': loading }"
            label="Update players"
            @click="updatePlayerData"
          />
        </div>
        <div class="flex flex-col gap-4">
          <Dropdown
            v-model="selectedDraftedTeamID"
            class="!w-full"
            :options="
              draftedTeamStore.draftedTeams?.filter((x) => x.allowed_transfers)
            "
            filter
            option-label="team_name"
            option-value="drafted_team_id"
            placeholder="Select a team"
          >
            <template #option="slotProps">
              <div class="flex flex-col gap-1 align-items-center">
                <div class="font-black">
                  {{ slotProps.option.team_name.toUpperCase() }}
                </div>
                <span class="text-xs">{{ slotProps.option.team_owner }}</span>
              </div>
            </template>
          </Dropdown>
          <div v-if="selectedDraftedTeam">
            <DraftedTeam :editable="true" :drafted-team="selectedDraftedTeam" />
          </div>
        </div>
      </div>
      <div class="update-log" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
input {
  @apply focus:outline-none;
}
</style>
