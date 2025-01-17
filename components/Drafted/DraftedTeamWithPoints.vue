<script setup lang="ts">
import type { DraftedTeam } from '~/types/DraftedTeam';
import { useWeeklyStatistics } from '~/composables/useWeeklyStatistics';
import type { DraftedPlayer, DraftedPlayerWithWeeklyStats, DraftedTransferWithWeeklyStats } from '~/types/DraftedPlayer';

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeam>,
    default: null,
  },
  activeWeek: {
    type: Number,
    required: true,
  },
  showPlayerOverride: {
    type: Boolean,
    default: false,
  },
});

const { draftedTeam, activeWeek } = toRefs(props);
const { calculatedWeeklyStats } = useWeeklyStatistics(draftedTeam, activeWeek);

const emit = defineEmits(['calculated-weekly-stats']);

watch(calculatedWeeklyStats, (newValue) => {
  emit('calculated-weekly-stats', newValue);
});

const findActiveGameweekPlayer = (player: DraftedPlayer): DraftedPlayerWithWeeklyStats | DraftedTransferWithWeeklyStats => {
  if (player.transfers.some(x => x.transfer_week <= props.activeWeek)) {
    return player.transfers.findLast(
      x => x.transfer_week <= props.activeWeek,
    )!;
  }
  else {
    return player;
  }
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
</script>

<template>
  <div
    v-if="props.draftedTeam"
    class="rounded-sm bg-white p-5"
  >
    <div class="flex flex-col uppercase">
      <span class="text-lg font-black">{{
        props.draftedTeam?.team_name
      }}</span>
      <span class="text-xs font-light">{{
        props.draftedTeam?.team_owner
      }}</span>
    </div>
    <div
      class="mb-2 flex items-center justify-between border-b border-gray-800 p-2 pt-0"
      :class="{
        'bg-red-200': props.draftedTeam?.is_invalid_team,
      }"
    />
    <div
      v-for="player in props.draftedTeam.players"
      :key="player.drafted_player_id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200':
          findActiveGameweekPlayer(player).transfer_week === props.activeWeek,
        'bg-green-200':
          findActiveGameweekPlayer(player).transfer_week < props.activeWeek,
      }"
    >
      <div class="relative flex w-full items-center border-b border-gray-100">
        <DraftedPlayerWithPoints
          :drafted-player="findActiveGameweekPlayer(player)"
          :transfer-count="player.transfers.filter(x => x.transfer_week <= props.activeWeek).length"
        />
        <div class="flex absolute left-[30%]">
          <Button
            v-if="showPlayerOverride && player.transfers.length"
            class="w-5 h-5 !p-0"
            severity="primary"
            rounded
            aria-label="Change active player"
            title="Change active player"
            size="small"
          >
            <Icon
              size="14"
              name="mingcute:user-edit-line"
              @click="handleEditPlayer(player.data.player_id)"
            />
          </Button>
        </div>
      </div>
    </div>
    <div class="flex justify-between py-2.5 pl-2.5 bg-surface-50">
      <span>Total</span>
      <strong class="w-2/12 text-center">
        {{ calculatedWeeklyStats.points }}
      </strong>
    </div>
  </div>
  <LazyDraftedTransferSelectionDialog
    v-if="selectedDraftedPlayer && showPlayerOverride"
    v-model:drafted-player="selectedDraftedPlayer"
    v-model:visible="showDialog"
  />
</template>
