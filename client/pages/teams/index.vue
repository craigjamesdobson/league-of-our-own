<template>
  <div class="flex flex-col">
    <h1>Teams</h1>
    <ul>
      <li v-for="team in draftedTeamData" :key="team.id">
        {{ team.teamName }}
      </li>
    </ul>
  </div>
</template>

<script>
import { useContext, computed } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { store } = useContext()
    const draftedTeamData = computed(() => store.getters.getDraftedTeams)

    return {
      draftedTeamData,
    }
  },
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
