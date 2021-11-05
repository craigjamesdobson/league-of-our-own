<template>
  <div class="flex flex-col">
    <div class="flex justify-between my-4">
      <button
        v-for="index in 38"
        :key="index"
        class="
          w-10
          h-10
          border
          rounded-sm
          border-primary
          hover:bg-primary hover:text-white
        "
        :class="{
          'bg-primary text-white': index === selectedGameweek
        }"
        @click="selectedGameweek = index"
      >
        {{ index }}
      </button>
    </div>
    <div
      role="alert"
      class="
        flex flex-col
        self-start
        w-full
        px-4
        py-3
        mb-4
        text-blue-700
        bg-blue-100
        border-t border-b border-blue-500
      "
    >
      <p class="text-sm uppercase">
        Please select a gameweek to view weekly table
      </p>
    </div>
    <Table :drafted-team-data="draftedTeamData"></Table>
  </div>
</template>

<script>
import { computed, ref, useStore } from '@nuxtjs/composition-api'
import Table from '@/components/Table/Table.vue'

export default {
  components: {
    Table
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
  }
}
</script>
