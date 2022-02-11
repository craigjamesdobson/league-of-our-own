<template>
  <div class="p-4 m-2 bg-white rounded-sm">
    <div
      class="
        flex
        items-center
        justify-between
        p-2
        pt-0
        mb-2
        border-b border-gray-800
      "
    >
      <div class="flex flex-col">
        {{ team.teamName }}
        <span class="text-xs">{{ team.ownerName }}</span>
      </div>
      <span v-if="team.allowedTransfers">
        <svg-icon
          class="w-5 h-5"
          name="icons/icon-transfer"
          title="transfers allowed"
        />
      </span>
    </div>
    <div
      v-for="player in team.teamPlayers"
      :key="player.playerName"
      class="relative text-sm"
      :class="{
        'transferred-player': player.transfers.length,
      }"
    >
      <div
        v-if="
          !player.transfers.length ||
          player.transfers.at(-1).transferWeek > fixtureWeek
        "
        class="flex items-center w-full border-b border-gray-100"
        :class="{
          'opacity-25': player.isUnavailableForSeason,
          'bg-red-500 text-white':
            dynamicView && getPlayerGameweekData(player).sentOff,
        }"
      >
        <span class="w-1/12 p-2">{{ player.id }}</span>
        <span class="w-2/12 p-2">
          <img
            class="w-6 h-6 m-auto rounded-full shadow-md"
            :src="player.image"
            :alt="player.name"
            @error="loadFallbackImage"
          />
        </span>
        <span class="w-2/12 p-2">{{ player.teamShort }}</span>
        <span class="w-5/12 p-2 text-sm text-center">{{ player.name }}</span>
        <span v-if="dynamicView" class="w-2/12 p-2 text-center">
          {{ getPlayerGameweekData(player).points }}
        </span>
        <span v-else class="w-2/12 p-2 text-center">
          {{ player.price }}
        </span>
      </div>
      <div
        v-else
        :key="player.transfers[0].player.id"
        class="flex items-center w-full border-b border-gray-100 cursor-pointer"
        :class="
              player.transfers.at(-1).isCurrentWeekTransfer || player.transfers.at(-1).transferWeek === fixtureWeek ? 'bg-yellow-300 text-gray-800' : 'bg-green-500 text-white',
            "
      >
        <span class="w-1/12 p-2">{{ player.transfers.at(-1).player.id }}</span>
        <span class="w-2/12 p-2">
          <img
            class="w-6 h-6 m-auto rounded-full shadow-md"
            :src="player.transfers.at(-1).player.image"
            :alt="player.transfers.at(-1).player.name"
            @error="loadFallbackImage"
          />
        </span>
        <span class="w-2/12 p-2">
          {{ player.transfers.at(-1).player.teamShort }}
        </span>
        <span class="w-5/12 p-2 text-center">
          {{ player.transfers.at(-1).player.name }}
        </span>
        <span v-if="dynamicView" class="w-2/12 p-2 text-center">
          {{ getPlayerGameweekData(player.transfers.at(-1).player).points }}
        </span>
        <span v-else class="w-2/12 p-2 text-center">
          {{ player.transfers.at(-1).player.price }}
        </span>
      </div>
      <div
        v-if="
          !player.transfers.length ||
          player.transfers.at(-1).transferWeek <= fixtureWeek
        "
        class="flex flex-wrap justify-between w-full h-full"
        :class="{
          'hidden absolute top-0 z-10 bg-blue-600 text-white old-transfer hover:flex':
            player.transfers.length,
        }"
      >
        <div
          v-if="player.transfers.length === 1"
          class="
            flex
            items-center
            justify-center
            w-full
            text-center
            cursor-pointer
          "
        >
          <img
            class="w-6 h-6 mr-4 border border-white rounded-full"
            :src="player.image"
            :alt="player.name"
            @error="loadFallbackImage"
          />
          {{ player.name }} was transferred out on week
          {{ player.transfers[0].transferWeek }}
        </div>
        <div
          v-if="player.transfers.length === 2"
          class="
            flex
            items-center
            justify-center
            w-full
            text-center
            cursor-pointer
          "
        >
          <img
            class="w-6 h-6 mr-4 border border-white rounded-full"
            :src="player.transfers[0].player.image"
            :alt="player.transfers[0].player.name"
            @error="loadFallbackImage"
          />
          <template v-if="player.transfers.length > 1">
            {{ player.transfers[0].player.name }} was transferred out on week
            {{ player.transfers[1].transferWeek }}
          </template>
        </div>
      </div>
    </div>
    <div v-if="dynamicView" class="flex justify-between pt-2">
      <span>Total</span>
      <strong class="w-2/12 text-center">
        {{ getTeamGameweekData(team).points }}
      </strong>
    </div>
    <div v-else class="flex justify-between pt-2">
      <span>Total</span>
      <strong class="w-2/12 text-center">
        {{ team.totalTeamValue }}
      </strong>
    </div>
  </div>
</template>

<script>
import { loadFallbackImage } from '@/helpers/helpers'

export default {
  props: {
    team: Object,
    fixtureWeek: Number,
    dynamicView: Boolean,
  },

  setup(props) {
    const getPlayerGameweekData = (player) => {
      return player.gameWeekStats.filter(
        (x) => x.gameweek === props.fixtureWeek
      )[0]
    }

    const getTeamGameweekData = (team) => {
      return team.gameWeekStats.filter(
        (x) => x.gameweek === props.fixtureWeek
      )[0]
    }

    return {
      loadFallbackImage,
      getPlayerGameweekData,
      getTeamGameweekData,
    }
  },
}
</script>
