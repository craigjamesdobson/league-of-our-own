<template>
  <div class="flex flex-row flex-wrap">
    <h1 class="flex w-full">Teams</h1>
    <template v-if="draftedTeamData.length">
      <div
        v-for="team in draftedTeamData"
        :key="team.id"
        class="flex flex-col"
        :class="columnClass"
      >
        <DraftedTeam
          :key="team.id"
          :team="team"
          :fixture-week="fixtureWeek"
          :dynamic-view="dynamicView"
        ></DraftedTeam>
      </div>
    </template>
    <playerLoadingSkeleton v-else></playerLoadingSkeleton>
  </div>
</template>

<script>
import { useContext, computed, ref } from '@nuxtjs/composition-api'
import DraftedTeam from '@/components/DraftedTeams/DraftedTeam.vue'
import playerLoadingSkeleton from '@/components/Common/playerLoadingSkeleton'

export default {
  components: {
    DraftedTeam,
    playerLoadingSkeleton,
  },
  props: {
    columnClass: {
      type: String,
      required: true,
    },
    fixtureWeek: {
      type: Number,
      default: 0,
    },
    dynamicView: Boolean,
  },
  setup(props) {
    const { store } = useContext()
    const draftedTeamData = computed(
      () => store.getters['drafted-data/getDraftedTeams']
    )

    return {
      draftedTeamData,
      props,
    }
  },
}
</script>

<style lang="scss">
.transferred-player {
  &:hover {
    .old-transfer {
      display: flex;
    }
  }
}
</style>
