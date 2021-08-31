import {
  useContext,
  ref,
  reactive,
  onMounted,
  computed,
} from '@nuxtjs/composition-api'
import { Fixture } from '~/components/Interfaces/Fixture'
import { PlayerPosition } from '~/components/Interfaces/PlayerPosition'

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
    fixturesLoaded: computed(() => store.state['fixture-data'].fixturesLoaded)
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
    week,
    fixture,
    venue,
    playerStats: playerStats
  ) => {
    await store.dispatch('fixture-data/storePlayerStats', {
      activeWeek: week,
      activeFixture: fixture,
      activeVenue: venue,
      stats: playerStats,
    })

    const selectedWeek = store.state['fixture-data'].fixtures.filter(
      (x) => x.week === week.toString()
    )

    const selectedFixture = selectedWeek[0].fixtures.filter(
      (x) => x.id === fixture
    )

    const activePlayerStats = selectedFixture[0][venue].stats.filter(
      (x) => x.playerID === playerStats.playerID
    )

    const pointsTotal = calculatePlayerPoints(activePlayerStats)

    await store.dispatch('fixture-data/storePlayerStats', {
      activeWeek: week,
      activeFixture: fixture,
      activeVenue: venue,
      stats: {
        playerID: playerStats.playerID,
        playerStat: pointsTotal,
        statType: 'points',
      },
    })
  }

  const calculatePlayerPoints = (playerStats: playerStats) => {
    const playerPos = store.state.playerData.players.players.filter(
      (x) => x.id === playerStats[0].playerID
    )[0].playerType

    let totalPoints = 0

    let goalsMultiplier = 0
    let cleanSheetTotal = 0
    let sentOffTotal = 10

    switch (playerPos) {
      case PlayerPosition.Goalkeeper:
        goalsMultiplier = 10
        cleanSheetTotal = 5
        break
      case PlayerPosition.Defender:
        goalsMultiplier = 7
        cleanSheetTotal = 2
        break
      case PlayerPosition.Midfielder:
        goalsMultiplier = 5
        break
      case PlayerPosition.Forward:
        goalsMultiplier = 3
        break
    }

    if (playerStats[0].cleanSheet) {
      totalPoints += cleanSheetTotal
    }

    if (playerStats[0].sentOff) {
      totalPoints -= sentOffTotal
    }

    if (playerStats[0].assists) {
      totalPoints += 3 * playerStats[0].assists
    }

    if (playerStats[0].goalsScored) {
      totalPoints += playerStats[0].goalsScored * goalsMultiplier

      if (playerStats[0].goalsScored === 2) {
        totalPoints += 5
      } else if (playerStats[0].goalsScored >= 3) {
        totalPoints += 10
      }
    }

    console.log(totalPoints)

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
