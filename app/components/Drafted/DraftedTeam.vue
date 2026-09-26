<script setup lang="ts">
import DraftedPlayer from './DraftedPlayer.vue';
import TeamAdminMetadataPopover from '~/components/Drafted/TeamAdminMetadataPopover.vue';
import type { DraftedTeamWithPlayers, TeamAdminMetadata } from '~/types/DraftedTeam';
import type { PlayerWithSeasonStatistics } from '~/types/Player';

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeamWithPlayers>,
    default: null,
  },
  editable: {
    type: Boolean,
    default: false,
  },
  transferRequestMode: {
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
  transferSelectionDisabled: {
    type: Boolean,
    default: false,
  },
  transferSelectionDisabledMessage: {
    type: String,
    default: '',
  },
  adminMetadata: {
    type: Object as PropType<TeamAdminMetadata>,
    default: undefined,
  },
  isYourTeam: {
    type: Boolean,
    default: false,
  },
  showYourTeamControl: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  toggleYourTeam: [];
  transferRequested: [payload: { draftedPlayerId: number; player: PlayerWithSeasonStatistics }];
}>();

const cardRootClass = computed(() => props.isYourTeam
  ? 'border border-warning/40 bg-default shadow-sm ring-1 ring-warning/10'
  : 'border border-default bg-default shadow-sm');

const getActiveTransfer = (player: DraftedTeamWithPlayers['players'][number]) => {
  if (props.activeGameweek === null) return player.transfers.at(-1);

  return player.transfers
    .filter(transfer => transfer.transfer_week <= props.activeGameweek!)
    .at(-1);
};

const getDisplayedPlayer = (player: DraftedTeamWithPlayers['players'][number]) => {
  const activeTransfer = getActiveTransfer(player);

  return activeTransfer
    ? { ...player, transfers: [activeTransfer] }
    : player;
};

const displayedTeamValue = computed(() => {
  if (!props.draftedTeam) return 0;
  if (!props.draftedTeam.players.length) return props.draftedTeam.total_team_value;

  return props.draftedTeam.players.reduce((total, player) => {
    const activeTransfer = getActiveTransfer(player);
    return total + (activeTransfer?.data.cost ?? player.data.cost);
  }, 0);
});

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

const handleTransferRequested = (player: PlayerWithSeasonStatistics) => {
  if (!selectedDraftedPlayer.value) return;

  emit('transferRequested', {
    draftedPlayerId: selectedDraftedPlayer.value.drafted_player_id,
    player,
  });
  showDialog.value = false;
};
</script>

<template>
  <UCard
    v-if="props.draftedTeam"
    class="text-highlighted"
    :ui="{
      root: cardRootClass,
      body: 'p-5 sm:p-5',
    }"
  >
    <div
      class="mb-2 flex items-center justify-between border-b border-default p-2 pt-0"
      :class="{
        'bg-error/10': props.draftedTeam?.is_invalid_team,
      }"
    >
      <div class="flex min-w-0 items-center gap-2">
        <template v-if="props.showYourTeamControl">
          <UTooltip
            v-if="props.isYourTeam"
            text="Remove your team"
          >
            <button
              type="button"
              role="radio"
              class="flex size-7 shrink-0 items-center justify-center rounded-full text-warning transition-colors hover:text-warning/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning"
              aria-checked="true"
              :aria-label="`Remove ${props.draftedTeam.team_name} as your team`"
              @click.stop="emit('toggleYourTeam')"
            >
              <Icon
                name="lucide:user-round-check"
                size="20"
                aria-hidden="true"
              />
            </button>
          </UTooltip>
          <UTooltip
            v-else
            text="Select as your team"
          >
            <button
              type="button"
              role="radio"
              class="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-accented bg-transparent transition-colors hover:border-warning focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-warning"
              aria-checked="false"
              :aria-label="`Select ${props.draftedTeam.team_name} as your team`"
              @click.stop="emit('toggleYourTeam')"
            />
          </UTooltip>
        </template>
        <div class="flex min-w-0 flex-col uppercase">
          <span class="truncate text-lg font-black">{{
            props.draftedTeam?.team_name
          }}</span>
          <span class="truncate text-xs font-light">{{
            props.draftedTeam?.team_owner
          }}</span>
        </div>
      </div>
      <div
        v-if="props.draftedTeam?.allowed_transfers || props.adminMetadata"
        class="flex items-center gap-1"
      >
        <UTooltip
          v-if="props.draftedTeam?.allowed_transfers"
          text="Transfers allowed"
        >
          <Icon
            size="24"
            name="ic:round-swap-horiz"
          />
        </UTooltip>
        <TeamAdminMetadataPopover
          v-if="props.adminMetadata"
          :metadata="props.adminMetadata"
        />
      </div>
    </div>
    <div
      v-for="player in props.draftedTeam.players"
      :key="player.drafted_player_id"
      class="relative text-sm"
      :class="{
        'bg-warning/10 hover:bg-warning/20':
          getActiveTransfer(player)?.transfer_week === props.activeGameweek,
        'bg-success/10 transition-all hover:bg-success/20':
          !!getActiveTransfer(player)
          && props.activeGameweek !== null
          && getActiveTransfer(player)!.transfer_week < props.activeGameweek,
      }"
    >
      <div class="flex w-full items-center border-b border-default">
        <DraftedPlayer
          v-if="!getActiveTransfer(player)"
          :drafted-player="player"
          :class="{ 'cursor-pointer': !!player.transfers.length }"
          @click="player.transfers.length && handleEditPlayer(player.data.player_id!)"
        />
        <DraftedTransfer
          v-else
          :drafted-player="getDisplayedPlayer(player)"
          class="w-full cursor-pointer"
          @click="handleEditPlayer(player.data.player_id!)"
        />
        <UButton
          v-if="props.editable || props.transferRequestMode"
          icon="tabler:switch-3"
          color="primary"
          variant="subtle"
          size="xs"
          square
          aria-label="Edit Player"
          :title="props.transferRequestMode && props.transferSelectionDisabled
            ? props.transferSelectionDisabledMessage
            : 'Edit Player'"
          class="mr-2"
          :disabled="props.transferRequestMode && props.transferSelectionDisabled"
          @click="handleEditPlayer(player.data.player_id!)"
        />
      </div>
    </div>
    <div class="flex justify-between px-2.5 pt-2.5">
      <span>Total</span>
      <strong>
        {{ displayedTeamValue }}
      </strong>
    </div>
    <slot name="footer" />
  </UCard>
  <DraftedPlayerEditDialog
    v-if="selectedDraftedPlayer"
    v-model:drafted-player="selectedDraftedPlayer"
    v-model:visible="showDialog"
    :editable="props.editable"
    :request-mode="props.transferRequestMode"
    :target-gameweek="props.targetGameweek"
    :active-gameweek="props.activeGameweek"
    :selection-disabled="props.transferSelectionDisabled"
    :team="props.draftedTeam"
    @request-transfer="handleTransferRequested"
  />
</template>
