<script setup lang="ts">
import type { DraftedPlayer, DraftedTransfer } from '~/types/DraftedPlayer';

const visible = defineModel<boolean>('visible');
const draftedPlayer = defineModel<DraftedPlayer>('draftedPlayer');

const activeTransferPlayer = ref();

const changeActivePlayer = (
  playerTransfer: DraftedPlayer | DraftedTransfer
) => {
  playerTransfer.selected = true;
};
</script>

<template>
  <Dialog v-model:visible="visible" header="" modal :dismissable-mask="true">
    <div class="grid grid-cols-1 gap-10 lg:min-w-[30rem] lg:grid-cols-3">
      <div class="lg:col-span-3">
        <div class="mb-10">
          <h2 class="pb-2.5 text-lg font-black uppercase">Original Player</h2>
          <div class="flex items-center">
            <RadioButton
              v-model="activeTransferPlayer"
              :input-id="draftedPlayer!.drafted_player_id.toString()"
              name="dynamic"
              :value="draftedPlayer"
              @change="changeActivePlayer(draftedPlayer!)"
            />
            <label
              :for="draftedPlayer!.drafted_player_id.toString()"
              class="ml-2 w-full"
            >
              <DraftedPlayerWithPoints :drafted-player="draftedPlayer" />
            </label>
          </div>
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
              <div class="flex w-full items-center">
                <RadioButton
                  v-model="activeTransferPlayer"
                  :input-id="playerTransfer.drafted_transfer_id.toString()"
                  name="dynamic"
                  :value="playerTransfer"
                  @change="changeActivePlayer(playerTransfer)"
                />
                <label
                  :for="playerTransfer!.drafted_transfer_id.toString()"
                  class="ml-2 w-full"
                >
                  <DraftedPlayerWithPoints :drafted-player="playerTransfer" />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Message class="!mt-0" :closable="false" severity="warn"
      >Changing the selected player will override the points
      calculation</Message
    >
  </Dialog>
</template>
