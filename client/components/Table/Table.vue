<template>
  <div>
    <div
      class="p-2 px-4 pb-2 mb-1 font-bold bg-white border-b-2 rounded-sm rounded-t  custom-table-grid border-primary"
    >
      <span>POS</span>
      <span>PREVIOUS WEEK</span>
      <span>TEAM</span>
      <span>GOALS</span>
      <span>ASSISTS</span>
      <span>CLEAN SHEETS</span>
      <span>RED CARDS</span>
      <span>WEEK POINTS</span>
      <span>TOTAL POINTS</span>
    </div>
    <div
      v-for="(team, index) in draftedTeamData"
      :key="team.id"
      class="p-2 px-4 mb-1 bg-white border-b border-gray-100 rounded-sm  custom-table-grid last:mb-0"
    >
      <span class="flex items-center">
        <span class="w-5">{{ index + 1 }}</span>
        <span v-if="index + 1 > team.previousWeekPosition">
          <svg-icon
            class="w-2 h-2 ml-2 text-red-600 fill-current"
            name="icon-double-chevron-down"
          />
        </span>
        <span v-if="index + 1 < team.previousWeekPosition">
          <svg-icon
            class="w-2 h-2 ml-2 text-green-600 fill-current"
            name="icon-double-chevron-up"
          />
        </span>
        <span v-if="index + 1 == team.previousWeekPosition">
          <svg-icon
            class="w-2 h-2 ml-2 text-gray-900 fill-current"
            name="icon-dot"
          />
        </span>
      </span>
      <span>{{ team.previousWeekPosition }}</span>
      <span>{{ team.teamName }}</span>
      <span>{{ team.totalGoals }}</span>
      <span>{{ team.totalAssists }}</span>
      <span>{{ team.totalCleanSheets }}</span>
      <span>{{ team.totalRedCards }}</span>
      <span class="flex items-center">
        {{ team.activeWeekPoints }}
        <svg-icon
          v-if="team.isWeeklyWinner"
          class="w-4 h-4 ml-2 text-yellow-400 fill-current"
          name="icon-star"
        />
      </span>
      <span>{{ team.totalPoints }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    draftedTeamData: Array,
  },
  setup() {},
}
</script>

<style lang="scss" scoped>
.custom-table-grid {
  display: grid;
  grid-auto-flow: column;
  grid-auto-rows: 1fr;
  grid-template-columns: 0.8fr 0.8fr 3fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr 0.8fr;
  gap: 15px 15px;
  justify-content: center;
  align-content: space-evenly;
  width: 100%;
}
</style>
