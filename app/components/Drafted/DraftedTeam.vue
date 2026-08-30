<script setup lang="ts">
import DraftedPlayer from './DraftedPlayer.vue';
import TeamAdminMetadataPopover from '~/components/Drafted/TeamAdminMetadataPopover.vue';
import type { DraftedTeamWithPlayers, TeamAdminMetadata } from '~/types/DraftedTeam';

const props = defineProps({
  draftedTeam: {
    type: Object as PropType<DraftedTeamWithPlayers>,
    default: null,
  },
  editable: {
    type: Boolean,
    default: false,
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
}>();

const cardRootClass = computed(() => props.isYourTeam
  ? 'border border-amber-400/60 bg-white shadow-sm ring-1 ring-amber-400/10 dark:border-amber-400/55 dark:bg-slate-900 dark:ring-amber-400/10'
  : 'border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:shadow-none');

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
</script>

<template>
  <UCard
    v-if="props.draftedTeam"
    class="text-slate-900 dark:text-slate-100"
    :ui="{
      root: cardRootClass,
      body: 'p-5 sm:p-5',
    }"
  >
    <div
      class="mb-2 flex items-center justify-between border-b border-slate-800 p-2 pt-0 dark:border-slate-700"
      :class="{
        'bg-red-200 dark:bg-red-950/70': props.draftedTeam?.is_invalid_team,
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
              class="flex size-7 shrink-0 items-center justify-center rounded-full text-amber-500 transition-colors hover:text-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:text-amber-300 dark:hover:text-amber-200"
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
              class="flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-transparent transition-colors hover:border-amber-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 dark:border-slate-600 dark:hover:border-amber-400"
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
        'bg-yellow-200 hover:bg-yellow-300 dark:bg-yellow-950/70 dark:hover:bg-yellow-900/80':
          !!player.transfers.length
          && isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
        'bg-green-200 transition-all hover:bg-green-300 dark:bg-green-950/70 dark:hover:bg-green-900/80':
          !!player.transfers.length
          && !isActiveTransfer(player.transfers.at(-1)!.active_transfer_expiry),
      }"
    >
      <div class="flex w-full items-center border-b border-slate-100 dark:border-slate-800">
        <DraftedPlayer
          v-if="!player.transfers.length"
          :drafted-player="player"
        />
        <DraftedTransfer
          v-else-if="player.transfers.at(-1) !== null"
          :drafted-player="player"
          class="w-full cursor-pointer"
          @click="handleEditPlayer(player.data.player_id!)"
        />
        <UButton
          v-if="props.editable"
          icon="tabler:switch-3"
          color="primary"
          variant="subtle"
          size="xs"
          square
          aria-label="Edit Player"
          title="Edit Player"
          class="mr-2"
          @click="handleEditPlayer(player.data.player_id!)"
        />
      </div>
    </div>
    <div class="flex justify-between px-2.5 pt-2.5">
      <span>Total</span>
      <strong>
        {{ props.draftedTeam?.total_team_value }}
      </strong>
    </div>
  </UCard>
  <DraftedPlayerEditDialog
    v-if="selectedDraftedPlayer"
    v-model:drafted-player="selectedDraftedPlayer"
    v-model:visible="showDialog"
    :editable="props.editable"
    :team="props.draftedTeam"
  />
</template>
