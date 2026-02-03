<script setup lang="ts">
import type { PlayerSeasonStats } from '~/types/Player';
import { loadPlayerFallbackImage, getImageUrl } from '~/utils/images';

const router = useRouter();

const { selectedPlayer } = defineProps<{
  selectedPlayer: PlayerSeasonStats | null;
}>();

const getNewsSeverity = (player: PlayerSeasonStats) => {
  if (player.unavailable_for_season) {
    return 'error';
  }

  if (player.is_unavailable) {
    return 'warn';
  }

  return 'info';
};

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
      class="m-5 rounded-lg relative overflow-hidden w-[92%] lg:w-3/5 2xl:w-2/5 bg-white"
      pt:header:class="!justify-end"
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
          <div class="inner mt-6 rounded-lg w-full md:w-3/4 xl:w-3/5 ml-auto relative z-10">
            <div class="flex flex-col items-start gap-4">
              <div class="flex w-full flex-col items-start text-sm">
                <h4
                  class="mb-2 flex w-full justify-start border-b border-black pb-1 uppercase"
                >
                  Statistics
                </h4>
                <div class="grid w-full grid-cols-2 gap-2 text-xs">
                  <div class="flex flex-col rounded-md border border-surface-200 bg-surface-50 px-3 py-2">
                    <span class="text-[11px] uppercase text-surface-500">Points</span>
                    <strong class="text-lg">
                      {{ selectedPlayer.season_points }}
                    </strong>
                  </div>
                  <div class="flex flex-col rounded-md border border-surface-200 bg-surface-50 px-3 py-2">
                    <span class="text-[11px] uppercase text-surface-500">Goals</span>
                    <strong class="text-lg">
                      {{ selectedPlayer.season_goals }}
                    </strong>
                  </div>
                  <div class="flex flex-col rounded-md border border-surface-200 bg-surface-50 px-3 py-2">
                    <span class="text-[11px] uppercase text-surface-500">Assists</span>
                    <strong class="text-lg">
                      {{ selectedPlayer.season_assists }}
                    </strong>
                  </div>
                  <div
                    v-if="
                      selectedPlayer.position === 1
                        || selectedPlayer.position === 2
                    "
                    class="flex flex-col rounded-md border border-surface-200 bg-surface-50 px-3 py-2"
                  >
                    <span class="text-[11px] uppercase text-surface-500">Clean Sheets</span>
                    <strong class="text-lg">
                      {{ selectedPlayer.season_clean_sheets }}
                    </strong>
                  </div>
                  <div class="flex flex-col rounded-md border border-surface-200 bg-surface-50 px-3 py-2">
                    <span class="text-[11px] uppercase text-surface-500">Minutes</span>
                    <strong class="text-lg">
                      {{ selectedPlayer.minutes }}
                    </strong>
                  </div>
                  <div class="flex flex-col rounded-md border border-surface-200 bg-surface-50 px-3 py-2">
                    <span class="text-[11px] uppercase text-surface-500">Red Cards</span>
                    <strong class="text-lg">
                      {{ selectedPlayer.season_red_cards }}
                    </strong>
                  </div>
                </div>
              </div>
              <Message
                v-if="selectedPlayer.news"
                class="w-full"
                size="small"
                :severity="getNewsSeverity(selectedPlayer)"
              >
                <template #icon>
                  <Icon
                    name="mdi:alert-circle-outline"
                    class="flex-shrink-0"
                    size="18"
                  />
                </template>
                {{ selectedPlayer.news }}
              </Message>
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
