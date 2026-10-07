<script setup lang="ts">
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';
import type { PlayerWithSeasonStatistics } from '~/types/Player';
import type { TransferHistory, TransferHistoryItem, TransferRequest } from '~/types/TransferRequest';
import TransferGameweekNotice from '~/components/TransferGameweekNotice.vue';
import TransferEntryLayout from '~/components/TransferEntryLayout.vue';
import { SUPPORT_EMAIL } from '~~/shared/utils/contact';
import { getCurrentTransferPeriod, getLondonDateKey, getTransferAvailability } from '~~/shared/utils/transferPeriod';

type TeamManagementResponse = {
  team: DraftedTeamWithPlayers;
  pendingRequest: TransferRequest | null;
  currentGameweek: number;
  targetGameweek: number | null;
  canEditPendingRequest: boolean;
};

const route = useRoute();
const playerStore = usePlayerStore();
const teamKey = typeof route.query.key === 'string' ? route.query.key : '';
const management = ref<TeamManagementResponse | null>(null);
const loadingError = ref<string | null>(null);
const managementRevision = ref(0);
const transferFormRef = ref<{
  addTransferSelection: (draftedPlayerId: number, player: PlayerWithSeasonStatistics) => void;
} | null>(null);
if (teamKey) {
  try {
    management.value = await $fetch<TeamManagementResponse>(
      `/api/team-management/${encodeURIComponent(teamKey)}`,
    );
    if (management.value.team.allowed_transfers) {
      await playerStore.fetchPlayers();
    }
  }
  catch (error: unknown) {
    const statusMessage = error && typeof error === 'object' && 'statusMessage' in error
      ? error.statusMessage
      : undefined;
    loadingError.value = typeof statusMessage === 'string'
      ? statusMessage
      : 'We could not open your team management link.';
  }
}

const refreshManagement = async () => {
  if (!teamKey) return;

  try {
    management.value = await $fetch<TeamManagementResponse>(
      `/api/team-management/${encodeURIComponent(teamKey)}`,
    );
    managementRevision.value++;
  }
  catch {
    loadingError.value = 'We could not refresh your team management page.';
  }
};

const handleTransferRequested = (payload: {
  draftedPlayerId: number;
  player: PlayerWithSeasonStatistics;
}) => {
  transferFormRef.value?.addTransferSelection(payload.draftedPlayerId, payload.player);
};

const handleTransferCancelled = async () => {
  await refreshManagement();
};

const transferCounts = computed(() => {
  const transferPeriod = getCurrentTransferPeriod();
  const counts = { beforeJanuary: 0, afterJanuary: 0 };

  management.value?.team.players.forEach((player) => {
    player.transfers.forEach((transfer) => {
      if (getLondonDateKey(new Date(transfer.created_at ?? 0)) < transferPeriod.januaryFirstKey) {
        counts.beforeJanuary++;
      }
      else {
        counts.afterJanuary++;
      }
    });
  });

  return management.value
    ? { [management.value.team.drafted_team_id]: counts }
    : {};
});

const transferAvailability = computed(() => {
  const teamID = management.value?.team.drafted_team_id;
  return getTransferAvailability(teamID ? transferCounts.value[teamID] : undefined);
});

type DatedTransferHistoryItem = TransferHistoryItem & { occurredAt: Date };

const transferHistory = computed<TransferHistory>(() => {
  const transferPeriod = getCurrentTransferPeriod();
  const history: { beforeJanuary: DatedTransferHistoryItem[]; afterJanuary: DatedTransferHistoryItem[] } = {
    beforeJanuary: [],
    afterJanuary: [],
  };

  management.value?.team.players.forEach((player) => {
    let previousPlayer = player.data;

    player.transfers.forEach((transfer) => {
      const occurredAt = new Date(transfer.created_at ?? 0);
      const entry = {
        playerOut: previousPlayer.web_name,
        playerIn: transfer.data.web_name,
        transferWeek: transfer.transfer_week,
        playerOutImage: previousPlayer.image,
        playerInImage: transfer.data.image,
        playerOutTeam: previousPlayer.team_name ?? previousPlayer.team_short_name,
        playerInTeam: transfer.data.team_name ?? transfer.data.team_short_name,
        occurredAt,
      };

      if (getLondonDateKey(occurredAt) < transferPeriod.januaryFirstKey) {
        history.beforeJanuary.push(entry);
      }
      else {
        history.afterJanuary.push(entry);
      }

      previousPlayer = transfer.data;
    });
  });

  history.beforeJanuary.sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());
  history.afterJanuary.sort((left, right) => left.occurredAt.getTime() - right.occurredAt.getTime());

  return {
    beforeJanuary: history.beforeJanuary.map(({ occurredAt: _occurredAt, ...entry }) => entry),
    afterJanuary: history.afterJanuary.map(({ occurredAt: _occurredAt, ...entry }) => entry),
  };
});
</script>

<template>
  <div
    class="mx-auto flex w-full min-w-0 flex-col gap-5"
    :class="teamKey ? 'max-w-5xl' : 'flex-1 py-4 lg:justify-center lg:py-8'"
  >
    <TransferEntryLayout
      v-if="!teamKey"
      title="Request a transfer"
      :show-back-link="false"
    >
      <p class="mt-3 text-base leading-7 text-muted dark:text-slate-300">
        How would you like to send your request?
      </p>
      <TransferGameweekNotice class="mt-4" />
      <div class="mt-5 divide-y divide-default dark:divide-slate-700">
        <section class="py-5">
          <h2 class="text-lg font-black uppercase tracking-wide text-highlighted">
            <UIcon
              name="i-lucide-mail"
              class="mr-2 inline-block size-5 align-middle text-primary dark:text-primary-300"
              aria-hidden="true"
            />
            By email
          </h2>
          <p class="mt-2 max-w-[65ch] text-base leading-7 text-muted dark:text-slate-300">
            Copy our template, fill in your details and email it to us. No team link is needed.
          </p>
          <UButton
            to="/manage-team/email"
            variant="soft"
            size="lg"
            trailing
            icon="i-lucide-arrow-right"
            label="View email instructions"
            class="mt-3 min-h-12 text-base dark:bg-primary-300/15 dark:text-primary-200 dark:hover:bg-primary-300/25"
          />
        </section>
        <section class="py-5">
          <h2 class="text-lg font-black uppercase tracking-wide text-highlighted">
            <UIcon
              name="i-lucide-monitor"
              class="mr-2 inline-block size-5 align-middle text-primary dark:text-primary-300"
              aria-hidden="true"
            />
            Online
          </h2>
          <p class="mt-2 max-w-[65ch] text-base leading-7 text-muted dark:text-slate-300">
            Get your team link, choose your players and check your budget on the website.
          </p>
          <UButton
            to="/manage-team/online"
            variant="soft"
            size="lg"
            trailing
            icon="i-lucide-arrow-right"
            label="Get my team link"
            class="mt-3 min-h-12 text-base dark:bg-primary-300/15 dark:text-primary-200 dark:hover:bg-primary-300/25"
          />
        </section>
      </div>
      <p class="mt-5 max-w-[65ch] text-base leading-7 text-muted dark:text-slate-300">
        We review every request before changing your team. The usual transfer rules and deadline apply.
      </p>
    </TransferEntryLayout>

    <UAlert
      v-else-if="loadingError"
      color="error"
      variant="soft"
      icon="i-lucide-link-2-off"
      title="Team link unavailable"
      :description="loadingError"
    />

    <UCard
      v-else-if="management && !management.team.allowed_transfers"
      class="mx-auto w-full max-w-2xl"
    >
      <div class="flex flex-col items-center text-center">
        <div class="flex size-14 items-center justify-center rounded-full bg-muted/50 text-muted">
          <UIcon
            name="i-lucide-shield-off"
            class="size-7"
          />
        </div>
        <p class="mt-5 text-xs font-black uppercase tracking-[0.2em] text-primary">
          Team management
        </p>
        <h1 class="mt-2 text-2xl font-black uppercase text-highlighted">
          Transfers are not enabled
        </h1>
        <p class="mt-3 max-w-lg text-sm leading-6 text-muted">
          {{ management.team.team_name }} did not opt in to transfers when the team was submitted, so transfer requests are not available for this team.
        </p>
        <p class="mt-4 text-sm text-muted">
          If you think this is incorrect, please contact
          <a
            class="font-bold underline"
            :href="`mailto:${SUPPORT_EMAIL}`"
          >{{ SUPPORT_EMAIL }}</a>.
        </p>
      </div>
    </UCard>

    <template v-else-if="management">
      <div>
        <p class="text-xs font-black uppercase tracking-[0.2em] text-primary">
          Private team management
        </p>
        <h1 class="mt-1 text-3xl font-black uppercase tracking-tight text-highlighted sm:text-4xl">
          {{ management.team.team_name }}
        </h1>
        <p class="mt-2 text-sm text-muted">
          Use this page to prepare and manage transfer requests for your team. Select up to two eligible player replacements, check your transfer allowance and budget, then submit the request for review. Requests remain pending until approved and can be changed or cancelled before the weekly deadline.
        </p>
      </div>

      <UAlert
        v-if="!management.targetGameweek"
        color="info"
        variant="soft"
        icon="i-lucide-calendar-off"
        title="Transfer requests are closed"
        description="Transfer requests cannot be submitted after the final gameweek."
      />

      <UAlert
        v-if="management.pendingRequest && !management.canEditPendingRequest"
        color="warning"
        variant="soft"
        icon="i-lucide-clock-3"
        title="Transfer request awaiting approval"
      >
        <template #description>
          <p>
            Your request for Gameweek {{ management.pendingRequest.target_gameweek }} is now closed to changes because the deadline has passed. An administrator will review it before applying the transfer.
          </p>
          <ul class="mt-3 space-y-2">
            <li
              v-for="item in management.pendingRequest.items"
              :key="item.transfer_request_item_id"
            >
              <span class="font-semibold">Out:</span> {{ item.player_out }}
              <span class="ml-2 font-semibold">In:</span> {{ item.player_in }}
            </li>
          </ul>
        </template>
      </UAlert>

      <div>
        <p class="mb-2 text-sm font-bold uppercase text-highlighted">
          Current team
        </p>
        <p class="mb-3 text-sm text-muted">
          This is your current team. Use the edit controls on a player to change your pending request; nothing changes until an administrator approves it. Pending transfers can be changed or cancelled until the weekly deadline.
        </p>
        <DraftedTeam
          :drafted-team="management.team"
          :active-gameweek="management.currentGameweek"
          :transfer-request-mode="Boolean(management.targetGameweek && (!management.pendingRequest || management.canEditPendingRequest))"
          :target-gameweek="management.pendingRequest?.target_gameweek ?? management.targetGameweek ?? undefined"
          :transfer-selection-disabled="transferAvailability.disabled"
          :transfer-selection-disabled-message="transferAvailability.message"
          @transfer-requested="handleTransferRequested"
        />
      </div>

      <TransferRequestForm
        v-if="management.targetGameweek && (!management.pendingRequest || management.canEditPendingRequest)"
        ref="transferFormRef"
        :key="`${management.pendingRequest?.transfer_request_id ?? 'new'}-${managementRevision}`"
        :teams="[management.team]"
        :players="playerStore.players as PlayerWithSeasonStatistics[]"
        :active-gameweek="management.currentGameweek"
        :target-gameweek="management.pendingRequest?.target_gameweek ?? management.targetGameweek"
        :transfer-counts="transferCounts"
        :transfer-history="transferHistory"
        :team-key="teamKey"
        :pending-request="management.pendingRequest"
        :show-team-preview="false"
        :compact="true"
        @submitted="refreshManagement"
        @cancelled="handleTransferCancelled"
      />
    </template>
  </div>
</template>
