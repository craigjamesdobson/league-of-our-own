<template>
  <div class="flex flex-row flex-wrap">
    <h1 class="flex w-full">Teams</h1>
    <template v-if="draftedTeamData.length">
      <div
        v-for="team in draftedTeamData"
        :key="team.id"
        class="flex flex-col"
        :class="columnClass"
      >
        <DraftedTeam :key="team.id" :team="team"></DraftedTeam>
      </div>
    </template>
    <div v-else>Loading...</div>
  </div>
</template>

<script>
import {
  useContext,
  computed,
  ref,
  watch,
  watchEffect,
} from '@nuxtjs/composition-api'
import DraftedTeam from '@/components/DraftedTeams/DraftedTeam.vue'

export default {
  components: {
    DraftedTeam,
  },
  props: {
    columnClass: {
      type: String,
      required: true,
    },
    fixtureData: {
      type: Array,
      default: [],
    },
  },
  setup(props) {
    const { store } = useContext()
    const draftedTeamData = computed(
      () => store.getters['drafted-data/getDraftedTeams']
    )

    const playerStats = ref([])

    props.fixtureData.forEach((fixture) => {
      const homeStats = fixture.home.stats
      const awayStats = fixture.away.stats

      playerStats.value.push(...homeStats, ...awayStats)
    })

    const setTeamData = (team) => {
      team.teamPlayers.forEach((player) => {
        const playerPoints = playerStats.value.filter(
          (x) => x.playerID === player.id
        )[0]?.points

        playerPoints ? (player.points = playerPoints) : (player.points = 0)

        return team
      })
    }

    return {
      draftedTeamData,
      setTeamData,
      props,
    }
  },
}
</script>

<style lang="scss">
.transferred-player {
  &:hover {
    .old-transfer {
      display: flex;
    }
  }
}
</style>
