<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import { useToast as useNuxtToast } from '@nuxt/ui/composables';
import { z } from 'zod';
import { usePlayerStore } from '~/stores/players';
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import type { DraftedPlayer } from '~/types/DraftedPlayer';
import type { DraftedTeamWithPlayers } from '~/types/DraftedTeam';
import type { Player } from '~/types/Player';
import { useAppSettings } from '@/composables/useAppSettings';

interface TransferData {
  player: Player | undefined;
  activeExpiryDate: string;
  transferWeek: number;
}

const { getCurrentGameweek } = useAppSettings();

const toast = useNuxtToast();

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const toDateFromInput = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year!, month! - 1, day!);
};

const transferSchema = z.object({
  player: z.custom<Player>(
    value => !!value && typeof value === 'object' && 'player_id' in value,
    { message: 'Select a player' },
  ),
  transferWeek: z.number().int('Transfer week must be a whole number').min(1, 'Transfer week must be at least 1').max(38, 'Transfer week must be 38 or less'),
  activeExpiryDate: z.string().min(1, 'Choose an active expiry date'),
});

type TransferSchema = z.output<typeof transferSchema>;

const newTransferData = reactive<TransferData>({
  player: undefined,
  activeExpiryDate: toInputDate(new Date()),
  transferWeek: await getCurrentGameweek() || 1,
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
  team: {
    type: Object as PropType<DraftedTeamWithPlayers>,
    default: null,
  },
});

const playerStore = usePlayerStore();
const draftedTeamsStore = useDraftedTeamsStore();

const availableTransferPlayers = computed(() => {
  return playerStore.players.filter(
    player => player.position === draftedPlayer.value?.data.position,
  );
});

// Budget validation logic
const budgetLimit = computed(() => {
  return props.team?.allowed_transfers ? 85 : 90;
});

const currentTeamValue = computed(() => {
  if (!props.team?.players) return 0;
  return props.team.players.reduce((total, player) => {
    const lastTransfer = player.transfers[player.transfers.length - 1];
    const playerCost = player.transfers.length > 0 && lastTransfer
      ? lastTransfer.data.cost
      : player.data.cost;
    return total + playerCost;
  }, 0);
});

const teamValueWithTransfer = computed(() => {
  if (!newTransferData.player || !draftedPlayer.value) return currentTeamValue.value;

  const lastTransfer = draftedPlayer.value.transfers[draftedPlayer.value.transfers.length - 1];
  const originalPlayerCost = draftedPlayer.value.transfers.length && lastTransfer
    ? lastTransfer.data.cost
    : draftedPlayer.value.data.cost;

  const newPlayerCost = newTransferData.player.cost;

  return currentTeamValue.value - originalPlayerCost + newPlayerCost;
});

const transferWouldExceedBudget = computed(() => {
  if (!newTransferData.player || !props.team) return false;
  return teamValueWithTransfer.value > budgetLimit.value;
});

const isSubmitDisabled = computed(() => {
  return !newTransferData.player || transferWouldExceedBudget.value;
});

const addNewTransfer = async (event: FormSubmitEvent<TransferSchema>) => {
  try {
    if (!draftedPlayer.value) {
      throw new Error('No player was found');
    }

    const transferData = event.data;
    const activeExpiryDate = toDateFromInput(transferData.activeExpiryDate);

    // Update the DB with the new transfer
    const newTransfer = await draftedTeamsStore.addNewTransfer([
      {
        drafted_player: draftedPlayer.value.drafted_player_id,
        active_transfer_expiry:
          activeExpiryDate.toDateString(),
        player_id: transferData.player.player_id!,
        transfer_week: transferData.transferWeek,
      },
    ]);

    // Build a new transfer obj using the new data returned
    // from DB and push it to the players transfer array
    if (draftedPlayer.value && newTransfer[0]) {
      draftedPlayer.value.transfers.push({
        drafted_transfer_id: newTransfer[0].drafted_transfer_id,
        active_transfer_expiry: activeExpiryDate,
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
      <div class="grid grid-cols-1 gap-10 lg:min-w-[30rem] lg:grid-cols-3">
        <div
          class="lg:col-span-2"
          :class="{ 'lg:col-span-3': !props.editable }"
        >
          <div class="mb-10">
            <h2 class="pb-2.5 text-lg font-black uppercase">
              Original Player
            </h2>
            <div class="rounded border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
              <DraftedPlayer
                v-if="draftedPlayer"
                :drafted-player="draftedPlayer"
              />
            </div>
          </div>
          <div
            v-if="draftedPlayer?.transfers.length"
            class="mb-5"
          >
            <h2 class="mb-2.5 text-lg font-black uppercase">
              Transfers
            </h2>
            <div
              v-for="playerTransfer in draftedPlayer.transfers"
              :key="playerTransfer.drafted_transfer_id"
              class="mb-5 flex flex-col"
            >
              <h3 class="mb-1.5 flex self-start text-sm font-bold uppercase">
                gameweek {{ playerTransfer.transfer_week }}
              </h3>
              <div class="flex items-center gap-2.5 rounded border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
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

        <div v-if="props.editable">
          <h2 class="mb-2.5 text-lg font-black uppercase">
            Submit new transfer
          </h2>
          <UForm
            :schema="transferSchema"
            :state="newTransferData"
            class="flex flex-col items-start gap-5"
            @submit="addNewTransfer"
          >
            <UFormField
              class="w-full"
              label="Player"
              name="player"
            >
              <USelectMenu
                v-model="newTransferData.player"
                class="w-full"
                :items="availableTransferPlayers"
                label-key="web_name"
                placeholder="Select a Player"
                :search-input="{ placeholder: 'Search players...' }"
              >
                <template #item-label="{ item }">
                  <div class="grid w-full grid-cols-[3rem_1fr_3rem] items-center gap-2">
                    <div>{{ item.player_id }}</div>
                    <div class="truncate text-center">
                      {{ item.web_name }}
                    </div>
                    <div class="text-right">
                      {{ item.cost }}
                    </div>
                  </div>
                </template>
              </USelectMenu>
            </UFormField>
            <UFormField
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
            <UFormField
              class="w-full"
              label="Active expiry date"
              name="activeExpiryDate"
            >
              <UInput
                v-model="newTransferData.activeExpiryDate"
                type="date"
                class="w-full"
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
              label="Submit"
              type="submit"
              :disabled="isSubmitDisabled"
            />
          </UForm>
        </div>
      </div>
    </template>
  </UModal>
</template>
