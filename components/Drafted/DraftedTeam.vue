<script setup lang="ts">
import DraftedPlayer from './DraftedPlayer.vue';
// import { useDraftedTeamsStore } from '@/stores/draftedTeams';
import type { DraftedTeam } from '~/types/DraftedTeam';

// const draftedTeamsStore = useDraftedTeamsStore();

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeam>,
    default: null,
  },
  editable: {
    type: Boolean,
    default: false,
  },
});

const isActiveTransfer = (transferDate: string) => {
  return new Date(transferDate) > new Date();
};

// const selectedDraftedPlayer = ref(null);
// const showDialog = ref(false);

// const handleEditPlayer = async (playerID: string) => {
//   await fetchDraftedPlayer(playerID);
//   showDialog.value = true;
// };

// const formatDate = (dateString: string) => {
//   return new Date(dateString);
// };

// const fetchDraftedPlayer = async (playerID: string) => {
//   try {
//     const player = await draftedTeamsStore.fetchDraftedPlayerByID(playerID);
//     selectedDraftedPlayer.value = player;
//   } catch (error) {
//     console.error('Error fetching drafted player:', error);
//   }
// };
</script>

<template v-if="props.draftedTeam">
  <div class="p-4 m-2 bg-white rounded-sm">
    <div
      class="flex items-center justify-between p-2 pt-0 mb-2 border-b border-gray-800"
      :class="{
        'bg-red-200': props.draftedTeam?.is_invalid_team,
      }"
    >
      <div class="flex flex-col uppercase">
        <span class="font-black">{{ props.draftedTeam?.team_name }}</span>
        <span class="text-xs font-light">{{
          props.draftedTeam?.team_owner
        }}</span>
      </div>
      <span v-if="props.draftedTeam?.allowed_transfers">
        <Icon size="24" name="ic:round-swap-horiz" />
      </span>
    </div>
    <div
      v-for="player in props.draftedTeam?.players"
      :key="player.player_id"
      class="relative text-sm"
      :class="{
        'bg-yellow-200':
          !!player.transfers.length &&
          isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
        'bg-green-200':
          !!player.transfers.length &&
          !isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
      }"
    >
      <DraftedPlayer v-if="!player.transfers.length" :drafted-player="player" />
      <div
        v-else-if="player.transfers.at(-1) !== null"
        class="cursor-pointer player-container"
      >
        <DraftedPlayer
          :is-transfer="true"
          :drafted-player="player.transfers.at(-1)!.player"
        />
        <div
          class="prev-transfer absolute left-0 z-10 gap-5 flex flex-col items-center justify-center invisible w-full p-2.5 text-center bg-green-200 top-full"
        >
          <div
            v-for="(transferredPlayer, index) in player.transfers"
            :key="transferredPlayer.player.player_id"
          >
            {{
              player.transfers[index - 1]?.player.web_name ?? player.web_name
            }}
            was transferred out in gameweek
            {{ transferredPlayer.transfer_week }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-between pt-2">
      <span>Total</span>
      <strong class="w-2/12 text-center">
        {{ props.draftedTeam.total_team_value }}
      </strong>
    </div>
  </div>
  <!-- <DraftedPlayerEditDialog
    v-if="editable"
    v-model:drafted-player="selectedDraftedPlayer"
    v-model:visible="showDialog"
  /> -->
</template>

<style>
.player-container:hover .prev-transfer {
  @apply !visible;
}
</style>
