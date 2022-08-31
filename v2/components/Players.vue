<template>
  <div>
    <PlayerModal></PlayerModal>
    <div
      v-for="(
        playerTypes, key, index
      ) in playerStore.getFilteredPlayersByPosition"
      :key="index"
    >
      <h2 class="uppercase mb-4 text-2xl px-4">
        {{ key }}
      </h2>
      <div
        v-if="playerTypes.length"
        class="flex justify-between mb-4 rounded-sm"
      >
        <div class="w-full border-r border-gray-100">
          <div class="grid grid-cols-2 gap-1">
            <div
              v-for="player in playerTypes"
              @click="toggleModal(true, player.id)"
              :key="player.id"
              class="relative bg-white flex flex-col items-center justify-around w-full text-sm border-b border-gray-100 cursor-pointer"
            >
              <div class="flex w-full items-center">
                <span class="w-1/12 p-2">{{ player.id }}</span>
                <span class="w-1/12 p-2">
                  <img
                    class="w-6 h-6 rounded-full shadow-md"
                    :src="player.image"
                    :alt="player.webName"
                    @error="loadPlayerFallbackImage"
                  />
                </span>
                <span class="w-2/12 p-2">{{ player.teamNameShort }}</span>
                <span class="w-5/12 p-2 text-center">{{ player.webName }}</span>
                <span class="w-2/12 p-2">{{ player.price }}</span>
                <span
                  v-if="player.unavailableForSeason"
                  class="flex items-center w-2/12 p-2 text-xs"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-red-500 rounded-full"
                  ></span>
                  Unavailable
                </span>
                <span
                  v-if="player.isUnavailable && !player.unavailableForSeason"
                  class="flex items-center w-2/12 p-2 text-xs"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-yellow-400 rounded-full"
                  ></span>
                  Unavailable
                </span>
                <span
                  v-else-if="!player.isUnavailable"
                  class="flex items-center w-2/12 p-2 text-xs"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-green-400 rounded-full"
                  ></span>
                  Available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePlayersStore } from '@/stores/players';
import { loadPlayerFallbackImage } from '@/composables/helpers';
import { usePlayerModal } from '~~/modules/players/modal';

const { toggleModal } = usePlayerModal();
const playerStore = usePlayersStore();
</script>
