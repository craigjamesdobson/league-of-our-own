<script lang="ts" setup>
import { TEAM_DATA } from '@/logic/teams/constants';
import { populateFilterPrices } from '@/utils/filters';
import { getImageUrl } from '@/utils/images';

const {
  filterData,
  playerStore,
  selectfilteredTeam,
  setFilteredPlayers,
  resetFilteredTeams,
} = useFilters();
</script>

<template>
  <div class="filter-container">
    <div class="hidden cursor-pointer flex-row items-center justify-between p-4 xl:mb-4 xl:flex xl:p-0">
      <h2 class="main-heading !mb-0 !text-xl">
        Filters
      </h2>
    </div>
    <div class="mb-4 justify-between rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:border-0 lg:bg-transparent lg:shadow-none lg:dark:bg-transparent xl:block">
      <div class="bg-white dark:bg-slate-900 md:p-4 xl:mb-4">
        <div class="mb-3 border-b border-gray-100 pb-3 dark:border-slate-800">
          <div class="flex flex-col gap-2">
            <label
              class="text-xs text-slate-600 dark:text-slate-300"
              for="filter_name"
            >Filter by name</label>
            <span class="relative flex w-full items-center">
              <Icon
                size="22"
                class="absolute right-3 text-slate-400"
                name="mdi:person-search-outline"
              />
              <UInput
                id="filter_name"
                v-model="filterData.filterName"
                class="w-full"
                placeholder="Search players..."
              />
            </span>
          </div>
        </div>
        <div class="mb-3 border-b border-gray-100 pb-3 dark:border-slate-800">
          <label
            class="mb-2 flex text-xs text-slate-600 dark:text-slate-300"
            for="filter_name"
          >
            Filter by price
          </label>
          <USelectMenu
            v-model="filterData.filterPrice"
            class="w-full"
            label-key="name"
            value-key="value"
            :items="populateFilterPrices()"
            placeholder="Select price..."
            @update:model-value="setFilteredPlayers"
          />
        </div>
        <div class="border-gray-100 max-xl:border-b max-xl:pb-3 dark:border-slate-800">
          <label
            class="mb-4 flex w-full items-center justify-between text-xs text-slate-600 dark:text-slate-300"
            for="filter_name"
          >
            Filter by team
            <UButton
              icon="carbon:reset"
              color="neutral"
              variant="ghost"
              size="xs"
              square
              title="reset team selection"
              aria-label="Reset team selection"
              @click="resetFilteredTeams"
            />
          </label>
          <div class="grid cursor-pointer grid-cols-10 flex-wrap gap-2.5">
            <UButton
              v-for="team in TEAM_DATA"
              :key="team.id"
              :data-teamID="team.id"
              color="neutral"
              variant="ghost"
              square
              :aria-label="`Filter by ${team.name}`"
              class="icon-container p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              @click.prevent="selectfilteredTeam($event)"
            >
              <img
                class="h-full w-full"
                :src="getImageUrl(team.short_name.toLowerCase())"
                :alt="team.name"
              >
            </UButton>
          </div>
        </div>
      </div>
      <div>
        <UAlert
          v-if="playerStore.getPlayerLastUpdatedDate"
          class="mb-2.5"
          color="info"
          variant="soft"
          icon="mdi:information"
        >
          <template #description>
            Players last updated on:
            <strong>{{
              new Date(playerStore.getPlayerLastUpdatedDate).toLocaleDateString(
                'en-GB',
              )
            }}</strong>
          </template>
        </UAlert>
        <UAlert
          v-if="playerStore.getPlayerLastUpdatedDate"
          color="warning"
          variant="soft"
          icon="mdi:warning"
        >
          <template #description>
            Player data is pulled from fantasy football source and may not be the
            same as official data. It is to be used as a guide when picking
            players and not for score calculations
          </template>
        </UAlert>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/styles/filters';
</style>
