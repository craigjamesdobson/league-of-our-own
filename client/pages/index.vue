<template>
  <div class="flex flex-wrap">
    <div class="grid w-full grid-cols-6 gap-5 mb-5">
      <playerLoadingSkeleton
        v-if="isLoading"
        column-width="w-full"
        :rows="20"
        class="col-span-4"
      ></playerLoadingSkeleton>

      <Table
        v-else
        :drafted-team-data="draftedTeamData"
        :teams-to-show="34"
        class="col-span-4"
      ></Table>
      <div class="flex flex-col col-span-2">
        <div
          class="flex flex-col h-full p-4 bg-white rounded-lg justify-around"
        >
          <div
            class="
              flex
              items-center
              justify-between
              pb-2
              mb-4
              border-b border-primary
            "
          >
            <h4 class="text-lg font-bold uppercase">Gameweek winners</h4>
            <svg-icon
              class="w-5 h-5 fill-current text-primary"
              name="icon-star"
            />
          </div>
          <div
            v-for="(week, index) in weeklyWinners"
            :key="index"
            class="flex justify-between px-2"
          >
            Week {{ week.gameweek }}
            <div v-if="!week.winners.length">N/A</div>
            <div v-else>
              <span v-for="(team, i) in week.winners" :key="i">
                <span v-if="i >= 1 && i < week.winners.length">/</span>
                {{ team.teamName }}
              </span>
            </div>
            {{ week.points }}
          </div>
        </div>
      </div>
    </div>
    <div class="grid w-full grid-cols-5 gap-5">
      <div class="p-4 bg-white rounded-lg">
        <div
          class="
            flex
            items-center
            justify-between
            pb-2
            mb-4
            border-b border-primary
          "
        >
          <h4 class="text-lg font-bold uppercase">Sharp shooters</h4>
          <svg-icon
            class="w-5 h-5 fill-current text-primary"
            name="icon-goal"
          />
        </div>
        <playerLoadingSkeleton
          v-if="isLoading"
          column-width="w-full"
          :rows="5"
        ></playerLoadingSkeleton>
        <div
          v-else
          class="
            grid
            justify-between
            grid-cols-5
            text-xs
            font-bold
            uppercase
            border-b border-offWhite
          "
        >
          <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
          <span class="col-span-2 p-1 text-center">Goals</span>
        </div>
        <div
          v-for="player in topGoalScorers"
          :key="player.id"
          class="
            grid
            justify-between
            grid-cols-5
            border-b
            cursor-pointer
            player-stats-chart
            border-offWhite
            last:border-b-0
            hover:bg-gray-100
            animate
          "
          @click="navigateToPlayerModal(player.id)"
        >
          <span
            class="flex justify-between col-span-3 p-1 border-r border-offWhite"
          >
            {{ player.name }}
            <img
              class="w-6 h-6 mr-2 rounded-full shadow-md"
              :src="player.image"
              :alt="player.name"
              @error="loadFallbackImage"
            />
          </span>
          <span class="col-span-2 p-1 text-center">
            {{ player.totalGoals }}
          </span>
        </div>
      </div>
      <div class="p-4 bg-white rounded-lg">
        <div
          class="
            flex
            items-center
            justify-between
            pb-2
            mb-4
            border-b border-primary
          "
        >
          <h4 class="text-lg font-bold uppercase">Player makers</h4>
          <svg-icon
            class="w-5 h-5 fill-current text-primary"
            name="icon-assist"
          />
        </div>
        <playerLoadingSkeleton
          v-if="isLoading"
          column-width="w-full"
          :rows="5"
        ></playerLoadingSkeleton>
        <div
          v-else
          class="
            grid
            justify-between
            grid-cols-5
            text-xs
            font-bold
            uppercase
            border-b border-offWhite
          "
        >
          <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
          <span class="col-span-2 p-1 text-center">Assists</span>
        </div>
        <div
          v-for="player in topAssists"
          :key="player.id"
          class="
            grid
            justify-between
            grid-cols-5
            border-b
            cursor-pointer
            player-stats-chart
            border-offWhite
            last:border-b-0
            hover:bg-gray-100
            animate
          "
          @click="navigateToPlayerModal(player.id)"
        >
          <span
            class="flex justify-between col-span-3 p-1 border-r border-offWhite"
          >
            {{ player.name }}
            <img
              class="w-6 h-6 mr-2 rounded-full shadow-md"
              :src="player.image"
              :alt="player.name"
              @error="loadFallbackImage"
            />
          </span>
          <span class="col-span-2 p-1 text-center">
            {{ player.totalAssists }}
          </span>
        </div>
      </div>
      <div class="p-4 bg-white rounded-lg">
        <div
          class="
            flex
            items-center
            justify-between
            pb-2
            mb-4
            border-b border-primary
          "
        >
          <h4 class="text-lg font-bold uppercase">Hot heads</h4>
          <svg-icon
            class="w-5 h-5 fill-current text-primary"
            name="icon-sent-off"
          />
        </div>
        <playerLoadingSkeleton
          v-if="isLoading"
          column-width="w-full"
          :rows="5"
        ></playerLoadingSkeleton>
        <div
          v-else
          class="
            grid
            justify-between
            grid-cols-5
            text-xs
            font-bold
            uppercase
            border-b border-offWhite
          "
        >
          <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
          <span class="col-span-2 p-1 text-center whitespace-nowrap">
            Red cards
          </span>
        </div>
        <div
          v-for="player in topRedCards"
          :key="player.id"
          class="
            grid
            justify-between
            grid-cols-5
            border-b
            cursor-pointer
            player-stats-chart
            border-offWhite
            last:border-b-0
            hover:bg-gray-100
            animate
          "
          @click="navigateToPlayerModal(player.id)"
        >
          <span
            class="flex justify-between col-span-3 p-1 border-r border-offWhite"
          >
            {{ player.name }}
            <img
              class="w-6 h-6 mr-2 rounded-full shadow-md"
              :src="player.image"
              :alt="player.name"
              @error="loadFallbackImage"
            />
          </span>
          <span class="col-span-2 p-1 text-center">
            {{ player.totalRedCards }}
          </span>
        </div>
      </div>
      <div class="p-4 bg-white rounded-lg">
        <div
          class="
            flex
            items-center
            justify-between
            pb-2
            mb-4
            border-b border-primary
          "
        >
          <h4 class="text-lg font-bold uppercase">Iron walls</h4>
          <svg-icon
            class="w-5 h-5 fill-current text-primary"
            name="icon-clean-sheet"
          />
        </div>
        <playerLoadingSkeleton
          v-if="isLoading"
          column-width="w-full"
          :rows="5"
        ></playerLoadingSkeleton>
        <div
          v-else
          class="
            grid
            justify-between
            grid-cols-5
            text-xs
            font-bold
            uppercase
            border-b border-offWhite
          "
        >
          <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
          <span class="col-span-2 p-1 text-center whitespace-nowrap">
            Clean sheets
          </span>
        </div>
        <div
          v-for="player in topCleanSheets"
          :key="player.id"
          class="
            grid
            justify-between
            grid-cols-5
            border-b
            cursor-pointer
            player-stats-chart
            border-offWhite
            last:border-b-0
            hover:bg-gray-100
            animate
          "
          @click="navigateToPlayerModal(player.id)"
        >
          <span
            class="flex justify-between col-span-3 p-1 border-r border-offWhite"
          >
            {{ player.name }}
            <img
              class="w-6 h-6 mr-2 rounded-full shadow-md"
              :src="player.image"
              :alt="player.name"
              @error="loadFallbackImage"
            />
          </span>
          <span class="col-span-2 p-1 text-center">
            {{ player.totalCleanSheets }}
          </span>
        </div>
      </div>
      <div class="p-4 bg-white rounded-lg">
        <div
          class="
            flex
            items-center
            justify-between
            pb-2
            mb-4
            border-b border-primary
          "
        >
          <h4 class="text-lg font-bold uppercase">Top performers</h4>
          <svg-icon
            class="w-5 h-5 fill-current text-primary"
            name="icon-rising-arrow"
          />
        </div>
        <playerLoadingSkeleton
          v-if="isLoading"
          column-width="w-full"
          :rows="5"
        ></playerLoadingSkeleton>
        <div
          v-else
          class="
            grid
            justify-between
            grid-cols-5
            text-xs
            font-bold
            uppercase
            border-b border-offWhite
          "
        >
          <span class="col-span-3 p-1 border-r border-offWhite">Player</span>
          <span class="col-span-2 p-1 text-center whitespace-nowrap">
            Total Points
          </span>
        </div>
        <div
          v-for="player in topPoints"
          :key="player.id"
          class="
            grid
            justify-between
            grid-cols-5
            border-b
            cursor-pointer
            player-stats-chart
            border-offWhite
            last:border-b-0
            hover:bg-gray-100
            animate
          "
          @click="navigateToPlayerModal(player.id)"
        >
          <span
            class="flex justify-between col-span-3 p-1 border-r border-offWhite"
          >
            {{ player.name }}
            <img
              class="w-6 h-6 mr-2 rounded-full shadow-md"
              :src="player.image"
              :alt="player.name"
              @error="loadFallbackImage"
            />
          </span>
          <span class="col-span-2 p-1 text-center">
            {{ player.totalPoints }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, ref } from '@vue/composition-api'
import { useContext, useRouter } from '@nuxtjs/composition-api'
import playerLoadingSkeleton from '@/components/Common/playerLoadingSkeleton.vue'
import Table from '@/components/Table/Table.vue'
import { loadFallbackImage } from '@/helpers/helpers'

export default {
  // TODO: Create consistent wrapper container for all pages
  components: {
    playerLoadingSkeleton,
    Table,
  },
  setup(props) {
    const { store } = useContext()
    const router = useRouter()

    const isLoading = computed(() => store.getters.isLoading)
    const mostRecentGameweek = ref(32)

    const draftedTeamData = computed(() =>
      store.getters['drafted-data/getSortedTeams'](mostRecentGameweek)
    )

    const weeklyWinners = computed(
      () => store.getters['drafted-data/getWeeklyWinners']
    )

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
      draftedTeamData,
      loadFallbackImage,
      navigateToPlayerModal,
      topPoints,
      weeklyWinners,
      isLoading,
    }
  },
}
</script>

<style lang="scss" scoped>
.custom-dashboard-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-rows: 1fr;
  grid-template-columns: 70% 30%;
  justify-content: center;
  align-content: space-evenly;
  width: 100%;

  @apply mb-6;
}

body {
  overflow: hidden;
}
</style>
