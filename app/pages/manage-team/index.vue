<script setup lang="ts">
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';
import type { PlayerWithSeasonStatistics } from '~/types/Player';
import type { TransferHistory, TransferHistoryItem, TransferRequest } from '~/types/TransferRequest';
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
const reminderEmail = ref('');
const reminderTurnstileToken = ref<string | null>(null);
const reminderTurnstileRef = ref();
const reminderSubmitting = ref(false);
const reminderSubmitted = ref(false);
const reminderError = ref<string | null>(null);
const reminderTurnstileTokenValue = computed({
  get: () => reminderTurnstileToken.value ?? undefined,
  set: (value: string | undefined) => {
    reminderTurnstileToken.value = value ?? null;
  },
});

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

const requestManagementLink = async () => {
  if (reminderSubmitting.value) return;

  if (!reminderTurnstileToken.value) {
    reminderError.value = 'Please complete the security check and try again.';
    return;
  }

  try {
    reminderSubmitting.value = true;
    reminderError.value = null;
    await $fetch('/api/team-management-link', {
      method: 'POST',
      body: {
        email: reminderEmail.value,
        turnstileToken: reminderTurnstileToken.value,
      },
    });
    reminderSubmitted.value = true;
  }
  catch (error: unknown) {
    const statusMessage = error && typeof error === 'object' && 'statusMessage' in error
      ? error.statusMessage
      : undefined;
    reminderError.value = typeof statusMessage === 'string'
      ? statusMessage
      : 'We could not process that request. Please try again.';
  }
  finally {
    reminderSubmitting.value = false;
    reminderTurnstileToken.value = null;
    reminderTurnstileRef.value?.reset?.();
  }
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-5xl flex-col gap-5">
    <UCard v-if="!teamKey">
      <template #header>
        <div>
          <p class="text-xs font-black uppercase tracking-[0.2em] text-primary">
            Private team access
          </p>
          <h1 class="mt-1 text-2xl font-black uppercase text-highlighted">
            Find your team link
          </h1>
        </div>
      </template>
      <template v-if="!reminderSubmitted">
        <p class="text-sm text-muted">
          Your private team management link was sent to the email address used when your team was submitted. Enter that email below and we will send the link again.
        </p>
        <form
          class="mt-5 flex flex-col gap-4"
          @submit.prevent="requestManagementLink"
        >
          <UFormField
            label="Team submission email"
            required
          >
            <UInput
              v-model="reminderEmail"
              class="w-full"
              type="email"
              autocomplete="email"
              placeholder="you@example.com"
              required
            />
          </UFormField>
          <NuxtTurnstile
            ref="reminderTurnstileRef"
            v-model="reminderTurnstileTokenValue"
            class="self-start"
          />
          <UAlert
            v-if="reminderError"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            :description="reminderError"
          />
          <UButton
            type="submit"
            class="w-fit"
            :loading="reminderSubmitting"
            label="Email me my team link"
          />
        </form>
      </template>
      <UAlert
        v-else
        color="success"
        variant="soft"
        icon="i-lucide-mail-check"
        title="Check your inbox"
        description="If an eligible team is registered to that email address, we have sent a private team management link."
      />
      <p class="mt-5 text-sm text-muted">
        If you still cannot find the email, contact
        <a
          class="font-bold underline"
          :href="`mailto:${SUPPORT_EMAIL}`"
        >{{ SUPPORT_EMAIL }}</a>.
      </p>
    </UCard>

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
        :description="`Your request for Gameweek ${management.pendingRequest.target_gameweek} is now closed to changes because the deadline has passed. An administrator will review it before applying the transfer.`"
      />

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
