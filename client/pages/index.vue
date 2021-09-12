<template>
  <div class="flex mx-10 my-2">
    <div class="grid w-full grid-cols-2 gap-5">
      <div class="grid w-full grid-cols-2 gap-1">
        <div class="p-4 bg-white rounded-sm">
          <div
            class="flex items-center justify-between pb-2 mb-4 border-b border-gray-800 "
          >
            <h4 class="text-lg font-bold uppercase">Sharp shooters</h4>
            <svg-icon class="w-5 h-5" name="icon-goal" />
          </div>
          <playerLoadingSkeleton
            v-if="isLoading"
            column-width="w-full"
            :rows="5"
          ></playerLoadingSkeleton>
          <div
            v-else
            class="grid justify-between grid-cols-4 text-xs font-bold uppercase border-b  border-offWhite"
          >
            <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
            <span class="p-1 text-center">Goals</span>
          </div>
          <div
            v-for="player in topGoalScorers"
            :key="player.id"
            @click="navigateToPlayerModal(player.id)"
            class="grid justify-between grid-cols-4 border-b cursor-pointer  player-stats-chart border-offWhite last:border-b-0 hover:bg-gray-100 animate"
          >
            <span
              class="flex justify-between col-span-3 p-1 border-r  border-offWhite"
            >
              {{ player.name }}
              <img
                class="w-6 h-6 mr-2 rounded-full shadow-md"
                :src="player.image"
                :alt="player.name"
                @error="loadFallbackImage"
              />
            </span>
            <span class="p-1 text-center">
              {{ player.totalGoals }}
            </span>
          </div>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <div
            class="flex items-center justify-between pb-2 mb-4 border-b border-gray-800 "
          >
            <h4 class="text-lg font-bold uppercase">Player makers</h4>
            <svg-icon class="w-5 h-5" name="icon-assist" />
          </div>
          <playerLoadingSkeleton
            v-if="isLoading"
            column-width="w-full"
            :rows="5"
          ></playerLoadingSkeleton>
          <div
            v-else
            class="grid justify-between grid-cols-4 text-xs font-bold uppercase border-b  border-offWhite"
          >
            <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
            <span class="p-1 text-center">Assists</span>
          </div>
          <div
            v-for="player in topAssists"
            @click="navigateToPlayerModal(player.id)"
            :key="player.id"
            class="grid justify-between grid-cols-4 border-b cursor-pointer  player-stats-chart border-offWhite last:border-b-0 hover:bg-gray-100 animate"
          >
            <span
              class="flex justify-between col-span-3 p-1 border-r  border-offWhite"
            >
              {{ player.name }}
              <img
                class="w-6 h-6 mr-2 rounded-full shadow-md"
                :src="player.image"
                :alt="player.name"
                @error="loadFallbackImage"
              />
            </span>
            <span class="p-1 text-center">
              {{ player.totalAssists }}
            </span>
          </div>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <div
            class="flex items-center justify-between pb-2 mb-4 border-b border-gray-800 "
          >
            <h4 class="text-lg font-bold uppercase">Hot heads</h4>
            <svg-icon class="w-5 h-5" name="icon-sent-off" />
          </div>
          <playerLoadingSkeleton
            v-if="isLoading"
            column-width="w-full"
            :rows="5"
          ></playerLoadingSkeleton>
          <div
            v-else
            class="grid justify-between grid-cols-4 text-xs font-bold uppercase border-b  border-offWhite"
          >
            <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
            <span class="p-1 text-center whitespace-nowrap">Red cards</span>
          </div>
          <div
            v-for="player in topRedCards"
            @click="navigateToPlayerModal(player.id)"
            :key="player.id"
            class="grid justify-between grid-cols-4 border-b cursor-pointer  player-stats-chart border-offWhite last:border-b-0 hover:bg-gray-100 animate"
          >
            <span
              class="flex justify-between col-span-3 p-1 border-r  border-offWhite"
            >
              {{ player.name }}
              <img
                class="w-6 h-6 mr-2 rounded-full shadow-md"
                :src="player.image"
                :alt="player.name"
                @error="loadFallbackImage"
              />
            </span>
            <span class="p-1 text-center">
              {{ player.totalRedCards }}
            </span>
          </div>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <div
            class="flex items-center justify-between pb-2 mb-4 border-b border-gray-800 "
          >
            <h4 class="text-lg font-bold uppercase">Iron walls</h4>
            <svg-icon class="w-5 h-5" name="icon-clean-sheet" />
          </div>
          <playerLoadingSkeleton
            v-if="isLoading"
            column-width="w-full"
            :rows="5"
          ></playerLoadingSkeleton>
          <div
            v-else
            class="grid justify-between grid-cols-4 text-xs font-bold uppercase border-b  border-offWhite"
          >
            <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
            <span class="p-1 text-center whitespace-nowrap">Clean sheets</span>
          </div>
          <div
            v-for="player in topCleanSheets"
            @click="navigateToPlayerModal(player.id)"
            :key="player.id"
            class="grid justify-between grid-cols-4 border-b cursor-pointer  player-stats-chart border-offWhite last:border-b-0 hover:bg-gray-100 animate"
          >
            <span
              class="flex justify-between col-span-3 p-1 border-r  border-offWhite"
            >
              {{ player.name }}
              <img
                class="w-6 h-6 mr-2 rounded-full shadow-md"
                :src="player.image"
                :alt="player.name"
                @error="loadFallbackImage"
              />
            </span>
            <span class="p-1 text-center">
              {{ player.totalCleanSheets }}
            </span>
          </div>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <div
            class="flex items-center justify-between pb-2 mb-4 border-b border-gray-800 "
          >
            <h4 class="text-lg font-bold uppercase">Top performers</h4>
            <svg-icon class="w-5 h-5" name="icon-rising-arrow" />
          </div>
          <playerLoadingSkeleton
            v-if="isLoading"
            column-width="w-full"
            :rows="5"
          ></playerLoadingSkeleton>
          <div
            v-else
            class="grid justify-between grid-cols-4 text-xs font-bold uppercase border-b  border-offWhite"
          >
            <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
            <span class="p-1 text-center whitespace-nowrap">Total Points</span>
          </div>
          <div
            v-for="player in topPoints"
            @click="navigateToPlayerModal(player.id)"
            :key="player.id"
            class="grid justify-between grid-cols-4 border-b cursor-pointer  player-stats-chart border-offWhite last:border-b-0 hover:bg-gray-100 animate"
          >
            <span
              class="flex justify-between col-span-3 p-1 border-r  border-offWhite"
            >
              {{ player.name }}
              <img
                class="w-6 h-6 mr-2 rounded-full shadow-md"
                :src="player.image"
                :alt="player.name"
                @error="loadFallbackImage"
              />
            </span>
            <span class="p-1 text-center">
              {{ player.totalPoints }}
            </span>
          </div>
        </div>
      </div>
      <div>
        <h4>Top of the Table</h4>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from '@vue/composition-api'
import { useContext, useRouter } from '@nuxtjs/composition-api'
import playerLoadingSkeleton from '@/components/Common/playerLoadingSkeleton.vue'
import { loadFallbackImage } from '@/helpers/helpers'

export default {
  // TODO: Create consistent wrapper container for all pages
  components: {
    playerLoadingSkeleton,
  },
  setup(props) {
    const { store } = useContext()
    const router = useRouter()

    const isLoading = computed(() => store.getters.isLoading)

    const topGoalScorers = computed(() =>
      store.getters.getSortedPlayerStat('totalGoals', 5)
    )
    const topAssists = computed(() =>
      store.getters.getSortedPlayerStat('totalAssists', 5)
    )
    const topRedCards = computed(() =>
      store.getters.getSortedPlayerStat('totalRedCards', 5)
    )
    const topCleanSheets = computed(() =>
      store.getters.getSortedPlayerStat('totalCleanSheets', 5)
    )
    const topPoints = computed(() =>
      store.getters.getSortedPlayerStat('totalPoints', 5)
    )

    const navigateToPlayerModal = (playerID) => {
      router.push({
        path: `/players?playerid=${playerID}`,
      })
    }

    return {
      topGoalScorers,
      topAssists,
      topRedCards,
      topCleanSheets,
      loadFallbackImage,
      navigateToPlayerModal,
      topPoints,
      playerLoadingSkeleton,
      isLoading,
    }
  },
}
</script>
