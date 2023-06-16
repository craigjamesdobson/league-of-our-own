<script setup>
import { TEAM_DATA } from '@/modules/teams/constants';
import { PRICE_BREAKS } from '@/modules/filters/constants';
import { useFilters } from '@/modules/filters';
import { getImageUrl } from '@/composables/helpers';

const {
  filterData,
  playerStore,
  selectfilteredTeam,
  setFilteredPlayers,
  resetFilteredTeams,
} = useFilters();

const filtersVisible = ref(false);
</script>

<template>
  <div class="filter-container">
    <div class="flex flex-row items-center justify-between p-4 xl:mb-4 xl:p-0">
      <h2 class="!mb-0 !text-xl main-heading">Filters</h2>
      <button
        class="xl:hidden"
        @click.prevent="filtersVisible = !filtersVisible"
      >
        <Icon
          v-if="filtersVisible"
          class="fill-slate-900"
          size="22"
          name="octicon:chevron-down-24"
        />
        <Icon
          v-else
          class="fill-slate-900"
          size="22"
          name="octicon:chevron-up-24"
        />
      </button>
    </div>
    <div
      class="justify-between mb-4 bg-white rounded-sm lg:bg-transparent xl:block"
      :class="{ hidden: !filtersVisible }"
    >
      <div class="p-4 bg-white xl:mb-4">
        <div class="pb-3 mb-3 border-b border-gray-100">
          <label class="flex mb-2 text-xs" for="filter_name">
            Filter by name
          </label>
          <div class="flex items-center px-2 py-1 bg-gray-100 rounded">
            <input
              id="filter_name"
              v-model="filterData.filterName"
              class="w-full text-xs placeholder-gray-800 placeholder-opacity-50 bg-gray-100 focus:outline-none"
              type="text"
              name="filter_name"
              placeholder="Search Players..."
              @keyup="setFilteredPlayers"
            />
            <Icon size="22" name="mdi:person-search-outline" />
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
              <option selected="selected" value="">All</option>
              <option v-for="price in PRICE_BREAKS" :key="price" :value="price">
                {{ price }}
              </option>
            </select>
          </div>
        </div>
        <div class="border-gray-100 max-xl:pb-3 max-xl:border-b">
          <label
            class="flex justify-between w-full mb-4 text-xs"
            for="filter_name"
          >
            Filter by team
            <button title="reset team selection" @click="resetFilteredTeams">
              <Icon size="20" name="carbon:reset" />
            </button>
          </label>
          <div class="flex flex-wrap -mx-2 -mb-1 cursor-pointer">
            <button
              v-for="team in TEAM_DATA"
              :key="team.id"
              :data-teamID="team.id"
              class="mb-2 icon-container"
              @click.prevent="selectfilteredTeam"
            >
              <img
                class="w-full h-full px-2"
                :src="getImageUrl(team.short_name.toLowerCase())"
              />
            </button>
          </div>
        </div>
      </div>
      <div class="mx-4 xl:m-0">
        <div
          class="flex items-center grid-cols-4 gap-5 px-4 py-2 mb-4 text-xs text-blue-700 bg-blue-100 border-l-4 border-blue-500 rounded-sm"
          role="alert"
        >
          <Icon class="flex-none" size="22" name="mdi:information-outline" />
          <p class="col-span-3">
            Players last updated on:
            <strong>{{ playerStore.getPlayersUpdatedDate }}</strong>
          </p>
        </div>
        <div
          class="flex items-center gap-5 px-4 py-2 text-xs text-yellow-700 bg-yellow-100 border-l-4 border-yellow-500 rounded-sm bg-"
          role="alert"
        >
          <Icon class="flex-none" size="22" name="mingcute:warning-line" />
          <p>
            Player data is pulled from fantasy football source and may not be
            the same as official data. It is to be used as a guide when picking
            players and not for score calculations
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/components/filters';
</style>
