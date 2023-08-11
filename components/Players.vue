<script setup>
import { usePlayerModal } from '@/logic/players/modal';
import { usePlayersStore } from '@/stores/players';
import { loadPlayerFallbackImage } from '@/composables/helpers';

const { toggleModal } = usePlayerModal();
const playerStore = usePlayersStore();
</script>

<template>
  <div v-if="!playerStore.isLoaded">
    <h1 class="main-heading">Loading...</h1>
    <div class="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div v-for="i in 50" :key="i" class="flex flex-row gap-5 mb-2">
        <SkeletonLoader class="w-1/12 h-5" />
        <SkeletonLoader type="circle" class="w-5 h-5" />
        <SkeletonLoader class="w-2/12 h-5" />
        <SkeletonLoader class="w-5/12 h-5" />
        <SkeletonLoader class="w-2/12 h-5" />
      </div>
    </div>
  </div>
  <div v-else>
    <PlayerModal />
    <div
      v-for="(
        playerTypes, key, index
      ) in playerStore.getFilteredPlayersByPosition"
      :key="index"
    >
      <h1 class="main-heading">
        {{ key }}
      </h1>
      <div
        v-if="playerTypes.length"
        class="flex justify-between mb-4 rounded-sm"
      >
        <div class="w-full border-r border-gray-100">
          <div class="grid grid-cols-1 gap-1 md:grid-cols-2">
            <div
              v-for="player in playerTypes"
              :key="player.id"
              class="relative flex flex-col items-center justify-around w-full text-sm bg-white border-b border-gray-100 cursor-pointer"
              @click="toggleModal(true, player.id)"
            >
              <div class="flex items-center w-full">
                <span class="w-1/12 p-2">{{ player.id }}</span>
                <span class="w-2/12 p-2">
                  <img
                    class="w-6 h-6 rounded-full shadow-md"
                    :src="player.image"
                    :alt="player.webName"
                    @error="loadPlayerFallbackImage"
                  />
                </span>
                <span class="w-1/12 p-2">{{ player.teamNameShort }}</span>
                <span class="w-5/12 p-2 text-center">{{ player.webName }}</span>
                <span class="w-1/12 p-2 text-center">{{ player.price }}</span>
                <span
                  v-if="player.unavailableForSeason"
                  class="flex items-center justify-end w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-red-500 rounded-full"
                  />
                </span>
                <span
                  v-if="player.isUnavailable && !player.unavailableForSeason"
                  class="flex items-center justify-end w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-yellow-400 rounded-full"
                  />
                </span>
                <span
                  v-else-if="!player.isUnavailable"
                  class="flex items-center justify-end w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-green-400 rounded-full"
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
