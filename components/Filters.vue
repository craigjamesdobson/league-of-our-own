<script setup>
import { TEAM_DATA } from '@/logic/teams/constants';

const {
  filterData,
  playerStore,
  selectfilteredTeam,
  setFilteredPlayers,
  resetFilteredTeams,
} = useFilters();

const players = defineModel('players');
</script>

<template>
  <div class="filter-container">
    <div
      class="hidden xl:flex flex-row items-center justify-between p-4 cursor-pointer xl:mb-4 xl:p-0"
    >
      <h2 class="!mb-0 !text-xl main-heading">Filters</h2>
    </div>
    <div
      class="justify-between mb-4 bg-white rounded-sm lg:bg-transparent xl:block"
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
              @keyup="players = setFilteredPlayers()"
            />
            <Icon size="22" name="mdi:person-search-outline" />
          </div>
        </div>
        <div class="pb-3 mb-3 border-b border-gray-100">
          <label class="flex mb-2 text-xs" for="filter_name">
            Filter by price
          </label>

          <InputNumber
            v-model="filterData.filterPrice"
            class="w-full"
            input-id="minmax-buttons"
            mode="decimal"
            show-buttons
            :min="4"
            :step="0.5"
            :max="14.0"
            :update:model-value="setFilteredPlayers()"
          />
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
              @click.prevent="players = selectfilteredTeam($event)"
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
        <Message
          v-if="playerStore.getPlayerLastUpdatedDate"
          severity="info"
          :closable="false"
        >
          Players last updated on:
          <strong>{{
            new Date(playerStore.getPlayerLastUpdatedDate).toLocaleDateString(
              'en-GB'
            )
          }}</strong>
        </Message>
        <Message
          v-if="playerStore.getPlayerLastUpdatedDate"
          severity="warn"
          :closable="false"
        >
          Player data is pulled from fantasy football source and may not be the
          same as official data. It is to be used as a guide when picking
          players and not for score calculations
        </Message>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import '@/assets/components/filters';
</style>
