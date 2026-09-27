<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { useToast as useNuxtToast } from '@nuxt/ui/composables';
import { z } from 'zod';
import { usePlayerStore } from '~/stores/players';
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';
import type { PlayerWithSeasonStatistics } from '~/types/Player';
import { useAppSettings } from '@/composables/useAppSettings';
import { loadPlayerFallbackImage } from '@/utils/images';

interface TransferData {
  player: (PlayerWithSeasonStatistics & { disabled?: boolean }) | undefined;
  transferWeek: number;
}

type TransferPlayerOption = PlayerWithSeasonStatistics & {
  disabled?: boolean;
  disabledLabel?: string;
};

const { getCurrentGameweek } = useAppSettings();

const toast = useNuxtToast();

const transferSchema = z.object({
  player: z.custom<PlayerWithSeasonStatistics>(
    value => !!value && typeof value === 'object' && 'player_id' in value,
    { message: 'Select a player' },
  ),
  transferWeek: z.number().int('Transfer week must be a whole number').min(1, 'Transfer week must be at least 1').max(38, 'Transfer week must be 38 or less'),
});

type TransferSchema = z.output<typeof transferSchema>;

const newTransferData = reactive<TransferData>({
  player: undefined,
  transferWeek: Math.min((await getCurrentGameweek()) + 1, 38),
});
const stepperButton = {
  color: 'neutral' as const,
  variant: 'ghost' as const,
  class: 'dark:!text-slate-50 dark:hover:!bg-slate-800',
};

const visible = defineModel<boolean>('visible');
const draftedPlayer = defineModel<DraftedPlayer>('draftedPlayer');

const props = defineProps({
  editable: {
    type: Boolean,
    default: false,
  },
  requestMode: {
    type: Boolean,
    default: false,
  },
  targetGameweek: {
    type: Number,
    default: null,
  },
  activeGameweek: {
    type: Number,
    default: null,
  },
  selectionDisabled: {
    type: Boolean,
    default: false,
  },
  team: {
    type: Object as PropType<DraftedTeamWithPlayers>,
    default: null,
  },
});

const emit = defineEmits<{
  requestTransfer: [player: PlayerWithSeasonStatistics];
}>();

const playerStore = usePlayerStore();
const draftedTeamsStore = useDraftedTeamsStore();

const availableTransferPlayers = computed<TransferPlayerOption[]>(() => {
  const currentTeamPlayerIDs = new Set(
    props.team?.players.map((player) => {
      const activeTransfer = props.activeGameweek === null
        ? player.transfers.at(-1)
        : player.transfers.filter(transfer => transfer.transfer_week <= props.activeGameweek!).at(-1);
      return activeTransfer?.data.player_id ?? player.data.player_id;
    }),
  );

  return playerStore.players.filter(
    player => player.position === draftedPlayer.value?.data.position,
  ).map((player) => {
    const isCurrentTeamPlayer = currentTeamPlayerIDs.has(player.player_id);
    const isUnavailable = Boolean(player.unavailable_for_season);

    return {
      ...player,
      disabled: isUnavailable || (props.requestMode && isCurrentTeamPlayer),
      disabledLabel: isUnavailable
        ? 'Unavailable'
        : props.requestMode && isCurrentTeamPlayer
          ? 'Already in team'
          : undefined,
    };
  });
});

// Budget validation logic
const budgetLimit = computed(() => {
  return props.team?.allowed_transfers ? 85 : 90;
});

const currentTeamValue = computed(() => {
  if (!props.team?.players) return 0;
  return props.team.players.reduce((total, player) => {
    const activeTransfer = props.activeGameweek === null
      ? player.transfers.at(-1)
      : player.transfers.filter(transfer => transfer.transfer_week <= props.activeGameweek!).at(-1);
    const playerCost = activeTransfer
      ? activeTransfer.data.cost
      : player.data.cost;
    return total + playerCost;
  }, 0);
});

const teamValueWithTransfer = computed(() => {
  if (!newTransferData.player || !draftedPlayer.value) return currentTeamValue.value;

  const activeTransfer = props.activeGameweek === null
    ? draftedPlayer.value.transfers.at(-1)
    : draftedPlayer.value.transfers.filter(transfer => transfer.transfer_week <= props.activeGameweek!).at(-1);
  const originalPlayerCost = activeTransfer
    ? activeTransfer.data.cost
    : draftedPlayer.value.data.cost;

  const newPlayerCost = newTransferData.player.cost;

  return currentTeamValue.value - originalPlayerCost + newPlayerCost;
});

const transferWouldExceedBudget = computed(() => {
  if (!newTransferData.player || !props.team) return false;
  return teamValueWithTransfer.value > budgetLimit.value;
});

const selectedPlayerIsDisabled = computed(() => {
  if (!newTransferData.player) return false;
  if (newTransferData.player.unavailable_for_season) return true;
  if (!props.requestMode) return false;

  return props.team?.players.some((player) => {
    const activeTransfer = props.activeGameweek === null
      ? player.transfers.at(-1)
      : player.transfers.filter(transfer => transfer.transfer_week <= props.activeGameweek!).at(-1);
    const currentPlayerID = activeTransfer?.data.player_id ?? player.data.player_id;
    return currentPlayerID === newTransferData.player?.player_id;
  }) ?? false;
});

const isSubmitDisabled = computed(() => {
  return !newTransferData.player || selectedPlayerIsDisabled.value || transferWouldExceedBudget.value;
});

const clearSelectedPlayer = () => {
  newTransferData.player = undefined;
};

watch([visible, draftedPlayer], ([isVisible]) => {
  if (isVisible) clearSelectedPlayer();
});

const addNewTransfer = async (event: FormSubmitEvent<TransferSchema>) => {
  try {
    if (!draftedPlayer.value) {
      throw new Error('No player was found');
    }

    const transferData = event.data;

    if (props.requestMode) {
      if (selectedPlayerIsDisabled.value) {
        throw new Error('That player is unavailable for this transfer request.');
      }
      emit('requestTransfer', transferData.player);
      return;
    }

    // Update the DB with the new transfer
    const newTransfer = await draftedTeamsStore.addNewTransfer([
      {
        drafted_player: draftedPlayer.value.drafted_player_id,
        player_id: transferData.player.player_id!,
        transfer_week: transferData.transferWeek,
      },
    ]);

    // Build a new transfer obj using the new data returned
    // from DB and push it to the players transfer array
    if (draftedPlayer.value && newTransfer[0]) {
      draftedPlayer.value.transfers.push({
        drafted_transfer_id: newTransfer[0].drafted_transfer_id,
        transfer_week: transferData.transferWeek,
        data: transferData.player,
        selected: false,
      });

      handleApiSuccess(`Transfer was successful`, toast);
    }
  }
  catch (err: unknown) {
    handleApiError(err, toast);
  }
};

const handleDeleteTransfer = async (draftedTransferID: number) => {
  try {
    if (!draftedPlayer.value) {
      throw new Error('No player was found');
    }
    await draftedTeamsStore.deleteTransfer(draftedTransferID);
    draftedPlayer.value.transfers = draftedPlayer.value.transfers.filter(
      x => x.drafted_transfer_id !== draftedTransferID,
    );
    handleApiSuccess('Transfer was removed', toast);
  }
  catch (err) {
    handleApiError(err, toast);
  }
};

const modalUi = computed(() => ({
  overlay: 'bg-slate-950/75',
  content: [
    'w-[calc(100vw-2rem)] bg-white text-slate-900 ring-slate-200 divide-slate-200',
    'dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700 dark:divide-slate-700',
    props.editable ? 'sm:max-w-5xl' : 'sm:max-w-3xl',
  ].join(' '),
  header: 'bg-white dark:bg-slate-900',
  body: 'bg-white dark:bg-slate-900',
  title: 'text-slate-900 dark:text-slate-100',
  close: 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
}));
</script>

<template>
  <UModal
    v-model:open="visible"
    title="Player transfers"
    :dismissible="true"
    :ui="modalUi"
  >
    <template #body>
      <div
        :class="props.requestMode
          ? 'flex flex-col gap-6'
          : 'grid grid-cols-1 gap-8 lg:min-w-[30rem] lg:grid-cols-3'"
      >
        <div
          :class="props.requestMode
            ? ''
            : props.editable
              ? 'lg:col-span-2'
              : 'lg:col-span-3'"
        >
          <div class="mb-6">
            <h2 class="mb-2 text-lg font-black uppercase">
              Original Player
            </h2>
            <div class="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
              <DraftedPlayer
                v-if="draftedPlayer"
                :drafted-player="draftedPlayer"
              />
            </div>
          </div>
          <div
            v-if="draftedPlayer?.transfers.length"
            class="mb-6"
          >
            <h2 class="mb-2 text-lg font-black uppercase">
              Transfers
            </h2>
            <div
              v-for="playerTransfer in draftedPlayer.transfers"
              :key="playerTransfer.drafted_transfer_id"
              class="mb-4 flex flex-col"
            >
              <h3 class="mb-2 flex self-start text-sm font-bold uppercase">
                gameweek {{ playerTransfer.transfer_week }}
              </h3>
              <div class="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                <Icon
                  class="h-6 w-6"
                  name="material-symbols:subdirectory-arrow-right-rounded"
                />
                <DraftedPlayer :drafted-player="playerTransfer" />
                <UButton
                  v-if="props.editable"
                  icon="typcn:delete"
                  color="error"
                  variant="ghost"
                  size="xl"
                  square
                  aria-label="Cancel"
                  @click="
                    handleDeleteTransfer(playerTransfer.drafted_transfer_id)
                  "
                />
              </div>
            </div>
          </div>
        </div>

        <div v-if="props.editable || props.requestMode">
          <h2 class="mb-2 text-lg font-black uppercase">
            {{ props.requestMode ? 'Request transfer' : 'Submit new transfer' }}
          </h2>
          <p
            v-if="props.requestMode && props.targetGameweek"
            class="mb-4 text-sm text-muted"
          >
            This request will apply to
            <strong class="font-semibold text-highlighted">
              Gameweek {{ props.targetGameweek }}
            </strong>
            if approved.
          </p>
          <UForm
            :schema="transferSchema"
            :state="newTransferData"
            class="flex flex-col items-start gap-4"
            @submit="addNewTransfer"
          >
            <UFormField
              class="w-full"
              label="Player"
              name="player"
            >
              <div class="flex w-full items-center gap-2">
                <USelectMenu
                  v-model="newTransferData.player"
                  class="min-w-0 flex-1"
                  :items="availableTransferPlayers"
                  label-key="web_name"
                  placeholder="Select a Player"
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
                        :alt="modelValue.web_name"
                        @error="loadPlayerFallbackImage"
                      >
                      <div class="min-w-0">
                        <p class="truncate">
                          {{ modelValue.web_name }}
                        </p>
                        <p class="truncate text-xs text-muted">
                          {{ modelValue.team_name ?? modelValue.team_short_name ?? 'Unknown team' }}
                        </p>
                      </div>
                    </div>
                    <span v-else>Select a Player</span>
                  </template>
                  <template #item-label="{ item }">
                    <div
                      class="flex w-full min-w-0 items-center gap-2"
                      :class="{ 'opacity-50': item.disabled }"
                    >
                      <img
                        class="size-7 shrink-0 rounded-full bg-muted object-cover"
                        :src="item.image ?? undefined"
                        :alt="item.web_name"
                        @error="loadPlayerFallbackImage"
                      >
                      <div class="min-w-0 flex-1">
                        <p class="truncate">
                          {{ item.web_name }}
                        </p>
                        <p class="truncate text-xs text-muted">
                          {{ item.team_name ?? item.team_short_name ?? 'Unknown team' }}
                        </p>
                      </div>
                      <div class="shrink-0 text-right text-xs text-muted">
                        <UBadge
                          v-if="item.disabled"
                          :color="item.disabledLabel === 'Unavailable' ? 'error' : 'neutral'"
                          variant="soft"
                          class="whitespace-nowrap text-[0.65rem]"
                        >
                          {{ item.disabledLabel ?? 'Unavailable' }}
                        </UBadge>
                        <span v-else>£{{ item.cost }}m</span>
                      </div>
                    </div>
                  </template>
                </USelectMenu>
                <UButton
                  v-if="newTransferData.player"
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  square
                  type="button"
                  aria-label="Clear selected replacement player"
                  title="Clear selected replacement player"
                  @click="clearSelectedPlayer"
                />
              </div>
            </UFormField>
            <UFormField
              v-if="!props.requestMode"
              class="w-full"
              label="Transfer Week"
              name="transferWeek"
            >
              <UInputNumber
                v-model="newTransferData.transferWeek"
                :min="1"
                :max="38"
                class="w-full"
                :increment="stepperButton"
                :decrement="stepperButton"
              />
            </UFormField>
            <div
              v-if="newTransferData.player"
              class="flex w-full flex-col gap-2"
            >
              <div class="text-sm font-semibold">
                Budget Status
              </div>
              <div
                class="rounded border p-2 text-sm"
                :class="transferWouldExceedBudget
                  ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-950/70 dark:text-red-200'
                  : 'border-green-300 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950/70 dark:text-green-200'"
              >
                <div class="flex justify-between">
                  <span>Budget Limit:</span>
                  <span>£{{ budgetLimit }}m</span>
                </div>
                <div class="flex justify-between">
                  <span>Current Team Value:</span>
                  <span>£{{ currentTeamValue.toFixed(1) }}m</span>
                </div>
                <div class="flex justify-between">
                  <span>With New Transfer:</span>
                  <span :class="transferWouldExceedBudget ? 'font-bold' : ''">
                    £{{ teamValueWithTransfer.toFixed(1) }}m
                  </span>
                </div>
              </div>
            </div>
            <UButton
              class="flex self-start"
              :label="props.requestMode ? 'Add to request' : 'Submit'"
              type="submit"
              :disabled="isSubmitDisabled || (props.requestMode && props.selectionDisabled)"
            />
          </UForm>
        </div>
      </div>
    </template>
  </UModal>
</template>
