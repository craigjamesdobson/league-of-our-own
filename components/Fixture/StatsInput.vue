<template>
  <DataTable pt:tableContainer:class="h-[320px] justify-start bg-white"
    :value="filteredPlayers?.sort((a, b) => a.position - b.position)" paginator :rows="5">
    <template #header>
      <div class="flex gap-2.5 justify-end p-2.5 items-center uppercase">
        <span class="mr-5">Filter by position:</span>
        <template v-for="position in playerPositions">
          <Button @click="filterByPosition(position.value)" :title="position.key" rounded :outlined="!position.selected"
            :label="position.key" >
            <Icon :name="position.icon" size="22" />
        </Button>
        </template>
      </div>
    </template>
    <Column class="w-[20%]" field="web_name" header="Player" />
    <Column class="w-[10%]" header="Goals">
      <template #body="slotProps">
        <input v-model="slotProps.data.week_goals" class="w-16 rounded border p-1" type="number" min="0" :class="{
          'bg-green-500 text-white': slotProps.data.week_goals > 0,
        }" @click="calculatePlayerPoints(slotProps.data)">
      </template>
    </Column>
    <Column class="w-[10%]" header="Assists">
      <template #body="slotProps">
        <input v-model="slotProps.data.week_assists" class="w-16 rounded border p-1" type="number" min="0" :class="{
          'bg-green-500 text-white': slotProps.data.week_assists > 0,
        }" @click="calculatePlayerPoints(slotProps.data)">
      </template>
    </Column>
    <Column class="w-[10%]" header="Clean sheet">
      <template #body="slotProps">
        <Checkbox v-model="slotProps.data.week_cleansheet" :disabled="disableCleansheet" :binary="true"
          @change="calculatePlayerPoints(slotProps.data)" />
      </template>
    </Column>
    <Column class="w-[10%]" header="Red card">
      <template #body="slotProps">
        <Checkbox v-model="slotProps.data.week_redcard" :pt-options="{ mergeProps: true }" :pt:box:class="{
          '!bg-red-600 border-red-600': slotProps.data.week_redcard,
          'peer-hover:!border-red-600': true,
        }" :binary="true" @change="calculatePlayerPoints(slotProps.data)" />
      </template>
    </Column>
    <Column class="w-[10%]" field="week_points" header="Points" />
  </DataTable>
</template>

<script setup lang="ts">
import { calculatePlayerPoints } from '~/logic/fixtures';
import type { PlayerWithStats } from '~/types/Player';

const players = defineModel<PlayerWithStats[]>('players');

const filteredPlayers = ref(players.value);

const filterByPosition = (position: number) => {
  playerPositions.value.forEach((pos) => {
    pos.selected = pos.value === position;
  });
  filteredPlayers.value = players.value.filter((player) => player.position === position);
};

const { disableCleansheet } = defineProps<{
  disableCleansheet: boolean;
}>();

const playerPositions = ref([
  { key: 'GOALKEEPER', value: 1, selected: false, icon: 'tabler:hand-stop' },
  { key: 'DEFENDER', value: 2, selected: false, icon: 'tabler:shield' },
  { key: 'MIDFIELDER', value: 3, selected: false, icon: 'ph:brain-duotone' },
  { key: 'FORWARD', value: 4, selected: false, icon: 'mage:goals' }
]);
</script>
