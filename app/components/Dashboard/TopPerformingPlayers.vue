<script setup lang="ts">
import WeeklySummaryCard from '@/components/Dashboard/WeeklySummaryCard.vue';
import { PlayerPosition } from '@/types/PlayerPosition';
import { loadPlayerFallbackImage } from '@/utils/images';
import { getPositionInfo } from '@/utils/playerPosition';
import type { TopPositionPlayers } from '@/types/Dashboard';

const props = defineProps({
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

// Transform position data into a clean, flat structure for the template
const positionsData = computed(() => {
  return [1, 2, 3, 4].map((positionKey) => {
    const positionData = props.topPositionPlayers[positionKey];
    const players = positionData?.players ?? [];
    const firstPlayer = players[0];
    const hasPlayers = players.length > 0 && !!firstPlayer;

    return {
      positionKey,
      hasPlayers,
      isSinglePlayer: players.length === 1,
      players,
      // Only include firstPlayer if hasPlayers is true, ensuring type safety
      firstPlayer: hasPlayers ? firstPlayer : undefined,
      points: positionData?.points ?? 0,
    };
  });
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
          class="flex flex-col justify-between items-center p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg shadow-sm gap-4 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700"
        >
          <!-- Profile/Name/Points grouped together -->
          <div class="flex-shrink-0 text-center">
            <!-- Player Image -->
            <div class="mb-3">
              <USkeleton class="mx-auto h-16 w-16 rounded-full border-2 border-slate-300 shadow-md" />
            </div>
            <!-- Player Names -->
            <div class="space-y-1 mb-2">
              <USkeleton class="h-5 w-20" />
            </div>
            <!-- Points -->
            <USkeleton class="h-3.5 w-12" />
          </div>

          <!-- Flexible space -->
          <div class="flex-1" />

          <!-- Position Title with icon -->
          <div class="flex-shrink-0 flex flex-col items-center gap-2">
            <USkeleton class="h-6 w-6 rounded-full" />
            <USkeleton class="h-3.5 w-16" />
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
          v-for="position in positionsData"
          :key="position.positionKey"
          class="flex flex-col justify-between items-center p-5 bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200 rounded-lg shadow-sm gap-4 dark:from-slate-800 dark:to-slate-900 dark:border-slate-700"
        >
          <template v-if="position.hasPlayers">
            <!-- Always at top: Profile/Name/Points grouped together -->
            <div class="flex-shrink-0 text-center">
              <!-- Image/Icon -->
              <div class="mb-3">
                <!-- Single player - show image -->
                <template v-if="position.isSinglePlayer">
                  <img
                    v-if="position.firstPlayer?.image"
                    class="h-16 w-16 rounded-full border-2 border-slate-300 shadow-md mx-auto dark:border-slate-600"
                    :src="position.firstPlayer?.image"
                    :alt="position.firstPlayer?.web_name"
                    @error="loadPlayerFallbackImage"
                  >
                  <UAvatar
                    v-else
                    :text="position.firstPlayer?.web_name?.charAt(0) || '?'"
                    size="3xl"
                    class="bg-slate-100 text-slate-700 border-2 border-slate-300 mx-auto dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
                  />
                </template>
                <!-- Multiple players - show group icon -->
                <template v-else>
                  <div class="h-16 w-16 rounded-full border-2 border-slate-300 shadow-md mx-auto flex items-center justify-center bg-slate-100 dark:bg-slate-800 dark:border-slate-600">
                    <Icon
                      name="carbon:user-multiple"
                      size="32"
                      class="text-slate-700 dark:text-slate-200"
                    />
                  </div>
                </template>
              </div>

              <!-- Player Names and Points -->
              <div>
                <div class="space-y-1 mb-2">
                  <div
                    v-for="(player, index) in position.players.slice(0, 3)"
                    :key="index"
                    class="text-slate-800 font-bold dark:text-slate-100"
                    :class="position.players.length > 1 ? 'text-sm' : 'text-lg'"
                  >
                    {{ player.web_name }}
                  </div>
                  <div
                    v-if="position.players.length > 3"
                    class="text-xs text-slate-600 font-medium dark:text-slate-400"
                  >
                    +{{ position.players.length - 3 }} more
                  </div>
                </div>
                <div class="text-sm text-slate-600 font-medium dark:text-slate-300">
                  {{ position.points }} pts
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <!-- No player data available -->
            <div class="flex-shrink-0 text-center">
              <div class="mb-3">
                <div class="h-16 w-16 rounded-full border-2 border-slate-300 shadow-md mx-auto flex items-center justify-center bg-slate-100 dark:bg-slate-800 dark:border-slate-600">
                  <Icon
                    :name="getPositionInfo(position.positionKey).icon"
                    size="32"
                    class="text-slate-700 dark:text-slate-200"
                  />
                </div>
              </div>
              <div>
                <div class="text-lg font-bold text-slate-700 mb-1 dark:text-slate-200">
                  N/A
                </div>
                <div class="text-sm text-slate-600 font-medium dark:text-slate-300">
                  0 pts
                </div>
              </div>
            </div>
          </template>

          <!-- Flexible space -->
          <div class="flex-1" />

          <!-- Always at bottom: Title with icon -->
          <div class="flex-shrink-0 flex flex-col items-center gap-2">
            <Icon
              :name="getPositionInfo(position.positionKey).icon"
              size="24"
              class="text-slate-600 dark:text-slate-300"
            />
            <div class="text-sm text-slate-600 uppercase font-bold tracking-wider text-center dark:text-slate-300">
              {{ getPositionInfo(position.positionKey).label }}
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
        class="mx-auto text-slate-400 mb-2 dark:text-slate-500"
      />
      <p class="text-slate-500 mb-2 dark:text-slate-400">
        Top performing players will appear here
      </p>
      <UBadge
        color="neutral"
        variant="soft"
        label="Awaiting player data..."
      />
    </div>
  </WeeklySummaryCard>
</template>
