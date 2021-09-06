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
        <DraftedTeam
          :key="team.id"
          :team="team"
          :fixture-week="fixtureWeek"
          :dynamic-view="dynamicView"
        ></DraftedTeam>
      </div>
    </template>
    <playerLoadingSkeleton v-else></playerLoadingSkeleton>
  </div>
</template>

<script>
import { useContext, computed, ref, watch } from '@nuxtjs/composition-api'
import DraftedTeam from '@/components/DraftedTeams/DraftedTeam.vue'
import playerLoadingSkeleton from '@/components/Common/playerLoadingSkeleton'

export default {
  components: {
    DraftedTeam,
    playerLoadingSkeleton,
  },
  props: {
    columnClass: {
      type: String,
      required: true,
    },
    fixtureWeek: {
      type: Number,
      default: 0,
    },
    dynamicView: Boolean,
  },
  setup(props) {
    const { store } = useContext()
    const draftedTeamData = computed(
      () => store.getters['drafted-data/getDraftedTeams']
    )

    const updatePlayerPayload = {
      fixtureWeek: props.fixtureWeek,
      completeTeamStats: [],
    }

    const calculateGameweekStats = (teamData) => {
      const gameweekData = {
        goals: 0,
        assists: 0,
        redCards: 0,
        cleanSheets: 0,
        points: 0,
      }

      teamData.forEach((team) => {
        let gameWeekStats = null
        team.teamPlayers.transfers.forEach((transferedPlayer) => {
          if (transferedPlayer.transferWeek <= props.fixtureWeek) {
            gameWeekStats = transferedPlayer.player.gameWeekStats.filter(
              (x) => x.gameweek === props.fixtureWeek
            )
          }
        })
        if (gameWeekStats === null) {
          gameWeekStats = player.gameWeekStats.filter(
            (x) => x.gameweek === props.fixtureWeek
          )
        }

        gameweekData.goals += gameWeekStats[0].goalsScored
        gameweekData.assists += gameWeekStats[0].assists
        gameweekData.redCards += gameWeekStats[0].sentOff ? 1 : 0
        gameweekData.goals += gameWeekStats[0].cleanSheet ? 1 : 0
        gameweekData.points += gameWeekStats[0].points

        updatePlayerPayload.completeTeamStats.push(gameweekData)
      })
    }

    // store.dispatch('drafted-data/updateDraftedTeams', {
    //   teamID: team.teamID,
    //   gameweekData: gameweekData,
    //   fixtureWeek: props.fixtureWeek,
    // })

    //calculateGameweekStats()

    watch(store.state.playerData.players.players, (currentState, prevState) => {
      calculateGameweekStats(draftedTeamData.value)
    })

    console.log(updatePlayerPayload)

    return {
      draftedTeamData,
      calculateGameweekStats,
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
