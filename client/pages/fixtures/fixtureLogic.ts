import {
  useContext,
  ref,
  reactive,
  onMounted,
  computed,
} from '@nuxtjs/composition-api'
import { Fixture } from '~/components/Interfaces/Fixture'
import { PlayerPositionShort } from '~/components/Interfaces/PlayerPosition'

interface fixtureData {
  fixturesTotal: number
  activeFixtureRound: number
  filteredFixtures: Fixture[]
  updatedAt: any
  updatedBy: any
  fixturesLoaded: boolean
}

interface playerStats {
  playerID: number
  goalsScored?: number
  assists?: number
  cleanSheet?: boolean
  sentOff?: boolean
  points?: number
}

const useFixtureLogic = () => {
  const { store } = useContext()
  const playerStats = ref<playerStats[]>([])

  const fixtureData: fixtureData = reactive({
    fixturesTotal: 38,
    activeFixtureRound: 1,
    filteredFixtures: [],
    updatedAt: null,
    updatedBy: null,
    fixturesLoaded: computed(() => store.state['fixture-data'].fixturesLoaded),
  })

  const filteredFixtureData = computed(() =>
    store.getters['fixture-data/getFilteredFixtures'](
      fixtureData.activeFixtureRound
    )
  )

  const filterFixtures = (fixtureRound: number) => {
    fixtureData.activeFixtureRound = fixtureRound
    fixtureData.filteredFixtures = filteredFixtureData.value.fixtures
    fixtureData.updatedAt = filteredFixtureData.value.updatedAt
    fixtureData.updatedBy = filteredFixtureData.value.updatedBy
  }

  const updateFixtureScore = (fixturePayload) => {
    store.dispatch('fixture-data/updateFixtureScore', {
      score: fixturePayload.score,
      selectedFixtureID: fixturePayload.selectedFixtureID,
      activeWeek: fixturePayload.selectedWeek,
    })
  }

  const storePlayerStats = async (
    fixtureWeek: number,
    playerStats: playerStats
  ) => {
    await store.dispatch('updatePlayers', {
      fixtureWeek: fixtureWeek,
      playerStats: playerStats,
    })

    const player = store.getters.getPlayerData.players.players.filter(
      (x) => x.id === playerStats.playerID
    )

    const pointsTotal = calculatePlayerPoints(player[0], fixtureWeek)

    await store.dispatch('updatePlayers', {
      fixtureWeek: fixtureWeek,
      playerStats: {
        playerID: playerStats.playerID,
        statType: 'points',
        statValue: pointsTotal,
      },
    })

    calculateGameweekStats(store.state['drafted-data'].draftedTeamData)
  }

  const updatePlayerPayload = {
    fixtureWeek: fixtureData.activeFixtureRound,
    completeTeamStats: [],
  }

  const completeTeamStats = {
    gameweekData: [],
    fixtureRound: fixtureData.activeFixtureRound,
  }

  const calculateGameweekStats = (teams) => {
    teams.forEach((team) => {
      const gameweekData = {
        teamID: team.teamID,
        goals: 0,
        assists: 0,
        redCards: 0,
        cleanSheets: 0,
        points: 0,
      }
      team.teamPlayers.forEach((player) => {
        let gameWeekStats = null

        player.transfers.forEach((transferedPlayer) => {
          if (transferedPlayer.transferWeek <= fixtureData.activeFixtureRound) {
            gameWeekStats = transferedPlayer.player.gameWeekStats.filter(
              (x) => x.gameweek === fixtureData.activeFixtureRound
            )
          }
        })
        if (gameWeekStats === null) {
          gameWeekStats = player.gameWeekStats.filter(
            (x) => x.gameweek === fixtureData.activeFixtureRound
          )
        }

        gameweekData.goals += gameWeekStats[0].goalsScored
        gameweekData.assists += gameWeekStats[0].assists
        gameweekData.redCards += gameWeekStats[0].sentOff ? 1 : 0
        gameweekData.goals += gameWeekStats[0].cleanSheet ? 1 : 0
        gameweekData.points += gameWeekStats[0].points
      })
      completeTeamStats.gameweekData.push(gameweekData)
    })

    store.dispatch('drafted-data/updateDraftedTeams', {
      gameweekData: completeTeamStats,
      fixtureWeek: fixtureData.activeFixtureRound,
    })
  }

  const calculatePlayerPoints = (player: any, fixtureWeek: number) => {
    const gameWeekStats: playerStats = player.gameWeekStats.filter(
      (x) => x.gameweek === fixtureWeek
    )[0]

    let totalPoints = 0

    let goalsMultiplier = 0
    let cleanSheetTotal = 0
    let sentOffTotal = 10

    switch (player.playerType) {
      case PlayerPositionShort.GK:
        goalsMultiplier = 10
        cleanSheetTotal = 5
        break
      case PlayerPositionShort.DEF:
        goalsMultiplier = 7
        cleanSheetTotal = 2
        break
      case PlayerPositionShort.MID:
        goalsMultiplier = 5
        break
      case PlayerPositionShort.FWD:
        goalsMultiplier = 3
        break
    }

    if (gameWeekStats.cleanSheet) {
      totalPoints += cleanSheetTotal
    }

    if (gameWeekStats.sentOff) {
      totalPoints -= sentOffTotal
    }

    if (gameWeekStats.assists) {
      totalPoints += 3 * gameWeekStats.assists
    }

    if (gameWeekStats.goalsScored) {
      totalPoints += gameWeekStats.goalsScored * goalsMultiplier

      if (gameWeekStats.goalsScored === 2) {
        totalPoints += 5
      } else if (gameWeekStats.goalsScored >= 3) {
        totalPoints += 10
      }
    }

    return totalPoints
  }

  const updateFixtureCollection = async () => {
    await store.dispatch(
      'fixture-data/updateFixtureCollection',
      fixtureData.activeFixtureRound
    )

    filterFixtures(fixtureData.activeFixtureRound)
  }

  return {
    fixtureData,
    filteredFixtureData,
    filterFixtures,
    updateFixtureScore,
    updateFixtureCollection,
    playerStats,
    storePlayerStats,
  }
}

export { useFixtureLogic }
