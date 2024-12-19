<script setup>
import { TEAM_DATA } from '@/logic/teams/constants';

const {
  filterData,
  playerStore,
  selectfilteredTeam,
  setFilteredPlayers,
  resetFilteredTeams
} = useFilters();

const players = defineModel('players');
</script>

<template>
  <div class="filter-container">
    <div class="hidden cursor-pointer flex-row items-center justify-between p-4 xl:mb-4 xl:flex xl:p-0">
      <h2 class="main-heading !mb-0 !text-xl">Filters</h2>
    </div>
    <div class="mb-4 justify-between rounded-sm bg-white lg:bg-transparent xl:block">
      <div class="bg-white md:p-4 xl:mb-4">
        <div class="mb-3 border-b border-gray-100 pb-3">
          <div class="flex flex-col gap-2">
            <label class="text-xs" for="filter_name">Filter by name</label>
            <span class="relative flex w-full items-center">
              <Icon size="22" class="text-surface-400 absolute right-3" name="mdi:person-search-outline" />
              <InputText id="filter_name" v-model="filterData.filterName" class="!bg-surface-100 !w-full !border-none"
                placeholder="Search players..." />
            </span>
          </div>
        </div>
        <div class="mb-3 border-b border-gray-100 pb-3">
          <label class="mb-2 flex text-xs" for="filter_name">
            Filter by price
          </label>
          <Select v-model="filterData.filterPrice" class="!bg-surface-100 !w-full !border-none" option-label="name"
            option-value="value" :options="populateFilterPrices(4.0, 14.0, 0.5)"
            :update:model-value="setFilteredPlayers()" placeholder="Select price..." />
        </div>
        <div class="border-gray-100 max-xl:border-b max-xl:pb-3">
          <label class="mb-4 flex w-full justify-between text-xs" for="filter_name">
            Filter by team
            <button title="reset team selection" @click="resetFilteredTeams">
              <Icon size="20" name="carbon:reset" />
            </button>
          </label>
          <div class="grid cursor-pointer grid-cols-10 flex-wrap gap-2.5">
            <button v-for="team in TEAM_DATA" :key="team.id" :data-teamID="team.id" class="icon-container"
              @click.prevent="players = selectfilteredTeam($event)">
              <img class="h-full w-full" :src="getImageUrl(team.short_name.toLowerCase())" />
            </button>
          </div>
        </div>
      </div>
      <div>
        <Message class="mb-2.5" v-if="playerStore.getPlayerLastUpdatedDate" severity="info" size="small">
          <template #icon>
            <Icon class="flex-shrink-0" size="22" name="mdi:information" />
          </template>
          Players last updated on:
          <strong>{{
            new Date(playerStore.getPlayerLastUpdatedDate).toLocaleDateString(
              'en-GB'
            )
          }}</strong>
        </Message>
        <Message v-if="playerStore.getPlayerLastUpdatedDate" size="small" severity="warn">
          <template #icon>
            <Icon class="flex-shrink-0" size="22" name="mdi:warning" />
          </template>
          Player data is pulled from fantasy football source and may not be the
          same as official data. It is to be used as a guide when picking
          players and not for score calculations
        </Message>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/filters';
</style>
