<template>
  <DataTable
    v-model:filters="filters"
    pt:table-container:class="h-[320px] items-start bg-white"
    :value="filteredPlayers?.sort((a, b) => a.position - b.position)"
    :global-filter-fields="['web_name']"
    paginator
    :rows="5"
  >
    <template #header>
      <div class="flex flex-wrap gap-5 justify-between p-2.5 items-center uppercase">
        <div class="flex justify-end">
          <IconField>
            <InputIcon>
              <Icon
                size="16"
                name="tabler:search"
              />
            </InputIcon>
            <InputText
              v-model="filters['global'].value"
              placeholder="Player Search"
            />
          </IconField>
        </div>
        <div class="flex items-center gap-2.5">
          <span class="mr-5">Filter by position:</span>
          <template
            v-for="position in playerPositions"
            :key="position.value"
          >
            <Button
              :title="position.key"
              rounded
              :outlined="!position.selected"
              :label="position.key"
              @click="filterByPosition(position.value)"
            >
              <Icon
                :name="position.icon"
                size="22"
              />
            </Button>
          </template>
        </div>
      </div>
    </template>
    <Column
      class="w-[25%]"
      field="web_name"
      header="Player"
    />
    <Column
      class="w-[15%]"
      header="Goals"
    >
      <template #body="slotProps">
        <input
          v-model="slotProps.data.week_goals"
          class="w-16 rounded border p-1"
          type="number"
          min="0"
          :class="{
            'bg-green-500 text-white': slotProps.data.week_goals > 0,
          }"
          @click="calculatePlayerPoints(slotProps.data)"
        >
      </template>
    </Column>
    <Column
      class="w-[15%]"
      header="Assists"
    >
      <template #body="slotProps">
        <input
          v-model="slotProps.data.week_assists"
          class="w-16 rounded border p-1"
          type="number"
          min="0"
          :class="{
            'bg-green-500 text-white': slotProps.data.week_assists > 0,
          }"
          @click="calculatePlayerPoints(slotProps.data)"
        >
      </template>
    </Column>
    <Column
      class="w-[15%]"
      header="Clean sheet"
    >
      <template #body="slotProps">
        <Checkbox
          v-model="slotProps.data.week_cleansheet"
          :disabled="disableCleansheet || slotProps.data.position > 2"
          :binary="true"
          @change="calculatePlayerPoints(slotProps.data)"
        />
      </template>
    </Column>
    <Column
      class="w-[15%]"
      header="Red card"
    >
      <template #body="slotProps">
        <Checkbox
          v-model="slotProps.data.week_redcard"
          :pt-options="{ mergeProps: true }"
          :pt:box:class="{
            '!bg-red-600 border-red-600': slotProps.data.week_redcard,
            'peer-hover:!border-red-600': true,
          }"
          :binary="true"
          @change="calculatePlayerPoints(slotProps.data)"
        />
      </template>
    </Column>
    <Column
      class="w-[15%]"
      field="week_points"
      header="Points"
    />
  </DataTable>
</template>

<script setup lang="ts">
import { FilterMatchMode } from '@primevue/core/api';
import { calculatePlayerPoints } from '~/logic/fixtures';
import type { PlayerWithStats } from '~/types/Player';

const players = defineModel<PlayerWithStats[]>('players');

const filteredPlayers = ref(players.value);

const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

const filterByPosition = (position: number) => {
  const isAlreadySelected = playerPositions.value.some(pos => pos.selected && pos.value === position);

  if (isAlreadySelected) {
    // Clear selection and reset filteredPlayers to all players
    playerPositions.value.forEach(pos => pos.selected = false);
    filteredPlayers.value = players.value;
  }
  else {
    // Set selected position and filter players
    playerPositions.value.forEach((pos) => {
      pos.selected = pos.value === position;
    });
    filteredPlayers.value = players.value?.filter(player => player.position === position);
  }
};

const { disableCleansheet } = defineProps<{
  disableCleansheet: boolean;
}>();

const playerPositions = ref([
  { key: 'GOALKEEPER', value: 1, selected: false, icon: 'tabler:hand-stop' },
  { key: 'DEFENDER', value: 2, selected: false, icon: 'tabler:shield' },
  { key: 'MIDFIELDER', value: 3, selected: false, icon: 'ph:brain-duotone' },
  { key: 'FORWARD', value: 4, selected: false, icon: 'mage:goals' },
]);
</script>
