<template>
  <div class="filter-container">
    <h2 class="mb-4 text-2xl px-4">Filters</h2>
    <div class="h-64 justify-between mb-4 bg-white rounded-xl p-4">
      <div class="mb-4">
        <label class="flex text-xs mb-2" for="filter_name"
          >Filter by name</label
        >
        <div class="flex items-center bg-gray-100 py-1 px-2 rounded">
          <input
            id="filter_name"
            v-model="filterData.filterName"
            class="placeholder-gray-800 placeholder-opacity-50 bg-gray-100 text-sm w-full focus:outline-none"
            type="text"
            name="filter_name"
            placeholder="Search Players..."
            @keyup="filterPlayers"
          />
          <font-awesome-icon
            :icon="['fa', 'search']"
            class="fa-xs text-gray-400"
          />
        </div>
      </div>
      <div>
        <label class="flex text-xs mb-2" for="filter_name"
          >Filter by price</label
        >
        <div class="flex items-center bg-gray-100 py-1 px-2 rounded">
          <select
            id="filter_number"
            v-model="filterData.filterPrice"
            name="filter_number"
            class="placeholder-gray-800 placeholder-opacity-50 bg-gray-100 text-sm w-full focus:outline-none"
            @change="filterPlayers"
          >
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
    </div>
  </div>
</template>

<script>
import { useContext, reactive } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { store } = useContext()
    const filterData = reactive({
      filterName: null,
      filterPrice: null,
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

    const filterPlayers = () => {
      store.commit('UPDATE_PLAYERS', filterData)
    }

    return { filterPlayers, filterData, pricesAvailable }
  },
}
</script>

<style lang="postcss" scoped>
.filter-container {
  @apply px-4 w-1/4 h-64 sticky;
  top: 5.5rem;
}
</style>
