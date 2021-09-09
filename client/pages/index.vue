<template>
  <div class="flex mx-10 my-2">
    <div class="grid w-full grid-cols-2 gap-5">
      <div class="grid w-full grid-cols-3 gap-5">
        <div class="p-4 bg-white rounded-sm">
          <h4 class="pb-2 text-lg font-bold uppercase">Sharpshooters</h4>
          <ul>
            <li v-for="player in topGoalScorers" :key="player.id">
              {{ player.name }} - {{ player.totalGoals }}
            </li>
          </ul>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <h4 class="pb-2 text-lg font-bold uppercase">Playermakers</h4>
          <ul>
            <li v-for="player in topAssists" :key="player.id">
              {{ player.name }} - {{ player.totalAssists }}
            </li>
          </ul>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <h4 class="pb-2 text-lg font-bold uppercase">Hotheads</h4>
          <ul>
            <li v-for="player in topRedCards" :key="player.id">
              {{ player.name }} - {{ player.totalRedCards }}
            </li>
          </ul>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <h4 class="pb-2 text-lg font-bold uppercase">Iron Walls</h4>
          <ul>
            <li v-for="player in topCleanSheets" :key="player.id">
              {{ player.name }} - {{ player.totalCleanSheets }}
            </li>
          </ul>
        </div>
        <div class="p-4 bg-white rounded-sm">
          <h4 class="pb-2 text-lg font-bold uppercase">Points</h4>
          <ul>
            <li v-for="player in topPoints" :key="player.id">
              {{ player.name }} - {{ player.totalPoints }}
            </li>
          </ul>
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
import { useContext } from '@nuxtjs/composition-api'
export default {
  // TODO: Create consistent wrapper container for all pages
  setup(props) {
    const { store } = useContext()

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

    return {
      topGoalScorers,
      topAssists,
      topRedCards,
      topCleanSheets,
      topPoints,
    }
  },
}
</script>

<style>
.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
