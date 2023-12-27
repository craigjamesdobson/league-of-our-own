<script setup>
import { getImageUrl, loadPlayerFallbackImage } from '@/composables/helpers';
import { usePlayerModal } from '@/logic/players/modal';

const { selectedPlayer, modalVisible } = usePlayerModal();
</script>

<template lang="">
  <div>
    <Dialog
      v-model:visible="modalVisible"
      :pt="{
        root: {
          class: [
            'rounded-lg relative overflow-hidden w-1/3',
            {
              'border-4 border-yellow-300':
                !selectedPlayer.unavailable_for_season &&
                selectedPlayer.is_unavailable,
              'border-4 border-red-500': selectedPlayer.unavailable_for_season,
            },
          ],
        },
        header: {
          class: 'flex justify-end rounded-t-none bg-white p-5',
        },
      }"
      modal
      :dismissable-mask="true"
    >
      <div v-if="selectedPlayer" class="px-4">
        <div class="">
          <img
            class="modal__badge z-100"
            :src="getImageUrl(selectedPlayer.team_short_name?.toLowerCase())"
          />
          <div class="flex flex-row justify-between gap-4 items-top">
            <div class="w-24">
              <img
                class="rounded-full"
                :src="selectedPlayer.image_large"
                :alt="selectedPlayer.name"
                @error="loadPlayerFallbackImage"
              />
            </div>
            <h4
              class="flex flex-col items-end text-2xl leading-none text-right uppercase md:text-4xl"
            >
              <span class="mb-2 text-base">
                {{ selectedPlayer.first_name }}
              </span>
              {{ selectedPlayer.second_name }}
            </h4>
          </div>
          <div class="mt-6 rounded-lg inner">
            <div
              class="flex flex-col items-start justify-between gap-4 xl:items-end xl:flex-row"
            >
              <div
                v-if="selectedPlayer.news"
                class="flex items-center flex-grow w-3/4 mr-4"
              >
                <span class="flex items-center justify-center w-5 h-5 mr-2">
                  <Icon
                    name="mdi:alert-circle-outline"
                    class="text-white bg-green-500 rounded-full"
                    :class="{
                      'bg-yellow-500':
                        !selectedPlayer.unavailable_for_season &&
                        selectedPlayer.is_unavailable,
                      'bg-red-500': selectedPlayer.unavailable_for_season,
                    }"
                  />
                </span>
                <p class="text-sm">
                  {{ selectedPlayer.news }}
                </p>
              </div>
              <div
                class="flex flex-col items-end w-full text-sm xl:w-1/4 xl:ml-auto"
              >
                <h4
                  class="flex justify-end w-full pb-1 mb-1 uppercase border-b border-black"
                >
                  Statistics
                </h4>
                <ul class="flex flex-col w-full text-xs">
                  <li class="flex justify-between w-full">
                    <span class="w-3/4 py-1 border-b border-r border-gray-100">
                      Goals:
                    </span>
                    <strong
                      class="w-1/4 py-1 text-center border-b border-gray-100"
                    >
                      {{ selectedPlayer.goals_scored }}
                    </strong>
                  </li>
                  <li class="flex justify-between w-full">
                    <span class="w-3/4 py-1 border-b border-r border-gray-100">
                      Assists:
                    </span>
                    <strong
                      class="w-1/4 py-1 text-center border-b border-gray-100"
                    >
                      {{ selectedPlayer.assists }}
                    </strong>
                  </li>
                  <li
                    v-if="
                      selectedPlayer.position === 1 ||
                      selectedPlayer.position === 2
                    "
                    class="flex justify-between w-full"
                  >
                    <span class="w-3/4 py-1 border-b border-r border-gray-100">
                      Clean Sheets:
                    </span>
                    <strong
                      class="w-1/4 py-1 text-center border-b border-gray-100"
                    >
                      {{ selectedPlayer.clean_sheets }}
                    </strong>
                  </li>
                  <li class="flex justify-between w-full">
                    <span class="w-3/4 py-1 border-b border-r border-gray-100">
                      Red Cards:
                    </span>
                    <strong
                      class="w-1/4 py-1 text-center border-b border-gray-100"
                    >
                      {{ selectedPlayer.red_cards }}
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/components/modal';
</style>
