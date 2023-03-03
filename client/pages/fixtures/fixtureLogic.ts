import { useContext, ref, reactive, computed } from '@nuxtjs/composition-api'
import Swal from 'sweetalert2'
import Fixture from '~/../v2/components/Interfaces/Fixture'
import { PlayerPositionShort } from '~/components/Interfaces/PlayerPosition'

interface fixtureData {
  fixturesTotal: number
  activeFixtureRound: number
  filteredFixtures: Fixture[]
  isIncomplete: false
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
    isIncomplete: false,
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
    fixtureData.isIncomplete = filteredFixtureData.value.isIncomplete
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
      fixtureWeek,
      playerStats,
    })

    const player = store.getters.getPlayerData.players.players.filter(
      (x) => x.id === playerStats.playerID
    )

    const pointsTotal = calculatePlayerPoints(player[0], fixtureWeek)

    await store.dispatch('updatePlayers', {
      fixtureWeek,
      playerStats: {
        playerID: playerStats.playerID,
        statType: 'points',
        statValue: pointsTotal,
      },
    })
  }

  const completeTeamStats = {
    gameweekData: [],
    fixtureRound: fixtureData.activeFixtureRound,
  }

  const calculateGameweekStats = async (teams) => {
    completeTeamStats.gameweekData = []
    teams.forEach((team) => {
      const gameweekData = {
        gameweek: fixtureData.activeFixtureRound,
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
        gameweekData.cleanSheets += gameWeekStats[0].cleanSheet ? 1 : 0
        gameweekData.points += gameWeekStats[0].points
      })
      completeTeamStats.gameweekData.push(gameweekData)
    })

    return await store.dispatch('drafted-data/updateDraftedTeams', {
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
    const sentOffTotal = 10

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
    const res = await store.dispatch(
      'fixture-data/updateFixtureCollection',
      fixtureData.activeFixtureRound
    )

    filterFixtures(fixtureData.activeFixtureRound)

    return res
  }

  const updateGameweekStatus = async () => {
    const res = await store.dispatch('fixture-data/updateGameweekStatus', {
      activeWeek: fixtureData.activeFixtureRound,
      isIncomplete: fixtureData.isIncomplete,
    })

    return res
  }

  const toggleBtnLoadingState = (loading) => {
    const button: HTMLButtonElement = document.querySelector(
      '.js-update-fixture-collection-btn'
    )

    loading
      ? button.classList.add('loading')
      : button.classList.remove('loading')
  }

  const updateHandler = async () => {
    toggleBtnLoadingState(true)

    try {
      await updateFixtureCollection()
      await calculateGameweekStats(store.state['drafted-data'].draftedTeamData)
      Swal.fire({
        position: 'top-start',
        icon: 'success',
        title: `Gameweek ${fixtureData.activeFixtureRound} has been saved`,
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      })
    } catch (err) {
      Swal.fire({
        position: 'top-end',
        icon: 'error',
        title: `Error saving gameweek`,
        toast: true,
        showConfirmButton: false,
        timer: 2500,
      })
      throw err
    }
    toggleBtnLoadingState(false)
  }

  return {
    fixtureData,
    filteredFixtureData,
    filterFixtures,
    updateFixtureScore,
    updateHandler,
    playerStats,
    storePlayerStats,
    updateGameweekStatus,
  }
}

export { useFixtureLogic }
