<script setup lang="ts">
import type { DraftedTeam } from '~/types/DraftedTeam';
import { useFixtureStore } from '~/stores/fixtures';
import type { DraftedPlayerWithWeeklyStats } from '~/types/DraftedPlayer';

const fixtureStore = useFixtureStore();

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeam>,
    default: null,
  },
  activeWeek: {
    type: Number,
    required: true,
  },
});

const isActiveTransfer = (transferDate: Date) => {
  return new Date(transferDate) > new Date();
};

const selectedDraftedPlayer = ref();
const showDialog = ref(false);

const handleEditPlayer = (playerID: number) => {
  try {
    selectedDraftedPlayer.value = props.draftedTeam.players.find(
      x => x.data.player_id === playerID,
    );
    showDialog.value = true;
  }
  catch (error) {
    console.error('Error fetching drafted player:', error);
  }
};

const calculatedWeeklyStats = computed(() => {
  return props.draftedTeam.players.reduce(
    (accumulatedStats, player: DraftedPlayerWithWeeklyStats) => {
      // Check if player or any transfer has selected: true
      const selectedTransfer = player.selected
        ? player
        : player.transfers.find(transfer => transfer.selected);

      // Calculate points based on the selected transfer or the usual logic
      const currentPlayerPoints = selectedTransfer
        ? selectedTransfer.points || 0
        : player.transfers.reduce((points, transfer) => {
            return transfer.transfer_week <= fixtureStore.selectedGameweek
              ? transfer.points
              : points;
          }, player.points || 0);

      return {
        drafted_team_id: props.draftedTeam.drafted_team_id,
        points: accumulatedStats.points + currentPlayerPoints,
        goals: accumulatedStats.goals + (player.week_goals || 0),
        assists: accumulatedStats.assists + (player.week_assists || 0),
        red_cards: accumulatedStats.red_cards + (player.week_redcards ? 1 : 0),
        clean_sheets:
          accumulatedStats.clean_sheets + (player.week_cleansheets ? 1 : 0),
      };
    },
    {
      points: 0,
      goals: 0,
      assists: 0,
      red_cards: 0,
      clean_sheets: 0,
    },
  );
});

const emit = defineEmits(['calculated-weekly-stats']);
watch(calculatedWeeklyStats, (newValue) => {
  emit('calculated-weekly-stats', newValue);
});
</script>

<template>
  <div
    v-if="props.draftedTeam"
    class="rounded-sm bg-white p-4"
  >
    <div
      class="mb-2 flex items-center justify-between border-b border-gray-800 p-2 pt-0"
      :class="{
        'bg-red-200': props.draftedTeam?.is_invalid_team,
      }"
    >
      <div class="flex flex-col uppercase">
        <span class="text-lg font-black">{{
          props.draftedTeam?.team_name
        }}</span>
        <span class="text-xs font-light">{{
          props.draftedTeam?.team_owner
        }}</span>
      </div>
      <span
        v-if="props.draftedTeam?.allowed_transfers"
        v-tooltip.top="'Transfers allowed'"
        title="Transfers allowed"
      >
        <Icon
          size="24"
          name="ic:round-swap-horiz"
        />
      </span>
    </div>
    <div
      v-for="player in props.draftedTeam.players"
      :key="player.drafted_player_id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200 hover:bg-yellow-300':
          !!player.transfers.length
          && isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
        'bg-green-200 transition-all hover:bg-green-300':
          !!player.transfers.length
          && !isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
      }"
    >
      <div class="flex w-full items-center border-b border-gray-100">
        <DraftedPlayerWithPoints
          v-if="!player.transfers.length"
          :drafted-player="player"
        />
        <DraftedActivePlayer
          v-else-if="player.transfers.at(-1) !== null"
          :active-gameweek="activeWeek"
          :drafted-player="player"
          class="w-full cursor-pointer"
          @click="handleEditPlayer(player.data.player_id!)"
        />
      </div>
    </div>
    <div class="flex justify-between px-2.5 pt-2.5">
      <span>Total</span>
      <strong>
        {{ calculatedWeeklyStats.points }}
      </strong>
    </div>
  </div>
  <DraftedTransferSelectionDialog
    v-if="selectedDraftedPlayer"
    v-model:drafted-player="selectedDraftedPlayer"
    v-model:visible="showDialog"
  />
</template>
