import {
  useContext,
  computed,
  ref,
  reactive,
  onMounted,
} from '@nuxtjs/composition-api'
import { CompleteWeek } from '~/components/Fixtures/CompleteWeek'
import { Fixture } from '~/components/Interfaces/Fixture'

interface fixtureData {
  fixturesTotal: number
  activeFixtureRound: number
  filteredFixtures: Fixture[]
  updatedAt: any
}

interface playerStats {
  playerID: number
  goalsScored?: number
  assists?: number
  cleanSheet?: boolean
  sentOff?: boolean
}

const useFixtureLogic = () => {
  const { store } = useContext()
  const playerStats = ref<playerStats[]>([])

  onMounted(() => {
    store.dispatch('fixture-data/fetchFixtures')
  })

  const fixtureData: fixtureData = reactive({
    fixturesTotal: 38,
    activeFixtureRound: null,
    filteredFixtures: [],
    updatedAt: null,
  })

  const filterFixtures = (fixtureRound: number) => {
    const filteredFixtureData = (fixtureData.filteredFixtures =
      store.getters['fixture-data/getFilteredFixtures'](fixtureRound))

    fixtureData.activeFixtureRound = fixtureRound
    fixtureData.filteredFixtures = filteredFixtureData.fixtures
    fixtureData.updatedAt = filteredFixtureData.updatedAt
  }

  const updateFixtureScore = (fixturePayload) => {
    store.dispatch('fixture-data/updateFixtureScore', {
      score: fixturePayload.score,
      selectedFixtureID: fixturePayload.selectedFixtureID,
      activeWeek: fixturePayload.selectedWeek,
    })
  }

  const storePlayerStats = (week, fixture, venue, playerStats) => {
    store.dispatch('fixture-data/storePlayerStats', {
      activeWeek: week,
      activeFixture: fixture,
      activeVenue: venue,
      stats: playerStats,
    })
  }

  const updateFixtureCollection = async () => {
    await store.dispatch(
      'fixture-data/updateFixtureCollection',
      fixtureData.activeFixtureRound
    )

    fixtureData.updatedAt = new Date().toISOString()
  }

  return {
    fixtureData,
    filterFixtures,
    updateFixtureScore,
    updateFixtureCollection,
    playerStats,
    storePlayerStats,
  }
}

export { useFixtureLogic }
