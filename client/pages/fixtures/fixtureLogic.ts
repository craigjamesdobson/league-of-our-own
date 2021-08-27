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
}

interface playerStats {
  playerID: number
  goalsScored?: number
  assists?: number
  cleanSheet?: boolean
  sentOff?: boolean
}

interface PlayerStatData {
  playerID: number
  statType: string
  playerStat: boolean | number
}

const useFixtureLogic = () => {
  const { store } = useContext()
  const playerStats = ref<playerStats[]>([])

  onMounted(() => {
    store.dispatch('fetchFixtures')
  })

  const fixtureData: fixtureData = reactive({
    fixturesTotal: 38,
    activeFixtureRound: null,
    filteredFixtures: [],
  })

  const filterFixtures = (fixtureRound: number) => {
    fixtureData.activeFixtureRound = fixtureRound
    fixtureData.filteredFixtures =
      store.getters.getFilteredFixtures(fixtureRound)
  }

  const updateFixtureScore = (fixturePayload) => {
    store.dispatch('updateFixtureScore', {
      score: fixturePayload.score,
      selectedFixtureID: fixturePayload.selectedFixtureID,
      activeWeek: fixturePayload.selectedWeek,
    })
  }

  const storePlayerStats = (week, fixture, venue, playerStats) => {
    store.dispatch('storePlayerStats', {
      activeWeek: week,
      activeFixture: fixture,
      activeVenue: venue,
      stats: playerStats,
    })
  }

  const updateFixtureCollection = () => {
    store.dispatch('updateFixtureCollection', fixtureData.activeFixtureRound)
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
