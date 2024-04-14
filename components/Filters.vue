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
          <div class="flex flex-col gap-2">
            <label class="text-xs" for="filter_name">Filter by name</label>
            <span class="flex items-center relative w-full">
              <Icon
                size="22"
                class="absolute right-3 text-surface-400"
                name="mdi:person-search-outline"
              />
              <InputText
                id="filter_name"
                v-model="filterData.filterName"
                class="!bg-surface-100 !border-none !w-full"
                placeholder="Search players..."
              />
            </span>
          </div>
        </div>
        <div class="pb-3 mb-3 border-b border-gray-100">
          <label class="flex mb-2 text-xs" for="filter_name">
            Filter by price
          </label>
          <Dropdown
            v-model="filterData.filterPrice"
            class="!bg-surface-100 !border-none !w-full"
            option-label="name"
            option-value="value"
            :options="populateFilterPrices(4.0, 14.0, 0.5)"
            :update:model-value="setFilteredPlayers()"
            placeholder="Select price..."
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
          <div class="grid grid-cols-10 gap-2.5 flex-wrap cursor-pointer">
            <button
              v-for="team in TEAM_DATA"
              :key="team.id"
              :data-teamID="team.id"
              class="icon-container"
              @click.prevent="players = selectfilteredTeam($event)"
            >
              <img
                class="w-full h-full"
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
              'en-GB',
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
