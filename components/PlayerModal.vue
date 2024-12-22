<script setup lang="ts">
import type { Player } from '~/types/Player';

const router = useRouter();

const { selectedPlayer } = defineProps<{
  selectedPlayer: Player | null;
}>();

const clearPlayerQueryParam = () => {
  router.push({
    path: 'players',
  });
};

const modelValue = defineModel<boolean>();
</script>

<template>
  <div>
    <Dialog
      v-if="selectedPlayer"
      v-model:visible="modelValue"
      class="m-5 rounded-lg relative overflow-hidden w-[90%] lg:w-1/2 2xl:w-1/3 bg-white"
      pt:header="!justify-end"
      :pt="{
        root: selectedPlayer.unavailable_for_season
          ? '!border-2 !border-red-500'
          : selectedPlayer.is_unavailable
            ? '!border-2 !border-yellow-300'
            : 'default-class',
      }"
      modal
      :dismissable-mask="true"
      @hide="clearPlayerQueryParam"
    >
      <div
        v-if="selectedPlayer"
        class="px-4"
      >
        <div class="">
          <img
            class="modal__badge"
            :src="getImageUrl(selectedPlayer.team_short_name?.toLowerCase())"
          >
          <div class="items-top flex flex-row justify-between gap-4">
            <div class="z-10 w-24">
              <img
                class="rounded-full"
                :src="selectedPlayer.image_large"
                :alt="selectedPlayer.web_name"
                @error="loadPlayerFallbackImage"
              >
            </div>
            <h4
              class="flex flex-col items-end text-right text-2xl uppercase leading-none md:text-4xl"
            >
              <span class="mb-2 text-base">
                {{ selectedPlayer.first_name }}
              </span>
              {{ selectedPlayer.second_name }}
            </h4>
          </div>
          <div class="inner mt-6 rounded-lg">
            <div
              class="flex flex-col items-start justify-between gap-4 xl:flex-row xl:items-end"
            >
              <div
                v-if="selectedPlayer.news"
                class="mr-4 flex w-3/4 flex-grow items-center"
              >
                <span class="mr-2 flex h-5 w-5 items-center justify-center">
                  <Icon
                    name="mdi:alert-circle-outline"
                    class="rounded-full bg-green-500 text-white"
                    :class="{
                      'bg-yellow-500':
                        !selectedPlayer.unavailable_for_season
                        && selectedPlayer.is_unavailable,
                      'bg-red-500': selectedPlayer.unavailable_for_season,
                    }"
                  />
                </span>
                <p class="text-sm">
                  {{ selectedPlayer.news }}
                </p>
              </div>
              <div
                class="flex w-full flex-col items-end text-sm xl:ml-auto xl:w-1/4"
              >
                <h4
                  class="mb-1 flex w-full justify-end border-b border-black pb-1 uppercase"
                >
                  Statistics
                </h4>
                <ul class="flex w-full flex-col text-xs">
                  <li class="flex w-full justify-between">
                    <span class="w-3/4 border-b border-r border-gray-100 py-1">
                      Goals:
                    </span>
                    <strong
                      class="w-1/4 border-b border-gray-100 py-1 text-center"
                    >
                      {{ selectedPlayer.goals_scored }}
                    </strong>
                  </li>
                  <li class="flex w-full justify-between">
                    <span class="w-3/4 border-b border-r border-gray-100 py-1">
                      Assists:
                    </span>
                    <strong
                      class="w-1/4 border-b border-gray-100 py-1 text-center"
                    >
                      {{ selectedPlayer.assists }}
                    </strong>
                  </li>
                  <li
                    v-if="
                      selectedPlayer.position === 1
                        || selectedPlayer.position === 2
                    "
                    class="flex w-full justify-between"
                  >
                    <span class="w-3/4 border-b border-r border-gray-100 py-1">
                      Clean Sheets:
                    </span>
                    <strong
                      class="w-1/4 border-b border-gray-100 py-1 text-center"
                    >
                      {{ selectedPlayer.clean_sheets }}
                    </strong>
                  </li>
                  <li class="flex w-full justify-between">
                    <span class="w-3/4 border-b border-r border-gray-100 py-1">
                      Red Cards:
                    </span>
                    <strong
                      class="w-1/4 border-b border-gray-100 py-1 text-center"
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

<style scoped>
@import '@/assets/styles/modal';
</style>
