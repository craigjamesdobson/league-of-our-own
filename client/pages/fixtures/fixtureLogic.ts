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

  const storePlayerStats = (e: PlayerStatData) => {
    const activePlayerStats = playerStats.value.filter(
      (x) => x.playerID === e.playerID
    )
    if (activePlayerStats.length) {
      const currentStatType = e.statType
      activePlayerStats[0][currentStatType] = e.playerStat
    } else {
      playerStats.value.push({
        playerID: e.playerID,
        [e.statType]: e.playerStat,
      })
    }
  }

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
