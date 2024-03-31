<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useAccountStore } from '~/stores/account';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
import { usePlayerStore } from '@/stores/players';
import type { DraftedTeam } from '~/types/DraftedTeam';

const accountStore = useAccountStore();
const draftedTeamStore = useDraftedTeamsStore();
const playerStore = usePlayerStore();
const router = useRouter();

definePageMeta({
  middleware: ['auth']
});

const selectedDraftedTeamID = ref(0);
const selectedDraftedTeam = computed(() =>
  draftedTeamStore.getDraftedTeamByID(selectedDraftedTeamID.value)
);

const toast = useToast();
const playerData = ref();
const updating = ref(false);

const handleUpsertPlayerData = async () => {
  try {
    updating.value = true;
    await playerStore.upsertPlayerData(playerData.value);
    handleApiSuccess('Player data has been updated', toast);
  } catch (err) {
    handleApiError(err, toast);
  } finally {
    updating.value = false;
  }
};

const handleUserLogout = async () => {
  try {
    await accountStore.signUserOut();
    router.push({ path: '/account/login' });
  } catch (err) {
    handleApiError(err, toast);
  }
};

const transfersMadeCount = (team: DraftedTeam) => {
  return team.players
    .map((x) => x.transfers.length)
    .reduce((total, transfers) => total + transfers, 0);
};
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <Toast />
    <h1 class="main-heading flex items-center">
      <span>Admin Dashboard</span>
      <button title="Sign out" @click.prevent="handleUserLogout">
        <Icon class="ml-2" name="la:sign-out-alt" />
      </button>
    </h1>
    <div v-if="accountStore.userIsLoggedIn">
      <p class="m-4 text-center underline">
        Hello {{ accountStore.user?.email }}
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
            label="Update players"
            :loading="updating"
            @click="handleUpsertPlayerData"
          />
        </div>
        <div v-if="draftedTeamStore.draftedTeams" class="flex flex-col gap-4">
          <Dropdown
            v-model="selectedDraftedTeamID"
            class="!w-full"
            :options="
              draftedTeamStore.getDraftedTeams?.filter(
                (x) => x.allowed_transfers
              )
            "
            filter
            option-label="team_name"
            option-value="drafted_team_id"
            placeholder="Select a team"
            scroll-height="400"
          >
            <template #option="slotProps">
              <div
                class="flex items-center justify-between"
                :class="{
                  'opacity-25': transfersMadeCount(slotProps.option) === 4
                }"
              >
                <div class="align-items-center flex flex-col gap-1">
                  <div class="font-black">
                    {{ slotProps.option.team_name.toUpperCase() }}
                  </div>
                  <span class="text-xs">{{ slotProps.option.team_owner }}</span>
                </div>
                <Tag
                  severity="info"
                  rounded
                  title="transfers made"
                  :value="transfersMadeCount(slotProps.option)"
                ></Tag>
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
