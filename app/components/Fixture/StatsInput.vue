<template>
  <div class="rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
    <div class="flex flex-wrap items-center justify-between gap-5 border-b border-slate-200 bg-slate-50 p-2.5 uppercase dark:border-slate-700 dark:bg-slate-800">
      <UInput
        v-model="searchTerm"
        class="w-full sm:w-64"
        icon="tabler:search"
        placeholder="Player Search"
      />
      <div class="flex flex-wrap items-center gap-2.5">
        <span class="mr-2 text-sm text-slate-600 dark:text-slate-300">Filter by position:</span>
        <UButton
          v-for="position in playerPositions"
          :key="position.value"
          :title="position.key"
          :label="position.key"
          :icon="position.icon"
          :variant="selectedPosition === position.value ? 'solid' : 'outline'"
          color="primary"
          size="sm"
          @click="filterByPosition(position.value)"
        />
      </div>
    </div>

    <div class="max-h-[320px] overflow-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
        <thead class="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-200">
          <tr>
            <th class="w-[25%] px-3 py-2">
              Player
            </th>
            <th class="w-[15%] px-3 py-2">
              <UTooltip text="Goals scored by this player in the fixture">
                <span>Goals</span>
              </UTooltip>
            </th>
            <th class="w-[15%] px-3 py-2">
              <UTooltip text="Assists made by this player in the fixture">
                <span>Assists</span>
              </UTooltip>
            </th>
            <th class="w-[15%] px-3 py-2">
              <UTooltip text="Clean sheet applies to goalkeepers and defenders when their team concedes no goals">
                <span>Clean sheet</span>
              </UTooltip>
            </th>
            <th class="w-[15%] px-3 py-2">
              <UTooltip text="Player was sent off">
                <span>Red card</span>
              </UTooltip>
            </th>
            <th class="w-[15%] px-3 py-2">
              <UTooltip text="Calculated fantasy points for this fixture">
                <span>Points</span>
              </UTooltip>
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
          <tr
            v-for="player in paginatedPlayers"
            :key="player.player_id"
            class="even:bg-slate-50/70 dark:even:bg-slate-800/50"
          >
            <td class="px-3 py-2 font-medium text-slate-900 dark:text-slate-100">
              {{ player.web_name }}
            </td>
            <td class="px-3 py-2">
              <UInputNumber
                v-model="player.week_goals"
                class="w-20"
                :min="0"
                :highlight="player.week_goals > 0"
                @update:model-value="calculatePlayerPoints(player)"
              />
            </td>
            <td class="px-3 py-2">
              <UInputNumber
                v-model="player.week_assists"
                class="w-20"
                :min="0"
                :highlight="player.week_assists > 0"
                @update:model-value="calculatePlayerPoints(player)"
              />
            </td>
            <td class="px-3 py-2">
              <UCheckbox
                v-model="player.week_cleansheet"
                :disabled="disableCleansheet || player.position > 2"
                @update:model-value="calculatePlayerPoints(player)"
              />
            </td>
            <td class="px-3 py-2">
              <UCheckbox
                v-model="player.week_redcard"
                color="error"
                @update:model-value="calculatePlayerPoints(player)"
              />
            </td>
            <td class="px-3 py-2 font-semibold text-slate-900 dark:text-slate-100">
              {{ player.week_points }}
            </td>
          </tr>
          <tr v-if="!paginatedPlayers.length">
            <td
              colspan="6"
              class="px-3 py-8 text-center text-slate-500 dark:text-slate-400"
            >
              No players found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex items-center justify-between border-t border-slate-200 bg-slate-50 p-2.5 text-sm dark:border-slate-700 dark:bg-slate-800">
      <span class="text-slate-600 dark:text-slate-300">
        {{ filteredPlayers.length }} players
      </span>
      <div class="flex items-center gap-2">
        <UButton
          icon="lucide:chevron-left"
          color="neutral"
          variant="outline"
          size="xs"
          :disabled="currentPage === 1"
          aria-label="Previous page"
          @click="currentPage--"
        />
        <span class="text-slate-600 dark:text-slate-300">Page {{ currentPage }} of {{ totalPages }}</span>
        <UButton
          icon="lucide:chevron-right"
          color="neutral"
          variant="outline"
          size="xs"
          :disabled="currentPage === totalPages"
          aria-label="Next page"
          @click="currentPage++"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { calculatePlayerPoints } from '~/logic/fixtures';
import type { PlayerWithStats } from '~/types/Player';

const players = defineModel<PlayerWithStats[]>('players');

const searchTerm = ref('');
const selectedPosition = ref<number | null>(null);
const currentPage = ref(1);
const rowsPerPage = 5;

const sortedPlayers = computed(() => {
  return [...(players.value || [])].sort((a, b) => a.position - b.position);
});

const filteredPlayers = computed(() => {
  const search = searchTerm.value.trim().toLowerCase();

  return sortedPlayers.value.filter((player) => {
    const matchesSearch = !search || player.web_name?.toLowerCase().includes(search);
    const matchesPosition = selectedPosition.value === null || player.position === selectedPosition.value;

    return matchesSearch && matchesPosition;
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(filteredPlayers.value.length / rowsPerPage)));

const paginatedPlayers = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage;
  return filteredPlayers.value.slice(start, start + rowsPerPage);
});

const filterByPosition = (position: number) => {
  selectedPosition.value = selectedPosition.value === position ? null : position;
};

const { disableCleansheet } = defineProps<{
  disableCleansheet: boolean;
}>();

const playerPositions = [
  { key: 'GOALKEEPER', value: 1, icon: 'tabler:hand-stop' },
  { key: 'DEFENDER', value: 2, icon: 'tabler:shield' },
  { key: 'MIDFIELDER', value: 3, icon: 'ph:brain-duotone' },
  { key: 'FORWARD', value: 4, icon: 'mage:goals' },
];

watch([searchTerm, selectedPosition], () => {
  currentPage.value = 1;
});

watch(filteredPlayers, () => {
  if (currentPage.value > totalPages.value) {
    currentPage.value = totalPages.value;
  }
});
</script>
