<template>
  <DraftedTeams column-class="w-1/4" :dynamic-view="false"></DraftedTeams>
</template>

<script>
import { useContext, computed } from '@nuxtjs/composition-api'
import { loadFallbackImage } from '@/helpers/helpers'
import DraftedTeams from '@/components/DraftedTeams/DraftedTeams.vue'

export default {
  setup() {
    const { store } = useContext()
    const draftedTeamData = computed(
      () => store.getters['drafted-data/getDraftedTeams']
    )

    return {
      DraftedTeams,
      draftedTeamData,
      loadFallbackImage,
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
