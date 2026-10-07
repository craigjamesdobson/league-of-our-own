<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { useToast as useNuxtToast } from '@nuxt/ui/composables';
import type { z } from 'zod';
import type { DraftedPlayerWithWeeklyStats } from '~/types/DraftedPlayer';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';
import type { PlayerWithSeasonStatistics } from '~/types/Player';
import type { TransferHistory, TransferHistoryItem, TransferRequest } from '~/types/TransferRequest';
import { loadPlayerFallbackImage } from '~/utils/images';
import { TRANSFER_REQUEST_EMAIL } from '~~/shared/utils/contact';
import { getCurrentTransferPeriod, getTransferAvailability } from '~~/shared/utils/transferPeriod';
import { transferRequestSchema } from '~~/shared/utils/transferRequest';

const props = withDefaults(defineProps<{
  teams: DraftedTeamWithPlayers[];
  players: PlayerWithSeasonStatistics[];
  targetGameweek: number;
  activeGameweek?: number;
  transferCounts: Record<number, { beforeJanuary: number; afterJanuary: number }>;
  transferHistory?: TransferHistory;
  teamKey?: string;
  pendingRequest?: TransferRequest | null;
  showTeamPreview?: boolean;
  compact?: boolean;
}>(), {
  showTeamPreview: true,
  compact: false,
  transferHistory: () => ({ beforeJanuary: [], afterJanuary: [] }),
});

const emit = defineEmits<{
  submitted: [];
  cancelled: [];
}>();

type TransferRequestSchema = z.output<typeof transferRequestSchema>;
type PlayerOption = {
  id: number;
  draftedPlayerId: number | null;
  name: string;
  position: number;
  cost: number;
  image: string | null;
  disabled: boolean;
  disabledLabel?: string;
  teamName: string;
};

const emptyForm = (): TransferRequestSchema => ({
  teamId: 0,
  teamName: '',
  requesterName: '',
  requesterEmail: '',
  firstPlayerOut: '',
  firstPlayerIn: '',
  firstPlayerOutId: 0,
  firstPlayerInId: 0,
  secondPlayerOut: '',
  secondPlayerIn: '',
  secondPlayerOutId: null,
  secondPlayerInId: null,
});

const getInitialForm = (): TransferRequestSchema => {
  const team = props.teamKey ? props.teams[0] : undefined;
  const form = emptyForm();

  if (team) {
    form.teamId = team.drafted_team_id;
    form.teamName = team.team_name;
    form.requesterName = team.team_owner;
    form.requesterEmail = team.team_email;
  }

  props.pendingRequest?.items.forEach((item) => {
    if (item.transfer_number === 1) {
      form.firstPlayerOut = item.player_out;
      form.firstPlayerIn = item.player_in;
      form.firstPlayerOutId = item.drafted_player_id;
      form.firstPlayerInId = item.player_id;
    }
    if (item.transfer_number === 2) {
      form.secondPlayerOut = item.player_out;
      form.secondPlayerIn = item.player_in;
      form.secondPlayerOutId = item.drafted_player_id;
      form.secondPlayerInId = item.player_id;
    }
  });

  return form;
};

const formData = reactive<TransferRequestSchema>(getInitialForm());
const turnstileToken = ref<string | null>(null);
const turnstileTokenValue = computed({
  get: () => turnstileToken.value ?? undefined,
  set: (value: string | undefined) => {
    turnstileToken.value = value ?? null;
  },
});
const turnstileRef = ref();
const submitting = ref(false);
const submitted = ref(false);
const emailsSent = ref(false);
const errorMessage = ref<string | null>(null);
const website = ref('');
const cancellingTransferNumber = ref<number | null>(null);
const toast = useNuxtToast();

const selectedTeam = computed(() => props.teams.find(team => team.drafted_team_id === formData.teamId));
const isEditingPendingRequest = computed(() => Boolean(props.pendingRequest));
const pendingRequestChanged = computed(() => {
  if (!props.pendingRequest) return false;

  const firstItem = props.pendingRequest.items.find(item => item.transfer_number === 1);
  const secondItem = props.pendingRequest.items.find(item => item.transfer_number === 2);

  return firstItem?.drafted_player_id !== formData.firstPlayerOutId
    || firstItem?.player_id !== formData.firstPlayerInId
    || (secondItem?.drafted_player_id ?? null) !== formData.secondPlayerOutId
    || (secondItem?.player_id ?? null) !== formData.secondPlayerInId;
});

const clearFirstTransfer = () => {
  formData.firstPlayerOut = formData.secondPlayerOut;
  formData.firstPlayerIn = formData.secondPlayerIn;
  formData.firstPlayerOutId = formData.secondPlayerOutId ?? 0;
  formData.firstPlayerInId = formData.secondPlayerInId ?? 0;
  clearSecondTransfer();
};

const clearSecondTransfer = () => {
  formData.secondPlayerOut = '';
  formData.secondPlayerIn = '';
  formData.secondPlayerOutId = null;
  formData.secondPlayerInId = null;
};

const resetPlayerSelections = () => {
  clearSecondTransfer();
  clearFirstTransfer();
};

const selectedTeamInput = computed({
  get: () => selectedTeam.value,
  set: (team: DraftedTeamWithPlayers | undefined) => {
    formData.teamId = team?.drafted_team_id ?? 0;
    formData.teamName = team?.team_name ?? '';
    resetPlayerSelections();
  },
});

const getActiveTransfer = (player: DraftedPlayerWithWeeklyStats) => {
  if (props.activeGameweek === undefined) return player.transfers.at(-1);

  return player.transfers
    .filter(transfer => transfer.transfer_week <= props.activeGameweek!)
    .at(-1);
};

const toCurrentPlayerOption = (player: DraftedPlayerWithWeeklyStats): PlayerOption => {
  const activeTransfer = getActiveTransfer(player);
  const currentPlayer = activeTransfer?.data ?? player.data;

  return {
    id: currentPlayer.player_id,
    draftedPlayerId: player.drafted_player_id,
    name: currentPlayer.web_name,
    position: currentPlayer.position,
    cost: currentPlayer.cost,
    image: currentPlayer.image,
    disabled: false,
    teamName: currentPlayer.team_name ?? currentPlayer.team_short_name ?? 'Unknown team',
  };
};

const teamPlayerOptions = computed(() => (selectedTeam.value?.players ?? []).map(toCurrentPlayerOption));

const secondOutgoingOptions = computed<PlayerOption[]>(() => teamPlayerOptions.value.map(player => ({
  ...player,
  disabled: player.draftedPlayerId === formData.firstPlayerOutId,
  disabledLabel: 'Selected',
})));

const selectedFirstOut = computed(() => teamPlayerOptions.value.find(
  player => player.draftedPlayerId === formData.firstPlayerOutId,
));
const selectedSecondOut = computed(() => teamPlayerOptions.value.find(
  player => player.draftedPlayerId === formData.secondPlayerOutId,
));

const selectedFirstOutInput = computed({
  get: () => selectedFirstOut.value,
  set: (player: PlayerOption | undefined) => {
    formData.firstPlayerOutId = player?.draftedPlayerId ?? 0;
    formData.firstPlayerOut = player?.name ?? '';
    formData.firstPlayerInId = 0;
    formData.firstPlayerIn = '';
  },
});

const selectedSecondOutInput = computed({
  get: () => selectedSecondOut.value,
  set: (player: PlayerOption | undefined) => {
    formData.secondPlayerOutId = player?.draftedPlayerId ?? null;
    formData.secondPlayerOut = player?.name ?? '';
    formData.secondPlayerInId = null;
    formData.secondPlayerIn = '';
  },
});

const incomingOptions = (outgoing: PlayerOption | undefined, otherIncomingID: number) => {
  const currentTeamPlayerIDs = new Set(teamPlayerOptions.value.map(player => player.id));
  return props.players
    .filter(player => player.position === outgoing?.position)
    .map((player) => {
      const isCurrentTeamPlayer = currentTeamPlayerIDs.has(player.player_id);
      const isAlreadySelected = player.player_id === otherIncomingID;

      return {
        id: player.player_id,
        draftedPlayerId: null,
        name: player.web_name,
        position: player.position,
        cost: player.cost,
        image: player.image,
        disabled: Boolean(player.unavailable_for_season) || isCurrentTeamPlayer || isAlreadySelected,
        disabledLabel: player.unavailable_for_season
          ? 'Unavailable'
          : isCurrentTeamPlayer
            ? 'Already in team'
            : isAlreadySelected
              ? 'Selected'
              : undefined,
        teamName: player.team_name ?? player.team_short_name ?? 'Unknown team',
      };
    });
};

const firstIncomingOptions = computed(() => incomingOptions(selectedFirstOut.value, formData.secondPlayerInId ?? 0));
const secondIncomingOptions = computed(() => incomingOptions(selectedSecondOut.value, formData.firstPlayerInId));

const selectedFirstIn = computed(() => firstIncomingOptions.value.find(player => player.id === formData.firstPlayerInId));
const selectedSecondIn = computed(() => secondIncomingOptions.value.find(player => player.id === formData.secondPlayerInId));

const selectedFirstInInput = computed({
  get: () => selectedFirstIn.value,
  set: (player: PlayerOption | undefined) => {
    formData.firstPlayerInId = player?.id ?? 0;
    formData.firstPlayerIn = player?.name ?? '';
  },
});

const selectedSecondInInput = computed({
  get: () => selectedSecondIn.value,
  set: (player: PlayerOption | undefined) => {
    formData.secondPlayerInId = player?.id ?? null;
    formData.secondPlayerIn = player?.name ?? '';
  },
});

const currentTeamValue = computed(() => teamPlayerOptions.value.reduce((total, player) => total + player.cost, 0));
const requestedTeamValue = computed(() => {
  const firstOut = selectedFirstOut.value;
  const firstIn = selectedFirstIn.value;
  const secondOut = selectedSecondOut.value;
  const secondIn = selectedSecondIn.value;

  return currentTeamValue.value
    - (firstOut?.cost ?? 0)
    + (firstIn?.cost ?? 0)
    - (secondOut?.cost ?? 0)
    + (secondIn?.cost ?? 0);
});

const transferCount = computed(() => {
  const { afterJanuary } = getCurrentTransferPeriod();
  const counts = props.transferCounts[formData.teamId];
  return afterJanuary
    ? (counts?.beforeJanuary ?? 0) + (counts?.afterJanuary ?? 0)
    : counts?.beforeJanuary ?? 0;
});
const transferAllowanceLimit = computed(() => getCurrentTransferPeriod().afterJanuary ? 4 : 2);
const transferAvailability = computed(() => getTransferAvailability(
  props.transferCounts[formData.teamId],
));
const transferSelectionDisabled = computed(() => transferAvailability.value.disabled);
const transferSelectionMessage = computed(() => transferAvailability.value.message);
const firstTransferComplete = computed(() => formData.firstPlayerOutId > 0 && formData.firstPlayerInId > 0);
const secondTransferComplete = computed(() => formData.secondPlayerOutId !== null && formData.secondPlayerInId !== null);
const requestedTransferCount = computed(() => Number(firstTransferComplete.value) + Number(secondTransferComplete.value));
const totalTransferCount = computed(() => transferCount.value + requestedTransferCount.value);
const transferLimitReached = computed(() => requestedTransferCount.value > 0 && totalTransferCount.value > transferAllowanceLimit.value);
const transferAllowanceMessage = computed(() => transferLimitReached.value
  ? getCurrentTransferPeriod().afterJanuary
    ? 'This request exceeds the four-transfer limit for the season.'
    : 'This request exceeds the two-transfer limit before 1 January.'
  : transferSelectionDisabled.value
    ? transferSelectionMessage.value
    : `${transferCount.value} of ${transferAllowanceLimit.value} transfers used · ${requestedTransferCount.value} selected`);
const budgetLimit = computed(() => selectedTeam.value?.allowed_transfers ? 85 : 90);
const overBudget = computed(() => requestedTeamValue.value > budgetLimit.value);

type RequestedTransfer = TransferHistoryItem & {
  selectionNumber: 1 | 2;
  requestTransferNumber: 1 | 2 | null;
};

const getPendingRequestTransferNumber = (draftedPlayerId: number, playerId: number): 1 | 2 | null => {
  const transferNumber = props.pendingRequest?.items.find(item =>
    item.drafted_player_id === draftedPlayerId && item.player_id === playerId,
  )?.transfer_number;

  return transferNumber === 1 || transferNumber === 2 ? transferNumber : null;
};

const requestedTransfers = computed<RequestedTransfer[]>(() => [
  ...(firstTransferComplete.value
    ? [{
        playerOut: formData.firstPlayerOut,
        playerIn: formData.firstPlayerIn,
        transferWeek: props.targetGameweek,
        playerOutImage: selectedFirstOut.value?.image,
        playerInImage: selectedFirstIn.value?.image,
        playerOutTeam: selectedFirstOut.value?.teamName,
        playerInTeam: selectedFirstIn.value?.teamName,
        selectionNumber: 1 as const,
        requestTransferNumber: getPendingRequestTransferNumber(formData.firstPlayerOutId, formData.firstPlayerInId),
      }]
    : []),
  ...(secondTransferComplete.value
    ? [{
        playerOut: formData.secondPlayerOut,
        playerIn: formData.secondPlayerIn,
        transferWeek: props.targetGameweek,
        playerOutImage: selectedSecondOut.value?.image,
        playerInImage: selectedSecondIn.value?.image,
        playerOutTeam: selectedSecondOut.value?.teamName,
        playerInTeam: selectedSecondIn.value?.teamName,
        selectionNumber: 2 as const,
        requestTransferNumber: getPendingRequestTransferNumber(formData.secondPlayerOutId!, formData.secondPlayerInId!),
      }]
    : []),
]);

type TransferSlotView = {
  number: number;
  selectionNumber?: 1 | 2;
  requestTransferNumber?: 1 | 2;
  periodLabel: string;
  status: 'used' | 'pending' | 'selected' | 'available' | 'locked';
  statusLabel: string;
  transfer?: TransferHistoryItem;
};

const transferSlotViews = computed<TransferSlotView[]>(() => {
  const { afterJanuary } = getCurrentTransferPeriod();
  const createSlots = (
    entries: TransferHistoryItem[],
    startNumber: number,
    periodLabel: string,
    active: boolean,
    slotCount = 2,
  ): TransferSlotView[] => Array.from({ length: slotCount }, (_, index) => {
    const completedTransfer = entries[index];
    const pendingTransfer = !completedTransfer && active
      ? requestedTransfers.value[index - entries.length]
      : undefined;

    if (completedTransfer) {
      return {
        number: startNumber + index,
        periodLabel,
        status: 'used',
        statusLabel: 'Used',
        transfer: completedTransfer,
      };
    }

    if (pendingTransfer) {
      return {
        number: startNumber + index,
        selectionNumber: pendingTransfer.selectionNumber,
        requestTransferNumber: pendingTransfer.requestTransferNumber ?? undefined,
        periodLabel,
        status: props.pendingRequest && !pendingRequestChanged.value ? 'pending' : 'selected',
        statusLabel: props.pendingRequest && !pendingRequestChanged.value ? 'Awaiting approval' : 'Selected',
        transfer: pendingTransfer,
      };
    }

    return {
      number: startNumber + index,
      periodLabel,
      status: active ? 'available' : 'locked',
      statusLabel: active ? 'Available' : 'Locked',
    };
  });

  if (afterJanuary) {
    return createSlots(
      [...props.transferHistory.beforeJanuary, ...props.transferHistory.afterJanuary],
      1,
      'Season allowance',
      true,
      4,
    );
  }

  return [
    ...createSlots(props.transferHistory.beforeJanuary, 1, 'Before 1 January', !afterJanuary),
    ...createSlots(props.transferHistory.afterJanuary, 3, 'From 1 January', afterJanuary),
  ];
});

const transferSlotDescription = (slot: TransferSlotView) => {
  if (slot.transfer) return '';
  if (slot.status === 'available') return 'Ready to use';
  if (slot.status === 'locked') return slot.number > 2 ? 'Available from 1 January' : 'Window closed';
  return slot.statusLabel;
};

const clearTransferSlot = (slot: TransferSlotView) => {
  if (slot.selectionNumber === 1) clearFirstTransfer();
  if (slot.selectionNumber === 2) clearSecondTransfer();
};

const cancelPendingTransfer = async (transferNumber: number) => {
  if (!props.teamKey || !props.pendingRequest || cancellingTransferNumber.value !== null) return;

  const requestWasCancelled = props.pendingRequest.items.length === 1;

  try {
    cancellingTransferNumber.value = transferNumber;
    await $fetch(`/api/team-management/${encodeURIComponent(props.teamKey)}/transfer-request/item-cancel`, {
      method: 'POST',
      body: {
        transferRequestId: props.pendingRequest.transfer_request_id,
        transferNumber,
      },
    });

    emit('cancelled');
    toast.add({
      color: 'success',
      title: requestWasCancelled ? 'Transfer request removed' : 'Transfer removed',
      description: requestWasCancelled
        ? 'Your team is unchanged. You can submit a new request before the deadline.'
        : 'The remaining transfer is still awaiting approval.',
      duration: 4000,
    });
  }
  catch (error: unknown) {
    const statusMessage = error && typeof error === 'object' && 'statusMessage' in error
      ? error.statusMessage
      : undefined;
    toast.add({
      color: 'error',
      title: 'Transfer could not be removed',
      description: typeof statusMessage === 'string' ? statusMessage : 'Please try again.',
    });
  }
  finally {
    cancellingTransferNumber.value = null;
  }
};

const addTransferSelection = (draftedPlayerId: number, player: PlayerWithSeasonStatistics) => {
  if (transferSelectionDisabled.value) {
    errorMessage.value = transferSelectionMessage.value;
    return;
  }

  if (player.unavailable_for_season) {
    errorMessage.value = 'That player is unavailable for the season and cannot be requested.';
    return;
  }

  if (teamPlayerOptions.value.some(option => option.id === player.player_id)) {
    errorMessage.value = 'That player is already in your team and cannot be requested.';
    return;
  }

  const outgoing = teamPlayerOptions.value.find(
    option => option.draftedPlayerId === draftedPlayerId,
  );

  if (!outgoing) {
    errorMessage.value = 'That player is no longer part of your current team.';
    return;
  }

  const incoming: PlayerOption = {
    id: player.player_id,
    draftedPlayerId: null,
    name: player.web_name,
    position: player.position,
    cost: player.cost,
    image: player.image,
    disabled: Boolean(player.unavailable_for_season),
    teamName: player.team_name ?? player.team_short_name ?? 'Unknown team',
  };
  const existingSlot = formData.firstPlayerOutId === draftedPlayerId
    ? 1
    : formData.secondPlayerOutId === draftedPlayerId
      ? 2
      : null;
  const slot = existingSlot
    ?? (formData.firstPlayerOutId === 0 ? 1 : formData.secondPlayerOutId === null ? 2 : null);

  if (!slot) {
    errorMessage.value = 'You can request a maximum of two transfers at a time.';
    return;
  }

  const otherIncomingId = slot === 1 ? formData.secondPlayerInId : formData.firstPlayerInId;
  if (incoming.id === otherIncomingId) {
    errorMessage.value = 'A player can only be selected once in this request.';
    return;
  }

  if (slot === 1) {
    formData.firstPlayerOutId = outgoing.draftedPlayerId!;
    formData.firstPlayerOut = outgoing.name;
    formData.firstPlayerInId = incoming.id;
    formData.firstPlayerIn = incoming.name;
  }
  else {
    formData.secondPlayerOutId = outgoing.draftedPlayerId!;
    formData.secondPlayerOut = outgoing.name;
    formData.secondPlayerInId = incoming.id;
    formData.secondPlayerIn = incoming.name;
  }

  errorMessage.value = null;
};

defineExpose({ addTransferSelection });

const resetTurnstile = () => {
  turnstileToken.value = null;
  turnstileRef.value?.reset?.();
};

const submitRequest = async (event: FormSubmitEvent<TransferRequestSchema>) => {
  if (submitting.value) return;

  if (transferLimitReached.value) {
    errorMessage.value = getCurrentTransferPeriod().afterJanuary
      ? 'This request would exceed the four-transfer limit for the season.'
      : 'This request would exceed the two-transfer limit before 1 January.';
    return;
  }
  if (overBudget.value) {
    errorMessage.value = `These changes would exceed the £${budgetLimit.value}m team budget.`;
    return;
  }
  if (!turnstileToken.value) {
    errorMessage.value = 'Please complete the security check and try again.';
    return;
  }

  try {
    submitting.value = true;
    errorMessage.value = null;

    const response = await $fetch<{ emailsSent: boolean }>('/api/transfer-request', {
      method: 'POST',
      body: {
        ...event.data,
        teamKey: props.teamKey,
        pendingRequestId: props.pendingRequest?.transfer_request_id ?? null,
        turnstileToken: turnstileToken.value,
        website: website.value,
      },
    });

    emailsSent.value = response.emailsSent;
    submitted.value = true;
    emit('submitted');
    toast.add({
      color: 'success',
      title: isEditingPendingRequest.value ? 'Transfer request updated' : 'Transfer request sent',
      description: response.emailsSent
        ? 'We will review your request before updating your team.'
        : 'Your request was saved, but the confirmation emails could not be sent.',
      duration: 4000,
    });
  }
  catch (error: unknown) {
    const statusMessage = error && typeof error === 'object' && 'statusMessage' in error
      ? error.statusMessage
      : undefined;
    errorMessage.value = typeof statusMessage === 'string'
      ? statusMessage
      : 'We could not send your transfer request. Please try again.';
  }
  finally {
    submitting.value = false;
    resetTurnstile();
  }
};

const startAnotherRequest = () => {
  Object.assign(formData, emptyForm());
  website.value = '';
  submitted.value = false;
  emailsSent.value = false;
  errorMessage.value = null;
};
</script>

<template>
  <div
    :class="props.compact
      ? 'w-full'
      : 'grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]'"
  >
    <div
      v-if="props.compact"
      class="rounded-2xl border border-default bg-default p-4 shadow-sm sm:p-5"
    >
      <UAlert
        v-if="submitted"
        color="success"
        variant="soft"
        icon="i-lucide-check-circle-2"
        :title="isEditingPendingRequest ? 'Transfer request updated' : 'Transfer request sent'"
        :description="emailsSent
          ? `We have emailed you and ${TRANSFER_REQUEST_EMAIL}. We will check the request and contact you if there is a problem.`
          : 'Your request was saved, but we could not send the confirmation emails. We will still review the request and contact you if there is a problem.'"
      />
      <UForm
        v-else
        :schema="transferRequestSchema"
        :state="formData"
        class="flex flex-col gap-4"
        @submit="submitRequest"
      >
        <div>
          <h2 class="text-lg font-black uppercase">
            Transfer request
          </h2>
          <p class="mt-1 text-sm text-muted">
            Select up to two players to replace. Approved changes will apply to Gameweek {{ props.targetGameweek }}.
          </p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            v-for="slot in transferSlotViews"
            :key="slot.number"
            class="flex min-h-32 flex-col rounded-xl border p-4"
            :class="{
              'border-success/30 bg-success/5': slot.status === 'used',
              'border-warning/30 bg-warning/5': slot.status === 'pending',
              'border-primary/30 bg-primary/5': slot.status === 'selected' || slot.status === 'available',
              'border-default bg-default': slot.status === 'locked',
              'opacity-50': slot.status === 'locked',
            }"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2">
                <span
                  class="flex size-8 shrink-0 items-center justify-center rounded-full"
                  :class="{
                    'bg-success/15 text-success': slot.status === 'used',
                    'bg-warning/15 text-warning': slot.status === 'pending',
                    'bg-primary/15 text-primary': slot.status === 'selected' || slot.status === 'available',
                    'bg-muted/15 text-muted': slot.status === 'locked',
                  }"
                >
                  <UIcon
                    :name="slot.status === 'used'
                      ? 'i-lucide-check'
                      : slot.status === 'pending'
                        ? 'i-lucide-clock-3'
                        : slot.status === 'selected'
                          ? 'i-lucide-list-checks'
                          : slot.status === 'available'
                            ? 'i-lucide-unlock-keyhole'
                            : 'i-lucide-lock-keyhole'"
                    class="size-4"
                  />
                </span>
                <div class="min-w-0">
                  <p class="text-sm font-black uppercase tracking-wide text-highlighted">
                    Transfer {{ slot.number }}
                  </p>
                  <p class="mt-0.5 text-xs text-muted">
                    {{ slot.periodLabel }}
                  </p>
                </div>
              </div>
              <div class="flex shrink-0 items-center gap-1">
                <UBadge
                  class="rounded-full px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wide"
                  :color="slot.status === 'used'
                    ? 'success'
                    : slot.status === 'pending'
                      ? 'warning'
                      : slot.status === 'selected' || slot.status === 'available'
                        ? 'primary'
                        : 'neutral'"
                  variant="soft"
                >
                  {{ slot.statusLabel }}
                </UBadge>
                <UPopover
                  v-if="slot.status === 'pending' && isEditingPendingRequest"
                  :content="{ align: 'end', side: 'bottom' }"
                >
                  <UTooltip :text="`Remove transfer ${slot.number}`">
                    <UButton
                      color="error"
                      variant="soft"
                      size="xs"
                      icon="i-lucide-x"
                      square
                      type="button"
                      :aria-label="`Remove transfer ${slot.number}`"
                    />
                  </UTooltip>

                  <template #content>
                    <div class="w-72 p-4">
                      <p class="text-sm font-bold text-highlighted">
                        Remove this transfer?
                      </p>
                      <p class="mt-1 text-sm leading-5 text-muted">
                        <template v-if="props.pendingRequest?.items.length === 1">
                          This will cancel your current pending transfer. Your team will remain unchanged, and you can submit a new transfer request before the deadline.
                        </template>
                        <template v-else>
                          This will remove this transfer from your pending request. Your team will remain unchanged, and the other transfer will stay awaiting approval.
                        </template>
                      </p>
                      <UButton
                        class="mt-3 w-full justify-center"
                        color="error"
                        size="sm"
                        label="Yes, remove transfer"
                        :loading="cancellingTransferNumber === slot.requestTransferNumber"
                        @click="cancelPendingTransfer(slot.requestTransferNumber!)"
                      />
                    </div>
                  </template>
                </UPopover>
                <UButton
                  v-if="slot.status === 'selected'"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  type="button"
                  :aria-label="`Clear transfer ${slot.number}`"
                  :title="`Clear transfer ${slot.number}`"
                  @click="clearTransferSlot(slot)"
                />
              </div>
            </div>
            <div class="mt-4 min-w-0">
              <div
                v-if="slot.transfer"
                class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2"
                :title="`${slot.transfer.playerOut} → ${slot.transfer.playerIn}`"
              >
                <div class="flex min-w-0 items-center gap-2">
                  <img
                    class="size-8 shrink-0 rounded-full bg-muted object-cover"
                    :src="slot.transfer.playerOutImage ?? undefined"
                    :alt="slot.transfer.playerOut"
                    @error="loadPlayerFallbackImage"
                  >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold">
                      {{ slot.transfer.playerOut }}
                    </p>
                    <p class="truncate text-xs text-muted">
                      {{ slot.transfer.playerOutTeam || 'Unknown team' }}
                    </p>
                  </div>
                </div>
                <UIcon
                  name="i-lucide-arrow-right"
                  class="size-4 shrink-0 text-muted"
                />
                <div class="flex min-w-0 items-center gap-2">
                  <img
                    class="size-8 shrink-0 rounded-full bg-muted object-cover"
                    :src="slot.transfer.playerInImage ?? undefined"
                    :alt="slot.transfer.playerIn"
                    @error="loadPlayerFallbackImage"
                  >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold">
                      {{ slot.transfer.playerIn }}
                    </p>
                    <p class="truncate text-xs text-muted">
                      {{ slot.transfer.playerInTeam || 'Unknown team' }}
                    </p>
                  </div>
                </div>
              </div>
              <p
                v-else
                class="text-sm text-muted"
              >
                {{ transferSlotDescription(slot) }}
              </p>
              <p
                v-if="slot.transfer"
                class="mt-1 text-xs text-muted"
              >
                Gameweek {{ slot.transfer.transferWeek }}
              </p>
            </div>
          </div>
        </div>

        <UAlert
          v-if="selectedTeam && transferSelectionDisabled"
          color="warning"
          variant="soft"
          icon="i-lucide-calendar-clock"
          :description="transferSelectionMessage"
        />

        <div
          v-if="selectedTeam"
          class="flex flex-col gap-3 rounded-lg border border-default bg-default p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p class="text-xs font-black uppercase tracking-wide text-muted">
              Budget check
            </p>
            <p class="mt-1 text-sm text-muted">
              Squad value after these changes
            </p>
          </div>
          <div class="flex items-baseline gap-2">
            <span
              class="text-xl font-black"
              :class="{ 'text-error': overBudget }"
            >
              £{{ requestedTeamValue.toFixed(1) }}m
            </span>
            <span class="text-sm text-muted">/ £{{ budgetLimit }}m budget</span>
          </div>
        </div>

        <UAlert
          v-if="errorMessage"
          color="error"
          variant="soft"
          icon="i-lucide-triangle-alert"
          :description="errorMessage"
        />

        <label
          class="absolute -left-[9999px] h-px w-px overflow-hidden"
          aria-hidden="true"
        >
          Website
          <input
            v-model="website"
            type="text"
            name="website"
            tabindex="-1"
            autocomplete="off"
          >
        </label>

        <NuxtTurnstile
          ref="turnstileRef"
          v-model="turnstileTokenValue"
          class="self-start"
        />

        <UButton
          class="w-fit"
          :loading="submitting"
          :disabled="transferSelectionDisabled || transferLimitReached || overBudget || !selectedTeam"
          :label="submitting
            ? (isEditingPendingRequest ? 'Updating request...' : 'Sending request...')
            : (isEditingPendingRequest ? 'Save transfer request' : 'Send transfer request')"
          type="submit"
        />
      </UForm>
    </div>
    <UCard v-else>
      <UAlert
        v-if="submitted"
        color="success"
        variant="soft"
        icon="i-lucide-check-circle-2"
      >
        <template #title>
          {{ isEditingPendingRequest ? 'Transfer request updated' : 'Transfer request sent' }}
        </template>
        <template #description>
          <template v-if="emailsSent">
            We have emailed you and {{ TRANSFER_REQUEST_EMAIL }}. We will check the request and contact you if there is a problem.
          </template>
          <template v-else>
            Your request was saved, but we could not send the confirmation emails. We will still review the request and contact you if there is a problem.
          </template>
        </template>
      </UAlert>
      <template v-else>
        <UForm
          :schema="transferRequestSchema"
          :state="formData"
          class="flex flex-col gap-5"
          @submit="submitRequest"
        >
          <div>
            <h2 class="text-lg font-black uppercase">
              Your details
            </h2>
            <p class="mt-1 text-sm text-muted">
              We use these details to identify the request and reply to you if needed.
            </p>
          </div>

          <UFormField
            v-if="!props.teamKey"
            label="Your team"
            name="teamId"
            required
          >
            <USelectMenu
              v-model="selectedTeamInput"
              :items="props.teams"
              label-key="team_name"
              class="w-full"
              placeholder="Select your team"
              :search-input="{ placeholder: 'Search teams...' }"
            />
          </UFormField>

          <UAlert
            v-if="selectedTeam && props.showTeamPreview"
            color="info"
            variant="soft"
            icon="i-lucide-shield-check"
            :description="`${isEditingPendingRequest ? 'Managing' : 'Selected'} team: ${selectedTeam.team_name}. We will validate every requested player against this squad.`"
          />

          <div v-if="selectedTeam && props.showTeamPreview">
            <p class="mb-2 text-sm font-bold uppercase text-highlighted">
              Current team
            </p>
            <DraftedTeam
              :drafted-team="selectedTeam"
              :active-gameweek="props.activeGameweek"
            />
          </div>

          <div class="grid gap-5 sm:grid-cols-2">
            <UFormField
              label="Your name"
              name="requesterName"
              required
            >
              <UInput
                v-model="formData.requesterName"
                class="w-full"
                autocomplete="name"
                :disabled="Boolean(props.teamKey)"
              />
            </UFormField>
            <UFormField
              label="Email address"
              name="requesterEmail"
              required
            >
              <UInput
                v-model="formData.requesterEmail"
                class="w-full"
                type="email"
                autocomplete="email"
                :disabled="Boolean(props.teamKey)"
              />
            </UFormField>
          </div>

          <USeparator />

          <div>
            <h2 class="text-lg font-black uppercase">
              Transfer requests
            </h2>
            <p class="mt-1 text-sm text-muted">
              Select players from your team and choose replacements in the same position. Approved changes will apply to Gameweek {{ props.targetGameweek }}.
            </p>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div class="rounded-xl border border-default bg-default p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-xs font-black uppercase tracking-wide text-muted">
                  Transfer 1
                </p>
                <UButton
                  v-if="formData.firstPlayerOutId || formData.firstPlayerInId"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  type="button"
                  aria-label="Clear transfer 1"
                  title="Clear transfer 1"
                  @click="clearFirstTransfer"
                />
              </div>
              <div class="flex flex-col gap-4">
                <UFormField
                  label="Player leaving"
                  name="firstPlayerOutId"
                  required
                >
                  <USelectMenu
                    v-model="selectedFirstOutInput"
                    :items="teamPlayerOptions"
                    label-key="name"
                    class="w-full"
                    placeholder="Select a player"
                    :disabled="!selectedTeam || transferSelectionDisabled"
                    :search-input="{ placeholder: 'Search your team...' }"
                  >
                    <template #default="{ modelValue }">
                      <div
                        v-if="modelValue"
                        class="flex min-w-0 items-center gap-2"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="modelValue.image ?? undefined"
                          :alt="modelValue.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0">
                          <p class="truncate">
                            {{ modelValue.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ modelValue.teamName }}
                          </p>
                        </div>
                      </div>
                      <span v-else>Select a player</span>
                    </template>
                    <template #item-label="{ item }">
                      <div
                        class="flex w-full min-w-0 items-center gap-2"
                        :class="{ 'opacity-50': item.disabled }"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="item.image ?? undefined"
                          :alt="item.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0 flex-1">
                          <p class="truncate">
                            {{ item.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ item.teamName }}
                          </p>
                        </div>
                        <UBadge
                          v-if="item.disabled"
                          :color="item.disabledLabel === 'Unavailable'
                            ? 'error'
                            : item.disabledLabel === 'Selected'
                              ? 'info'
                              : 'neutral'"
                          variant="soft"
                          class="shrink-0 whitespace-nowrap text-[0.65rem]"
                        >
                          {{ item.disabledLabel ?? 'Unavailable' }}
                        </UBadge>
                        <span
                          v-else
                          class="shrink-0 text-xs text-muted"
                        >£{{ item.cost }}m</span>
                      </div>
                    </template>
                  </USelectMenu>
                </UFormField>
                <UFormField
                  label="Player joining"
                  name="firstPlayerInId"
                  required
                >
                  <USelectMenu
                    v-model="selectedFirstInInput"
                    :items="firstIncomingOptions"
                    label-key="name"
                    class="w-full"
                    placeholder="Select a player"
                    :disabled="!selectedFirstOut || transferSelectionDisabled"
                    :search-input="{ placeholder: 'Search players...' }"
                  >
                    <template #default="{ modelValue }">
                      <div
                        v-if="modelValue"
                        class="flex min-w-0 items-center gap-2"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="modelValue.image ?? undefined"
                          :alt="modelValue.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0">
                          <p class="truncate">
                            {{ modelValue.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ modelValue.teamName }}
                          </p>
                        </div>
                      </div>
                      <span v-else>Select a player</span>
                    </template>
                    <template #item-label="{ item }">
                      <div
                        class="flex w-full min-w-0 items-center gap-2"
                        :class="{ 'opacity-50': item.disabled }"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="item.image ?? undefined"
                          :alt="item.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0 flex-1">
                          <p class="truncate">
                            {{ item.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ item.teamName }}
                          </p>
                        </div>
                        <UBadge
                          v-if="item.disabled"
                          :color="item.disabledLabel === 'Unavailable'
                            ? 'error'
                            : item.disabledLabel === 'Selected'
                              ? 'info'
                              : 'neutral'"
                          variant="soft"
                          class="shrink-0 whitespace-nowrap text-[0.65rem]"
                        >
                          {{ item.disabledLabel ?? 'Unavailable' }}
                        </UBadge>
                        <span
                          v-else
                          class="shrink-0 text-xs text-muted"
                        >£{{ item.cost }}m</span>
                      </div>
                    </template>
                  </USelectMenu>
                </UFormField>
              </div>
            </div>

            <div class="rounded-xl border border-default bg-default p-4">
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-xs font-black uppercase tracking-wide text-muted">
                  Transfer 2 <span class="font-normal normal-case">(optional)</span>
                </p>
                <UButton
                  v-if="formData.secondPlayerOutId !== null || formData.secondPlayerInId !== null"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  type="button"
                  aria-label="Clear transfer 2"
                  title="Clear transfer 2"
                  @click="clearSecondTransfer"
                />
              </div>
              <div class="flex flex-col gap-4">
                <UFormField
                  label="Player leaving"
                  name="secondPlayerOutId"
                >
                  <USelectMenu
                    v-model="selectedSecondOutInput"
                    :items="secondOutgoingOptions"
                    label-key="name"
                    class="w-full"
                    placeholder="Select a player"
                    :disabled="!selectedTeam || transferSelectionDisabled"
                    :search-input="{ placeholder: 'Search your team...' }"
                  >
                    <template #default="{ modelValue }">
                      <div
                        v-if="modelValue"
                        class="flex min-w-0 items-center gap-2"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="modelValue.image ?? undefined"
                          :alt="modelValue.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0">
                          <p class="truncate">
                            {{ modelValue.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ modelValue.teamName }}
                          </p>
                        </div>
                      </div>
                      <span v-else>Select a player</span>
                    </template>
                    <template #item-label="{ item }">
                      <div
                        class="flex w-full min-w-0 items-center gap-2"
                        :class="{ 'opacity-50': item.disabled }"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="item.image ?? undefined"
                          :alt="item.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0 flex-1">
                          <p class="truncate">
                            {{ item.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ item.teamName }}
                          </p>
                        </div>
                        <UBadge
                          v-if="item.disabled"
                          :color="item.disabledLabel === 'Unavailable'
                            ? 'error'
                            : item.disabledLabel === 'Selected'
                              ? 'info'
                              : 'neutral'"
                          variant="soft"
                          class="shrink-0 whitespace-nowrap text-[0.65rem]"
                        >
                          {{ item.disabledLabel ?? 'Unavailable' }}
                        </UBadge>
                        <span
                          v-else
                          class="shrink-0 text-xs text-muted"
                        >£{{ item.cost }}m</span>
                      </div>
                    </template>
                  </USelectMenu>
                </UFormField>
                <UFormField
                  label="Player joining"
                  name="secondPlayerInId"
                >
                  <USelectMenu
                    v-model="selectedSecondInInput"
                    :items="secondIncomingOptions"
                    label-key="name"
                    class="w-full"
                    placeholder="Select a player"
                    :disabled="!selectedSecondOut || transferSelectionDisabled"
                    :search-input="{ placeholder: 'Search players...' }"
                  >
                    <template #default="{ modelValue }">
                      <div
                        v-if="modelValue"
                        class="flex min-w-0 items-center gap-2"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="modelValue.image ?? undefined"
                          :alt="modelValue.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0">
                          <p class="truncate">
                            {{ modelValue.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ modelValue.teamName }}
                          </p>
                        </div>
                      </div>
                      <span v-else>Select a player</span>
                    </template>
                    <template #item-label="{ item }">
                      <div
                        class="flex w-full min-w-0 items-center gap-2"
                        :class="{ 'opacity-50': item.disabled }"
                      >
                        <img
                          class="size-7 shrink-0 rounded-full bg-muted object-cover"
                          :src="item.image ?? undefined"
                          :alt="item.name"
                          @error="loadPlayerFallbackImage"
                        >
                        <div class="min-w-0 flex-1">
                          <p class="truncate">
                            {{ item.name }}
                          </p>
                          <p class="truncate text-xs text-muted">
                            {{ item.teamName }}
                          </p>
                        </div>
                        <UBadge
                          v-if="item.disabled"
                          :color="item.disabledLabel === 'Unavailable'
                            ? 'error'
                            : item.disabledLabel === 'Selected'
                              ? 'info'
                              : 'neutral'"
                          variant="soft"
                          class="shrink-0 whitespace-nowrap text-[0.65rem]"
                        >
                          {{ item.disabledLabel ?? 'Unavailable' }}
                        </UBadge>
                        <span
                          v-else
                          class="shrink-0 text-xs text-muted"
                        >£{{ item.cost }}m</span>
                      </div>
                    </template>
                  </USelectMenu>
                </UFormField>
              </div>
            </div>
          </div>

          <UAlert
            v-if="selectedTeam"
            :color="transferLimitReached || overBudget
              ? 'error'
              : transferSelectionDisabled
                ? 'warning'
                : 'success'"
            variant="soft"
            icon="i-lucide-calculator"
          >
            <template #description>
              {{ transferAllowanceMessage }} · £{{ requestedTeamValue.toFixed(1) }}m / £{{ budgetLimit }}m budget
            </template>
          </UAlert>

          <UAlert
            v-if="errorMessage"
            color="error"
            variant="soft"
            icon="i-lucide-triangle-alert"
            :description="errorMessage"
          />

          <label
            class="absolute -left-[9999px] h-px w-px overflow-hidden"
            aria-hidden="true"
          >
            Website
            <input
              v-model="website"
              type="text"
              name="website"
              tabindex="-1"
              autocomplete="off"
            >
          </label>

          <NuxtTurnstile
            ref="turnstileRef"
            v-model="turnstileTokenValue"
            class="self-start"
          />

          <UButton
            class="w-fit"
            :loading="submitting"
            :disabled="transferSelectionDisabled || transferLimitReached || overBudget || !selectedTeam"
            :label="submitting
              ? (isEditingPendingRequest ? 'Updating request...' : 'Sending request...')
              : (isEditingPendingRequest ? 'Save transfer request' : 'Send transfer request')"
            type="submit"
          />
        </UForm>
      </template>

      <UButton
        v-if="submitted && !props.teamKey"
        class="mt-5 w-full justify-center"
        color="neutral"
        variant="soft"
        label="Submit another request"
        @click="startAnotherRequest"
      />
    </UCard>

    <aside
      v-if="!props.compact"
      class="flex flex-col gap-5"
    >
      <UAlert
        color="warning"
        variant="soft"
        icon="i-lucide-calendar-clock"
      >
        <template #title>
          Transfer limits
        </template>
        <template #description>
          Teams can make up to two transfers before 1 January and up to four across the season. Unused transfers carry over from 1 January. You can request up to two transfers at a time. Your squad, budget and remaining allowance are checked before the request is sent.
        </template>
      </UAlert>
      <UAlert
        color="info"
        variant="soft"
        icon="i-lucide-shield-check"
      >
        <template #description>
          This request is sent to {{ TRANSFER_REQUEST_EMAIL }} for manual review. Nothing changes on your team until an administrator applies and confirms it.
        </template>
      </UAlert>
    </aside>
  </div>
</template>
