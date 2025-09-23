<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { useAccountStore } from '~/stores/account';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
import { usePlayerStore } from '@/stores/players';
import { useAppSettings } from '@/composables/useAppSettings';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';

const accountStore = useAccountStore();
const draftedTeamStore = useDraftedTeamsStore();
const playerStore = usePlayerStore();
const { updateCurrentGameweek, getCurrentGameweek } = useAppSettings();
const router = useRouter();

definePageMeta({
  middleware: ['auth'],
});

await draftedTeamStore.fetchDraftedTeams();

const selectedDraftedTeamID = ref(0);
const selectedDraftedTeam = computed(() =>
  draftedTeamStore.getDraftedTeamByID(selectedDraftedTeamID.value),
);

const toast = useToast();
const playerData = ref();
const updating = ref(false);

const currentGameweek = ref<number>(4);
const isUpdatingGameweek = ref(false);

const handleUpsertPlayerData = async () => {
  try {
    updating.value = true;
    await playerStore.upsertPlayerData(playerData.value);
    handleApiSuccess('Player data has been updated', toast);
  }
  catch (err) {
    handleApiError(err, toast);
  }
  finally {
    updating.value = false;
  }
};

const handleUserLogout = async () => {
  try {
    await accountStore.signUserOut();
    router.push({ path: '/account/login' });
  }
  catch (err) {
    handleApiError(err, toast);
  }
};

const transfersRemainingCount = (team: DraftedTeamWithPlayers) => {
  const totalTransfersMade = team.players
    .map(x => x.transfers.length)
    .reduce((total, transfers) => total + transfers, 0);

  return 4 - totalTransfersMade;
};

onMounted(async () => {
  try {
    currentGameweek.value = await getCurrentGameweek();
  }
  catch (error) {
    console.error('Failed to load gameweek setting:', error);
    toast.add({
      severity: 'error',
      summary: 'Settings Error',
      detail: 'Could not load current gameweek setting from database',
    });
  }
});

const updateGameweek = async () => {
  try {
    isUpdatingGameweek.value = true;
    await updateCurrentGameweek(currentGameweek.value);
    toast.add({
      severity: 'success',
      summary: 'Dashboard Updated',
      detail: `Current gameweek set to ${currentGameweek.value}`,
    });
  }
  catch (error) {
    handleApiError(error, toast);
  }
  finally {
    isUpdatingGameweek.value = false;
  }
};

const copyApiUrl = async () => {
  try {
    await navigator.clipboard.writeText('https://fantasy.premierleague.com/api/bootstrap-static');
  }
  catch (err) {
    console.error('Failed to copy URL:', err);
  }
};
</script>

<template>
  <div class="flex h-full flex-col items-center justify-center">
    <Toast />
    <h1 class="main-heading flex items-center">
      <span>Admin Dashboard</span>
      <button
        title="Sign out"
        @click.prevent="handleUserLogout"
      >
        <Icon
          class="ml-2"
          name="la:sign-out-alt"
        />
      </button>
    </h1>
    <div v-if="accountStore.userIsLoggedIn">
      <p class="m-4 text-center underline">
        Hello {{ accountStore.user?.email }}
      </p>

      <!-- Settings Section -->
      <div class="mb-8">
        <Card class="dashboard-settings-card">
          <template #title>
            <div class="flex items-center gap-3 text-slate-800">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                <Icon
                  name="carbon:settings"
                  size="20"
                  class="text-blue-600"
                />
              </div>
              <span class="text-lg font-black uppercase tracking-wide">Settings</span>
            </div>
          </template>

          <template #content>
            <!-- Current Gameweek Setting -->
            <div class="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <Icon
                      name="carbon:calendar"
                      size="18"
                      class="text-slate-600"
                    />
                    <label class="text-base font-bold text-slate-800 uppercase tracking-wide">
                      Current Gameweek
                    </label>
                  </div>
                  <p class="text-sm text-slate-600">
                    Controls which gameweek data is displayed on the homepage dashboard
                  </p>
                </div>

                <div class="lg:ml-6">
                  <InputGroup>
                    <InputNumber
                      v-model="currentGameweek"
                      :min="1"
                      :max="38"
                      show-buttons
                      :disabled="isUpdatingGameweek"
                      class="!w-24"
                    />
                    <Button
                      label="Update"
                      icon="pi pi-check"
                      :loading="isUpdatingGameweek"
                      @click="updateGameweek"
                    />
                  </InputGroup>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>

      <!-- Management Sections (Side by Side) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Player Data Management Section -->
        <Card class="admin-section-card">
          <template #title>
            <div class="flex items-center gap-3 text-slate-800">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-green-100">
                <Icon
                  name="carbon:user-multiple"
                  size="20"
                  class="text-green-600"
                />
              </div>
              <span class="text-lg font-black uppercase tracking-wide">Player Data Management</span>
            </div>
          </template>

          <template #content>
            <div class="space-y-4">
              <!-- Automated Update Status -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <Icon
                    name="carbon:checkmark-filled"
                    size="18"
                    class="text-green-600 mt-0.5"
                  />
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-green-800 mb-1">
                      Automated Daily Updates
                    </h4>
                    <p class="text-sm text-green-700">
                      Player data is automatically updated daily from the Premier League API. No manual intervention required.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Manual Override Section -->
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div class="flex items-start gap-3">
                  <Icon
                    name="carbon:warning-alt"
                    size="18"
                    class="text-amber-600 mt-0.5"
                  />
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-amber-800 mb-1">
                      Manual Override
                    </h4>
                    <p class="text-sm text-amber-700 mb-2">
                      Use this section only if the automated update fails or you need to force an immediate update. Get the latest data from the API below and paste the JSON response.
                    </p>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                      <code class="text-xs bg-white border rounded px-2 py-1 font-mono text-slate-800 break-all sm:break-normal">
                        https://fantasy.premierleague.com/api/bootstrap-static
                      </code>
                      <Button
                        v-tooltip="'Copy API URL'"
                        size="small"
                        text
                        severity="secondary"
                        class="flex-shrink-0"
                        @click="copyApiUrl"
                      >
                        <Icon
                          name="carbon:copy"
                          size="16"
                        />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Textarea
                v-model="playerData"
                cols="75"
                rows="20"
                placeholder="Paste player data here..."
                class="w-full"
              />
              <div class="flex justify-end">
                <Button
                  label="Update Players"
                  icon="pi pi-upload"
                  :loading="updating"
                  @click="handleUpsertPlayerData"
                />
              </div>
            </div>
          </template>
        </Card>

        <!-- Team Management Section -->
        <Card
          v-if="draftedTeamStore.draftedTeams"
          class="admin-section-card h-full flex flex-col"
        >
          <template #title>
            <div class="flex items-center gap-3 text-slate-800">
              <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                <Icon
                  name="carbon:group"
                  size="20"
                  class="text-purple-600"
                />
              </div>
              <span class="text-lg font-black uppercase tracking-wide">Team Management</span>
            </div>
          </template>

          <template #content>
            <div class="space-y-4 flex-1 flex flex-col">
              <p class="text-sm text-slate-600">
                Select a team below to view and manage transfers
              </p>
              <Select
                v-model="selectedDraftedTeamID"
                class="!w-full"
                :options="
                  draftedTeamStore.getDraftedTeams?.filter(
                    (x) => x.allowed_transfers,
                  )
                "
                filter
                option-label="team_name"
                option-value="drafted_team_id"
                placeholder="Select a team to manage..."
                scroll-height="400px"
              >
                <template #option="slotProps">
                  <div class="flex items-center justify-between w-full p-1">
                    <div class="flex flex-col gap-1">
                      <div class="font-bold text-slate-800 uppercase">
                        {{ slotProps.option.team_name }}
                      </div>
                      <div class="flex items-center gap-2 text-xs text-slate-600">
                        <span class="uppercase">{{ slotProps.option.team_owner }}</span>
                        <span class="text-slate-400">|</span>
                        <span class="font-medium">
                          {{ transfersRemainingCount(slotProps.option) }}/4 transfers left
                        </span>
                      </div>
                    </div>

                    <Tag
                      v-tooltip="`${transfersRemainingCount(slotProps.option)} transfers remaining`"
                      :severity="
                        transfersRemainingCount(slotProps.option) > 2 ? 'success'
                        : transfersRemainingCount(slotProps.option) > 0 ? 'warn'
                          : 'danger'
                      "
                      class="h-6 w-6 text-xs font-bold"
                      rounded
                      :value="transfersRemainingCount(slotProps.option)"
                    />
                  </div>
                </template>
              </Select>

              <!-- Selected Team Display -->
              <div v-if="selectedDraftedTeam">
                <DraftedTeam
                  :editable="true"
                  :drafted-team="selectedDraftedTeam"
                />
              </div>

              <!-- Empty State / Guidance -->
              <div
                v-else
                class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center flex-1 flex items-center justify-center"
              >
                <div class="flex flex-col items-center gap-4">
                  <Icon
                    name="carbon:group"
                    size="48"
                    class="text-slate-400"
                  />
                  <div>
                    <h3 class="text-xl font-semibold text-slate-700 mb-3">
                      No Team Selected
                    </h3>
                    <p class="text-base text-slate-600 mb-6">
                      Choose a team from the dropdown above to view and manage their transfers, players, and settings.
                    </p>
                    <div class="text-sm text-slate-500 space-y-2">
                      <div class="flex items-center justify-center gap-3">
                        <div class="w-3 h-3 bg-green-500 rounded-full" />
                        <span>Green: 3+ transfers remaining</span>
                      </div>
                      <div class="flex items-center justify-center gap-3">
                        <div class="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span>Yellow: 1-2 transfers remaining</span>
                      </div>
                      <div class="flex items-center justify-center gap-3">
                        <div class="w-3 h-3 bg-red-500 rounded-full" />
                        <span>Red: No transfers remaining</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </Card>
      </div>
      <div class="update-log" />
    </div>
  </div>
</template>

<style scoped>
.dashboard-settings-card {
  @apply shadow-sm border border-slate-200;
}

.dashboard-settings-card :deep(.p-card-title) {
  @apply pb-4 border-b border-slate-200 mb-0;
}

.dashboard-settings-card :deep(.p-card-content) {
  @apply pt-6;
}
</style>
