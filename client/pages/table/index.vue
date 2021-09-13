<template>
  <div class="flex flex-col">
    <h1>Select a gameweek to view weekly table</h1>
    <div class="flex justify-between my-4">
      <button
        v-for="index in 38"
        :key="index"
        class="w-10 h-10 border rounded-sm  border-primary hover:bg-primary hover:text-white"
        :class="{
          'bg-primary text-white': index === selectedGameweek,
        }"
        @click="selectedGameweek = index"
      >
        {{ index }}
      </button>
    </div>
    <Table :drafted-team-data="draftedTeamData"></Table>
  </div>
</template>

<script>
import { computed, ref, useStore } from '@nuxtjs/composition-api'
import Table from '@/components/Table/Table.vue'

export default {
  components: {
    Table,
  },
  setup() {
    const store = useStore()
    const selectedGameweek = ref(1)
    let draftedTeamData = computed(() =>
      store.getters['drafted-data/getSortedTeams'](selectedGameweek)
    )

    const changeTableData = () => {
      draftedTeamData = ref(
        store.getters['drafted-data/getSortedTeams'](selectedGameweek)
      )
    }

    return { draftedTeamData, selectedGameweek, changeTableData }
  },
}
</script>
