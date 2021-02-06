<template>
  <div>
    <h1>Teams</h1>
    <ul>
      <li v-for="team in teams" :key="team.id">{{ team.name }}</li>
    </ul>
  </div>
</template>

<script>
import teamsJson from '@/static/teams.json'
import { reactive } from '@nuxtjs/composition-api'

export default {
  setup() {
    const teams = reactive(teamsJson)

    return {
      teams,
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
