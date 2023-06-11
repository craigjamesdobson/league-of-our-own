<script setup>
import { getImageUrl, loadPlayerFallbackImage } from '@/composables/helpers';
import { usePlayerModal } from '~/modules/players/modal';

const { selectedPlayer, toggleModal, modalVisible } = usePlayerModal();
</script>

<template lang="">
  <div>
    <div
      class="flex items-center justify-center modal"
      :class="{ '-active': modalVisible }"
      @click.self="toggleModal(false)"
    >
      <div
        v-if="selectedPlayer"
        class="px-4 modal__content"
      >
        <div class="absolute top-0 right-0 p-12 opacity-75 cursor-pointer">
          <Icon
            name="system-uicons:cross-circle"
            class="w-12 h-12 text-white"
            @click="toggleModal(false)"
          />
        </div>
        <div
          class="modal__inner"
          :class="{
            'border-4 border-yellow-300':
              !selectedPlayer.unavailableForSeason
              && selectedPlayer.isUnavailable,
            'border-4 border-red-500': selectedPlayer.unavailableForSeason,
          }"
        >
          <img
            class="modal__badge"
            :src="getImageUrl(selectedPlayer.teamNameShort?.toLowerCase())"
          >
          <div class="flex flex-row justify-between gap-4 items-top">
            <div class="w-24">
              <img
                class="rounded-full"
                :src="selectedPlayer.imageLarge"
                :alt="selectedPlayer.name"
                @error="loadPlayerFallbackImage"
              >
            </div>
            <h4
              class="flex flex-col items-end text-4xl leading-none text-right uppercase"
            >
              <span class="mb-2 text-base">
                {{ selectedPlayer.firstName }}
              </span>
              {{ selectedPlayer.secondName }}
            </h4>
          </div>
          <div class="mt-6 rounded-lg inner">
            <div class="flex flex-col items-start justify-between gap-4 xl:items-end xl:flex-row">
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
                        !selectedPlayer.unavailableForSeason
                        && selectedPlayer.isUnavailable,
                      'bg-red-500': selectedPlayer.unavailableForSeason,
                    }"
                  />
                </span>
                <p class="text-sm">
                  {{ selectedPlayer.news }}
                </p>
              </div>
              <div class="flex flex-col items-end w-full text-sm xl:w-1/4 xl:ml-auto">
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
                      {{ selectedPlayer.goalsScored }}
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
                      selectedPlayer.position === 1
                        || selectedPlayer.position === 2
                    "
                    class="flex justify-between w-full"
                  >
                    <span class="w-3/4 py-1 border-b border-r border-gray-100">
                      Clean Sheets:
                    </span>
                    <strong
                      class="w-1/4 py-1 text-center border-b border-gray-100"
                    >
                      {{ selectedPlayer.cleanSheets }}
                    </strong>
                  </li>
                  <li class="flex justify-between w-full">
                    <span class="w-3/4 py-1 border-b border-r border-gray-100">
                      Red Cards:
                    </span>
                    <strong
                      class="w-1/4 py-1 text-center border-b border-gray-100"
                    >
                      {{ selectedPlayer.redCards }}
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/components/modal";
</style>