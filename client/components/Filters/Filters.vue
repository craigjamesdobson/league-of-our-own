<template>
  <div class="filter-container">
    <h2 class="px-4 mb-4 text-2xl">Filters</h2>
    <div class="justify-between p-4 mb-4 bg-white rounded-sm">
      <div class="pb-3 mb-3 border-b border-gray-100">
        <label class="flex mb-2 text-xs" for="filter_name">
          Filter by name
        </label>
        <div class="flex items-center px-2 py-1 bg-gray-100 rounded">
          <input
            id="filter_name"
            v-model="filterData.filterName"
            class="w-full text-sm placeholder-gray-800 placeholder-opacity-50 bg-gray-100  focus:outline-none"
            type="text"
            name="filter_name"
            placeholder="Search Players..."
            @keyup="filterPlayers"
          />
          <font-awesome-icon
            :icon="['fa', 'search']"
            class="text-gray-400 fa-xs"
          />
        </div>
      </div>
      <div class="pb-3 mb-3 border-b border-gray-100">
        <label class="flex mb-2 text-xs" for="filter_name">
          Filter by price
        </label>
        <div class="flex items-center px-2 py-1 bg-gray-100 rounded">
          <select
            id="filter_number"
            v-model="filterData.filterPrice"
            name="filter_number"
            class="w-full text-sm placeholder-gray-800 placeholder-opacity-50 bg-gray-100  focus:outline-none"
            @change="filterPlayers"
          >
            <option selected="selected" value="">All</option>
            <option
              v-for="price in pricesAvailable"
              :key="price"
              :value="price"
            >
              {{ price }}
            </option>
          </select>
        </div>
      </div>
      <div>
        <label
          class="flex justify-between w-full mb-2 text-xs"
          for="filter_name"
        >
          Filter by team
          <button title="clear team selection" @click="selectfilteredTeam">
            <font-awesome-icon
              :icon="['fa', 'redo']"
              class="text-gray-900 fa-sm"
            />
          </button>
        </label>
        <div class="flex flex-wrap -mx-2 -mb-1 cursor-pointer">
          <div
            v-for="team in teamData"
            :key="team.id"
            :data-teamID="team.id"
            class="mb-2 icon-container"
            @click="selectfilteredTeam"
          >
            <svg-icon
              class="w-full h-full px-2"
              :name="'teams/' + team.short_name"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useContext, reactive, computed } from '@nuxtjs/composition-api'
import { debounce } from 'lodash-es'

export default {
  setup() {
    const { store } = useContext()
    const teamData = computed(() => store.getters.getTeams)
    const filterData = reactive({
      filterName: '',
      filterPrice: '',
      filterTeam: null,
    })
    const pricesAvailable = [
      '4.0',
      '4.5',
      '5.0',
      '5.5',
      '6.0',
      '6.5',
      '7.0',
      '7.5',
      '8.0',
      '8.5',
      '10.0',
      '10.5',
      '11.0',
      '11.5',
      '12.0',
    ]

    const selectfilteredTeam = (event) => {
      document
        .querySelectorAll('.icon-container')
        .forEach((e) => e.classList.remove('active'))
      event.currentTarget.classList.add('active')
      filterData.filterTeam = +event.currentTarget.dataset.teamid
      filterPlayers()
    }

    const filterPlayers = debounce(() => {
      store.dispatch('filterPlayers', filterData)
    }, 500)

    return {
      filterPlayers,
      filterData,
      teamData,
      pricesAvailable,
      selectfilteredTeam,
    }
  },
}
</script>

<style lang="scss" scoped>
.filter-container {
  @apply px-4 w-1/4 self-start sticky;
  top: 5.5rem;
}

.icon-container {
  @apply transition-all duration-200 ease-in-out h-8;
  width: 10%;
  filter: grayscale(1);

  &.active {
    filter: grayscale(0);
    transform: scale(1.2);
  }
}
</style>
