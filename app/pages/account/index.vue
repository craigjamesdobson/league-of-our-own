<script setup lang="ts">
import { useToast as useNuxtToast } from '@nuxt/ui/composables';
import { useAccountStore } from '~/stores/account';
import { useDraftedTeamsStore } from '@/stores/draftedTeams';
import { useTransferRequestsStore } from '@/stores/transferRequests';
import { usePlayerStore } from '@/stores/players';
import { useAppSettings } from '@/composables/useAppSettings';

const accountStore = useAccountStore();
const draftedTeamStore = useDraftedTeamsStore();
const transferRequestsStore = useTransferRequestsStore();
const playerStore = usePlayerStore();
const { updateCurrentGameweek, getCurrentGameweek, onlineTransferRequestsEnabled } = useAppSettings();
const router = useRouter();

definePageMeta({
  middleware: ['auth'],
});

await draftedTeamStore.fetchDraftedTeams();
if (onlineTransferRequestsEnabled.value) {
  await transferRequestsStore.fetchPendingTransferRequests();
}

const selectedDraftedTeamID = ref<number | undefined>();
const selectedDraftedTeam = computed(() =>
  selectedDraftedTeamID.value
    ? draftedTeamStore.getDraftedTeamByID(selectedDraftedTeamID.value)
    : undefined,
);
const transferDraftedTeams = computed(() =>
  draftedTeamStore.getDraftedTeams?.filter(team => team.allowed_transfers) || [],
);

const toast = useNuxtToast();
const playerData = ref();
const updating = ref(false);
const reviewingRequestID = ref<number | null>(null);

const currentGameweek = ref<number>(4);
const isUpdatingGameweek = ref(false);
const stepperButton = {
  color: 'neutral' as const,
  variant: 'link' as const,
  class: 'text-muted hover:text-primary dark:hover:text-primary-300',
};

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

const getTransferRequestTeamName = (teamID: number) =>
  draftedTeamStore.getDraftedTeamByID(teamID)?.team_name ?? 'Selected team';

const getTransferRequestReviewMessage = (targetGameweek: number) => {
  if (targetGameweek > currentGameweek.value) {
    return `Advance the active gameweek to ${targetGameweek} before approving this request.`;
  }

  if (targetGameweek < currentGameweek.value) {
    return 'This request is past its target gameweek. Reject it and ask the team to submit a new request.';
  }

  return '';
};

const selectRequestTeam = (teamID: number) => {
  selectedDraftedTeamID.value = teamID;
};

const reviewTransferRequest = async (requestID: number, status: 'approved' | 'rejected') => {
  try {
    reviewingRequestID.value = requestID;
    await transferRequestsStore.reviewTransferRequest(requestID, status);
    if (status === 'approved') {
      await draftedTeamStore.fetchDraftedTeams();
    }
    toast.add({
      color: status === 'approved' ? 'success' : 'neutral',
      title: status === 'approved' ? 'Transfers applied' : 'Transfer request rejected',
      description: status === 'approved'
        ? 'The requested transfers are now live on the team.'
        : 'The team was not changed.',
      duration: 3000,
    });
  }
  catch (error) {
    handleApiError(error, toast);
  }
  finally {
    reviewingRequestID.value = null;
  }
};

onMounted(async () => {
  try {
    currentGameweek.value = await getCurrentGameweek();
  }
  catch (error) {
    console.error('Failed to load gameweek setting:', error);
    toast.add({
      color: 'error',
      title: 'Settings Error',
      description: 'Could not load current gameweek setting from database',
      duration: 3000,
    });
  }
});

const updateGameweek = async () => {
  try {
    isUpdatingGameweek.value = true;
    await updateCurrentGameweek(currentGameweek.value);
    toast.add({
      color: 'success',
      title: 'Dashboard Updated',
      description: `Current gameweek set to ${currentGameweek.value}`,
      duration: 3000,
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
    <div class="mb-4 flex w-full justify-end">
      <UButton
        icon="la:sign-out-alt"
        color="neutral"
        variant="ghost"
        label="Sign out"
        title="Sign out"
        aria-label="Sign out"
        @click.prevent="handleUserLogout"
      />
    </div>
    <div v-if="accountStore.userIsLoggedIn">
      <p class="m-4 text-center underline">
        Hello {{ accountStore.user?.email }}
      </p>

      <!-- Settings Section -->
      <div class="mb-8">
        <UCard class="dashboard-settings-card">
          <template #header>
            <div class="flex items-center gap-3 text-slate-800 dark:text-slate-100">
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

          <template #default>
            <!-- Current Gameweek Setting -->
            <div class="p-4 rounded-lg border border-slate-200 bg-gradient-to-r from-blue-50 to-slate-50 dark:border-slate-700 dark:from-blue-950/40 dark:to-slate-800">
              <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-2">
                    <Icon
                      name="carbon:calendar"
                      size="18"
                      class="text-slate-600 dark:text-slate-300"
                    />
                    <label class="text-base font-bold text-slate-800 uppercase tracking-wide dark:text-slate-100">
                      Current Gameweek
                    </label>
                  </div>
                  <p class="text-sm text-slate-600 dark:text-slate-300">
                    Controls which gameweek data is displayed on the homepage dashboard
                  </p>
                </div>

                <div class="flex gap-2 lg:ml-6">
                  <UInputNumber
                    v-model="currentGameweek"
                    :min="1"
                    :max="38"
                    :disabled="isUpdatingGameweek"
                    class="w-28"
                    :increment="stepperButton"
                    :decrement="stepperButton"
                  />
                  <UButton
                    label="Update"
                    icon="lucide:check"
                    :loading="isUpdatingGameweek"
                    @click="updateGameweek"
                  />
                </div>
              </div>
            </div>
          </template>
        </UCard>
      </div>

      <!-- Management Sections (Side by Side) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Player Data Management Section -->
        <UCard class="admin-section-card">
          <template #header>
            <div class="flex items-center gap-3 text-slate-800 dark:text-slate-100">
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

          <template #default>
            <div class="space-y-4">
              <!-- Automated Update Status -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4 dark:border-green-800 dark:bg-green-950/60">
                <div class="flex items-start gap-3">
                  <Icon
                    name="carbon:checkmark-filled"
                    size="18"
                    class="text-green-600 mt-0.5"
                  />
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-green-800 mb-1 dark:text-green-200">
                      Automated Daily Updates
                    </h4>
                    <p class="text-sm text-green-700 dark:text-green-300">
                      Player data is automatically updated daily from the Premier League API. No manual intervention required.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Manual Override Section -->
              <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 dark:border-amber-800 dark:bg-amber-950/60">
                <div class="flex items-start gap-3">
                  <Icon
                    name="carbon:warning-alt"
                    size="18"
                    class="text-amber-600 mt-0.5"
                  />
                  <div class="flex-1">
                    <h4 class="text-sm font-semibold text-amber-800 mb-1 dark:text-amber-200">
                      Manual Override
                    </h4>
                    <p class="text-sm text-amber-700 mb-2 dark:text-amber-300">
                      Use this section only if the automated update fails or you need to force an immediate update. Get the latest data from the API below and paste the JSON response.
                    </p>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2">
                      <code class="text-xs bg-white border rounded px-2 py-1 font-mono text-slate-800 break-all sm:break-normal dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                        https://fantasy.premierleague.com/api/bootstrap-static
                      </code>
                      <UTooltip text="Copy API URL">
                        <UButton
                          icon="carbon:copy"
                          color="neutral"
                          variant="ghost"
                          square
                          aria-label="Copy API URL"
                          @click="copyApiUrl"
                        />
                      </UTooltip>
                    </div>
                  </div>
                </div>
              </div>

              <UTextarea
                v-model="playerData"
                :rows="20"
                placeholder="Paste player data here..."
                class="w-full"
              />
              <div class="flex justify-end">
                <UButton
                  label="Update Players"
                  icon="lucide:upload"
                  :loading="updating"
                  @click="handleUpsertPlayerData"
                />
              </div>
            </div>
          </template>
        </UCard>

        <!-- Team Management Section -->
        <UCard
          v-if="draftedTeamStore.draftedTeams"
          class="admin-section-card h-full flex flex-col"
        >
          <template #header>
            <div class="flex items-center gap-3 text-slate-800 dark:text-slate-100">
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

          <template #default>
            <div class="space-y-4 flex-1 flex flex-col">
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Select a team below to view and manage transfers
              </p>
              <USelectMenu
                v-model="selectedDraftedTeamID"
                class="w-full"
                :items="transferDraftedTeams"
                label-key="team_name"
                value-key="drafted_team_id"
                placeholder="Select a team to manage..."
                :search-input="{ placeholder: 'Search teams...' }"
                :ui="{
                  content: 'max-h-[28rem]',
                  viewport: 'max-h-[24rem]',
                }"
              >
                <template #item-label="{ item }">
                  <div class="flex w-full flex-col gap-2 p-1">
                    <div class="flex flex-col gap-1">
                      <div class="font-bold text-slate-800 uppercase dark:text-slate-100">
                        {{ item.team_name }}
                      </div>
                      <div class="text-xs text-slate-600 dark:text-slate-300">
                        <span class="uppercase">{{ item.team_owner }}</span>
                      </div>
                    </div>
                    <DraftedTransferAllowance :drafted-team="item" />
                  </div>
                </template>
              </USelectMenu>

              <div
                v-if="onlineTransferRequestsEnabled"
                class="rounded-lg border border-default bg-default p-4"
              >
                <div class="mb-3 flex items-start gap-3">
                  <Icon
                    name="carbon:notification"
                    size="20"
                    class="mt-0.5 shrink-0 text-warning"
                  />
                  <div>
                    <h3 class="text-sm font-bold uppercase text-highlighted">
                      Pending transfer requests
                    </h3>
                    <p class="mt-1 text-xs text-muted">
                      Confirming a request applies the requested transfers to the live team. Reject requests that should not be applied.
                    </p>
                  </div>
                </div>

                <div
                  v-if="!transferRequestsStore.pendingRequests.length"
                  class="text-sm text-muted"
                >
                  No pending transfer requests.
                </div>
                <div
                  v-else
                  class="space-y-3"
                >
                  <div
                    v-for="request in transferRequestsStore.pendingRequests"
                    :key="request.transfer_request_id"
                    class="rounded-lg border border-default bg-default p-3"
                  >
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p class="font-bold text-highlighted">
                          {{ request.requester_name }} · {{ getTransferRequestTeamName(request.drafted_team_id) }}
                        </p>
                        <p class="text-xs text-muted">
                          {{ request.requester_email }} · Applies to Gameweek {{ request.target_gameweek }}
                        </p>
                      </div>
                      <UButton
                        size="xs"
                        color="neutral"
                        variant="soft"
                        label="Manage team"
                        @click="selectRequestTeam(request.drafted_team_id)"
                      />
                    </div>
                    <div class="mt-3 space-y-1 text-sm text-muted">
                      <p
                        v-for="item in request.items"
                        :key="item.transfer_request_item_id"
                      >
                        <span class="font-semibold">Transfer {{ item.transfer_number }}:</span>
                        {{ item.player_out }} → {{ item.player_in }}
                      </p>
                    </div>
                    <p
                      v-if="request.target_gameweek !== currentGameweek"
                      class="mt-3 text-xs font-medium text-warning"
                    >
                      {{ getTransferRequestReviewMessage(request.target_gameweek) }}
                    </p>
                    <div class="mt-3 flex flex-wrap justify-end gap-2">
                      <UButton
                        size="xs"
                        color="error"
                        variant="ghost"
                        label="Reject"
                        :loading="reviewingRequestID === request.transfer_request_id"
                        @click="reviewTransferRequest(request.transfer_request_id, 'rejected')"
                      />
                      <UButton
                        size="xs"
                        color="success"
                        variant="soft"
                        label="Confirm and apply"
                        :disabled="request.target_gameweek !== currentGameweek"
                        :title="request.target_gameweek === currentGameweek
                          ? 'Apply this request to the active gameweek'
                          : getTransferRequestReviewMessage(request.target_gameweek)"
                        :loading="reviewingRequestID === request.transfer_request_id"
                        @click="reviewTransferRequest(request.transfer_request_id, 'approved')"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Selected Team Display -->
              <div v-if="selectedDraftedTeam">
                <DraftedTransferAllowance
                  :drafted-team="selectedDraftedTeam"
                  class="mb-3"
                />
                <DraftedTeam
                  :editable="true"
                  :drafted-team="selectedDraftedTeam"
                  :active-gameweek="currentGameweek"
                />
              </div>

              <!-- Empty State / Guidance -->
              <div
                v-else
                class="bg-slate-50 border border-slate-200 rounded-lg p-8 text-center flex-1 flex items-center justify-center dark:border-slate-700 dark:bg-slate-800"
              >
                <div class="flex flex-col items-center gap-4">
                  <Icon
                    name="carbon:group"
                    size="48"
                    class="text-slate-400 dark:text-slate-500"
                  />
                  <div>
                    <h3 class="text-xl font-semibold text-slate-700 mb-3 dark:text-slate-200">
                      No Team Selected
                    </h3>
                    <p class="text-base text-slate-600 mb-6 dark:text-slate-300">
                      Choose a team from the dropdown above to view and manage their transfers, players, and settings.
                    </p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">
                      Up to two transfers can be used before 1 January, with four across the season.
                      Unused transfers carry over from 1 January.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </template>
        </UCard>
      </div>
      <div class="update-log" />
    </div>
  </div>
</template>

<style scoped>
@reference "@/assets/styles/base.css";

.dashboard-settings-card {
  @apply shadow-sm border border-slate-200;
}
</style>
