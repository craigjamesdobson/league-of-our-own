<script setup lang="ts">
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';
import { PlayerPosition } from '@/types/PlayerPosition';
import { loadPlayerFallbackImage } from '@/utils/images';
import { getPositionInfo } from '@/utils/playerPosition';
import type { TopPositionPlayers } from '@/types/Dashboard';

defineProps({
  topPositionPlayers: {
    type: Object as PropType<{ [key: number]: TopPositionPlayers | null }>,
    default: () => ({
      [PlayerPosition.GOALKEEPER]: null,
      [PlayerPosition.DEFENDER]: null,
      [PlayerPosition.MIDFIELDER]: null,
      [PlayerPosition.FORWARD]: null,
    }),
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <WeeklySummaryCard
    :is-loading="isLoading"
  >
    <template #skeleton>
      <!-- Top Performing Players Skeleton - matches 4-column grid with player images/avatars -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
        <div
          v-for="n in 4"
          :key="n"
          class="flex flex-col justify-between items-center p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg shadow-sm gap-4"
        >
          <!-- Profile/Name/Points grouped together -->
          <div class="flex-shrink-0 text-center">
            <!-- Player Image -->
            <div class="mb-3">
              <Skeleton
                shape="circle"
                size="4rem"
                class="border-2 border-slate-300 shadow-md mx-auto"
              />
            </div>
            <!-- Player Names -->
            <div class="space-y-1 mb-2">
              <Skeleton
                width="5rem"
                height="1.125rem"
              />
            </div>
            <!-- Points -->
            <Skeleton
              width="3rem"
              height="0.875rem"
            />
          </div>

          <!-- Flexible space -->
          <div class="flex-1" />

          <!-- Position Title with icon -->
          <div class="flex-shrink-0 flex flex-col items-center gap-2">
            <Skeleton
              shape="circle"
              size="1.5rem"
            />
            <Skeleton
              width="4rem"
              height="0.875rem"
            />
          </div>
        </div>
      </div>
    </template>
    <div
      v-if="Object.values(topPositionPlayers).some(players => players?.players && players.players.length > 0)"
      class="h-full"
    >
      <!-- Top Position Players Row -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Position Cards -->
        <div
          v-for="positionKey in [1, 2, 3, 4]"
          :key="positionKey"
          class="flex flex-col justify-between items-center p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg shadow-sm gap-4"
        >
          <!-- Always at top: Profile/Name/Points grouped together -->
          <div class="flex-shrink-0 text-center">
            <!-- Image/Icon -->
            <div class="mb-3">
              <div
                v-if="topPositionPlayers[positionKey]?.players && topPositionPlayers[positionKey].players.length > 0"
              >
                <!-- Single player - show image -->
                <div v-if="topPositionPlayers[positionKey].players.length === 1">
                  <img
                    v-if="topPositionPlayers[positionKey].players[0].image"
                    class="h-16 w-16 rounded-full border-2 border-slate-300 shadow-md mx-auto"
                    :src="topPositionPlayers[positionKey].players[0].image"
                    :alt="topPositionPlayers[positionKey].players[0].web_name"
                    @error="loadPlayerFallbackImage"
                  >
                  <Avatar
                    v-else
                    :label="topPositionPlayers[positionKey].players[0].web_name.charAt(0)"
                    shape="circle"
                    size="xlarge"
                    class="bg-slate-100 text-slate-700 border-2 border-slate-300 mx-auto"
                  />
                </div>
                <!-- Multiple players - show group icon -->
                <div v-else>
                  <div class="h-16 w-16 rounded-full border-2 border-slate-300 shadow-md mx-auto flex items-center justify-center bg-slate-100">
                    <Icon
                      name="carbon:user-multiple"
                      size="32"
                      class="text-slate-700"
                    />
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="h-16 w-16 rounded-full border-2 border-slate-300 shadow-md mx-auto flex items-center justify-center bg-slate-100">
                  <Icon
                    :name="getPositionInfo(positionKey).icon"
                    size="32"
                    class="text-slate-700"
                  />
                </div>
              </div>
            </div>

            <!-- Player Names and Points -->
            <div>
              <div
                v-if="topPositionPlayers[positionKey]?.players && topPositionPlayers[positionKey].players.length > 0"
              >
                <div class="space-y-1 mb-2">
                  <div
                    v-for="(player, index) in topPositionPlayers[positionKey].players.slice(0, 3)"
                    :key="index"
                    class="text-slate-800 font-bold"
                    :class="topPositionPlayers[positionKey].players.length > 1 ? 'text-sm' : 'text-lg'"
                  >
                    {{ player.web_name }}
                  </div>
                  <div
                    v-if="topPositionPlayers[positionKey].players.length > 3"
                    class="text-xs text-slate-600 font-medium"
                  >
                    +{{ topPositionPlayers[positionKey].players.length - 3 }} more
                  </div>
                </div>
                <div class="text-sm text-slate-600 font-medium">
                  {{ topPositionPlayers[positionKey].points }} pts
                </div>
              </div>
              <div v-else>
                <div class="text-lg font-bold text-slate-700 mb-1">
                  N/A
                </div>
                <div class="text-sm text-slate-600 font-medium">
                  0 pts
                </div>
              </div>
            </div>
          </div>

          <!-- Flexible space -->
          <div class="flex-1" />

          <!-- Always at bottom: Title with icon -->
          <div class="flex-shrink-0 flex flex-col items-center gap-2">
            <Icon
              :name="getPositionInfo(positionKey).icon"
              size="24"
              class="text-slate-600"
            />
            <div class="text-sm text-slate-600 uppercase font-bold tracking-wider text-center">
              {{ getPositionInfo(positionKey).label }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else
      class="text-center py-8"
    >
      <Icon
        name="carbon:trophy"
        size="48"
        class="mx-auto text-slate-400 mb-2"
      />
      <p class="text-slate-500 mb-2">
        Top performing players will appear here
      </p>
      <Tag
        severity="secondary"
        value="Awaiting player data..."
      />
    </div>
  </WeeklySummaryCard>
</template>
