<template>
  <Dialog v-model:visible="visible" header="" modal :dismissable-mask="true">
    <div class="grid grid-cols-1 gap-10 lg:min-w-[30rem] lg:grid-cols-3">
      <div class="lg:col-span-2" :class="{ 'lg:col-span-3': !props.editable }">
        <div class="mb-10">
          <h2 class="pb-2.5 text-lg font-black uppercase">Original Player</h2>
          <DraftedPlayer v-if="draftedPlayer" :drafted-player="draftedPlayer" />
        </div>
        <div v-if="draftedPlayer?.transfers.length" class="mb-5">
          <h2 class="mb-2.5 text-lg font-black uppercase">Transfers</h2>
          <div
            v-for="playerTransfer in draftedPlayer.transfers"
            :key="playerTransfer.drafted_transfer_id"
            class="mb-5 flex flex-col"
          >
            <h3 class="flex self-start text-sm font-bold uppercase">
              gameweek {{ playerTransfer.transfer_week }}
            </h3>
            <div class="flex items-center gap-2.5">
              <Icon
                class="h-6 w-6"
                name="material-symbols:subdirectory-arrow-right-rounded"
              />
              <DraftedPlayer :drafted-player="playerTransfer.player" />
              <Button
                v-if="props.editable"
                severity="danger"
                text
                rounded
                aria-label="Cancel"
                @click="
                  handleDeleteTransfer(playerTransfer.drafted_transfer_id)
                "
              >
                <Icon class="h-8 w-8" name="typcn:delete" />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="props.editable">
        <h2 class="mb-2.5 text-lg font-black uppercase">Submit new transfer</h2>
        <form class="flex flex-col items-start gap-5">
          <div class="flex w-full flex-col gap-2">
            <label for="new-transfer-id">Player</label>
            <Dropdown
              v-model="newTransferData.player"
              class="!w-full"
              filter
              :options="
                playerStore.players.filter(
                  (x) => x.position === draftedPlayer?.position
                )
              "
              option-label="web_name"
              placeholder="Select a Player"
            >
              <template #option="slotProps">
                <div class="align-items-center flex">
                  <div class="w-1/5">
                    {{ slotProps.option.player_id }}
                  </div>
                  <div class="w-4/5">
                    {{ slotProps.option.web_name }}
                  </div>
                </div>
              </template>
            </Dropdown>
          </div>
          <div class="flex w-full flex-col gap-2">
            <label for="new-transfer-week">Transfer Week</label>
            <InputNumber
              v-model="newTransferData.transferWeek"
              :min="0"
              :max="38"
              class="!w-full"
              show-buttons
            />
          </div>
          <div class="flex flex-col gap-2">
            <label for="new-transfer-expiry-date">Active expiry date</label>
            <Calendar
              v-model="newTransferData.activeExpiryDate"
              date-format="dd/mm/yy"
              show-icon
            />
          </div>
          <Button
            class="flex self-start"
            label="Submit"
            @click="addNewTransfer"
          />
        </form>
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast';
import { usePlayerStore } from '~/stores/players';
import { useDraftedTeamsStore } from '~/stores/draftedTeams';
import type { DraftedPlayer } from '~/types/DraftedPlayer';

interface TransferData {
  player: DraftedPlayer | null;
  activeExpiryDate: Date;
  transferWeek: number;
}

const toast = useToast();

const newTransferData: Ref<TransferData> = ref({
  player: null,
  activeExpiryDate: new Date(),
  transferWeek: 0
});

const visible = defineModel<boolean>('visible');
const draftedPlayer = defineModel<DraftedPlayer>('draftedPlayer');

const props = defineProps({
  editable: {
    type: Boolean,
    default: false
  }
});

const playerStore = usePlayerStore();
const draftedTeamsStore = useDraftedTeamsStore();

const addNewTransfer = async () => {
  try {
    if (!draftedPlayer.value || !newTransferData.value.player) {
      throw new Error('No player was found');
    }
    // Update the DB with the new transfer
    const newTransfer = await draftedTeamsStore.addNewTransfer([
      {
        drafted_player: draftedPlayer.value.drafted_player_id,
        active_transfer_expiry:
          newTransferData.value.activeExpiryDate.toDateString(),
        player_id: newTransferData.value.player.player_id,
        transfer_week: newTransferData.value.transferWeek
      }
    ]);

    // Build a new transfer obj using the new data returned
    // from DB and push it to the players transfer array
    draftedPlayer.value!.transfers.push({
      drafted_transfer_id: newTransfer[0].drafted_transfer_id,
      active_transfer_expiry: newTransferData.value.activeExpiryDate,
      transfer_week: newTransferData.value.transferWeek,
      player: newTransferData.value.player!
    });

    handleApiSuccess(`Transfer was successful`, toast);
  } catch (err: unknown) {
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
      (x) => x.drafted_transfer_id !== draftedTransferID
    );
    handleApiSuccess('Transfer was removed', toast);
  } catch (err) {
    handleApiError(err, toast);
  }
};
</script>
