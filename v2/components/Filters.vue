<script setup>
import { TEAM_DATA } from '@/modules/teams/constants'
import { PRICE_BREAKS } from '@/modules/filters/constants'
import { useFilters } from '@/modules/filters'
import { getImageUrl } from '@/composables/helpers'

const { filterData, playerStore, selectfilteredTeam, setFilteredPlayers }
  = useFilters()
</script>

<template>
  <div class="filter-container">
    <h2 class="px-4 mb-4 text-2xl">
      Filters
    </h2>
    <div class="justify-between p-4 mb-4 bg-white rounded-sm">
      <div class="pb-3 mb-3 border-b border-gray-100">
        <label class="flex mb-2 text-xs" for="filter_name">
          Filter by name
        </label>
        <div class="flex items-center px-2 py-1 bg-gray-100 rounded">
          <input
            id="filter_name"
            v-model="filterData.filterName"
            class="w-full text-sm placeholder-gray-800 placeholder-opacity-50 bg-gray-100 focus:outline-none"
            type="text"
            name="filter_name"
            placeholder="Search Players..."
            @keyup="setFilteredPlayers"
          >
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
            class="w-full text-sm placeholder-gray-800 placeholder-opacity-50 bg-gray-100 focus:outline-none"
            @change="setFilteredPlayers"
          >
            <option selected="selected" value="">
              All
            </option>
            <option v-for="price in PRICE_BREAKS" :key="price" :value="price">
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
            <SystemUiconsReset />
          </button>
        </label>
        <div class="flex flex-wrap -mx-2 -mb-1 cursor-pointer">
          <div
            v-for="team in TEAM_DATA"
            :key="team.id"
            :data-teamID="team.id"
            class="mb-2 icon-container"
            @click="selectfilteredTeam"
          >
            <img
              class="w-full h-full px-2"
              :src="getImageUrl(team.short_name.toLowerCase())"
            >
          </div>
        </div>
      </div>
    </div>
    <div class="text-xs text-right">
      Players last updated on: {{ playerStore.getPlayersUpdatedDate }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/components/filters";
</style>
