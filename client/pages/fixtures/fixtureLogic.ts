import {
  useContext,
  ref,
  reactive,
  onMounted,
  computed,
} from '@nuxtjs/composition-api'
import { Fixture } from '~/components/Interfaces/Fixture'
import {
  PlayerPosition,
  PlayerPositionShort,
} from '~/components/Interfaces/PlayerPosition'
import { Player } from '~/components/Players/Player'

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

  onMounted(() => {
    store.dispatch('fixture-data/fetchFixtures')
  })

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

    // const selectedWeek = store.state['fixture-data'].fixtures.filter(
    //   (x) => x.week === week.toString()
    // )

    // const selectedFixture = selectedWeek[0].fixtures.filter(
    //   (x) => x.id === fixture
    // )

    // const activePlayerStats = selectedFixture[0][venue].stats.filter(
    //   (x) => x.playerID === playerStats.playerID
    // )

    const pointsTotal = calculatePlayerPoints(player[0], fixtureWeek)

    await store.dispatch('updatePlayers', {
      fixtureWeek: fixtureWeek,
      playerStats: {
        playerID: playerStats.playerID,
        statType: 'points',
        statValue: pointsTotal,
      },
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
