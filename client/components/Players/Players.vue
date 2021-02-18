<template>
  <div class="flex flex-col w-3/4">
    <div v-for="(playerTypes, key, index) in filteredPlayerData" :key="index">
      <h2 class="player-heading capitalize">
        {{ key }}
      </h2>
      <div
        v-if="playerTypes.length"
        class="flex justify-between mb-4 bg-white rounded-xl"
      >
        <div class="py-2 px-4 border-r border-gray-100 w-full">
          <ul class="flex flex-wrap">
            <li
              v-for="player in playerTypes"
              :key="player.id"
              class="player-row relative w-1/2 flex flex-col items-center justify-around border-b border-gray-100 text-sm cursor-pointer"
              @click.stop="showPlayerData(player.id)"
            >
              <div class="flex w-full">
                <span class="w-1/12 p-2">{{ player.id }}</span>
                <span class="w-1/12 p-2">
                  <img
                    class="w-6 h-6 rounded-full shadow-md"
                    :src="player.image"
                    :alt="player.name"
                    @error="loadFallbackImage"
                  />
                </span>
                <span class="w-2/12 p-2">{{ player.teamShort }}</span>
                <span class="w-5/12 p-2 text-center">{{ player.name }}</span>
                <span class="w-2/12 p-2">{{ player.price }}</span>
                <span
                  v-if="player.unavailableForSeason"
                  class="flex items-center text-xs w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="w-3 h-3 rounded-full flex justify-center leading-tight mr-2 bg-red-500"
                  ></span>
                  Unavailable
                </span>
                <span
                  v-if="player.isUnavailable && !player.unavailableForSeason"
                  class="flex items-center text-xs w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="w-3 h-3 rounded-full flex justify-center leading-tight mr-2 bg-yellow-400"
                  ></span>
                  Unavailable
                </span>
                <span
                  v-else-if="!player.isUnavailable"
                  class="flex items-center text-xs w-2/12 p-2"
                  :class="player.availabilityType"
                >
                  <span
                    class="w-3 h-3 rounded-full flex justify-center leading-tight mr-2 bg-green-400"
                  ></span>
                  Available
                </span>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div v-else>
        <div
          class="flex items-center p-3 mb-4 bg-blue-200 rounded-b-sm border-t-2 shadow-sm border-blue-700 text-blue-700 text-sm"
        >
          <span
            class="flex items-center justify-center bg-blue-300 w-5 h-5 mr-4 rounded-full"
          >
            <font-awesome-icon
              class="fa-xs text-blue-800"
              :icon="['fa', 'info']"
            />
          </span>
          No results for filtered
          <span class="font-bold ml-1">{{ key }}</span>
          , please adjust filters
        </div>
      </div>
    </div>
    <portal to="modals">
      <div
        class="modal flex justify-center items-center"
        :class="{
          active: modalIsActive,
        }"
        @click.self="modalIsActive = false"
      >
        <div class="modal-content px-4">
          <div class="bg-white rounded-xl p-8 lg:max-w-xl shadow-2xl">
            <div class="flex flex-row justify-between items-end">
              <h4 class="text-2xl md:text-4xl uppercase leading-none">
                {{ selectedPlayer.name }}
              </h4>
              <div>
                <img :src="selectedPlayer.image" :alt="selectedPlayer.name" />
              </div>
            </div>
            <div class="inner bg-white p-8 my-6 md:my-8 rounded-lg">
              <p class="text-base md:text-lg mb-4 leading-tight font-bold">
                To hear more from Kirk on how he can help your business save
                money please get in touch.
              </p>
              <a
                href="tel:02080661000"
                class="btn btn-secondary flex justify-center text-lg leading-tighter -mb-2px md:mb-4"
              >
                0208 066 1000
              </a>
              <a
                href="mailto:kirk@nicegroup.io"
                class="btn btn-secondary flex justify-center text-lg leading-tighter -mb-2px md:mb-4"
              >
                kirk@nicegroup.io
              </a>
              <a
                href="https://nicegroup.io"
                rel="noopener"
                target="_blank"
                class="btn btn-secondary flex justify-center text-lg leading-tighter -mb-2px md:mb-4"
              >
                nicegroup.io
              </a>
              <div class="flex flex-row mt-8 justify-center">
                <a
                  href="https://www.linkedin.com/company/nice-group-sw-ltd"
                  rel="noopener"
                  target="_blank"
                >
                  <svg
                    viewBox="0 0 100 100"
                    class="w-6 mr-2 focus:outline-none"
                  >
                    <use xlink:href="svg/sprites.svg#icon-linkedin"></use>
                  </svg>
                </a>
              </div>
            </div>
            <p class="flex justify-center text-lg">
              © 2020 Nice group (sw) ltd.
            </p>
          </div>
        </div>
      </div>
    </portal>
  </div>
</template>
<script>
import { useContext, computed, ref } from '@nuxtjs/composition-api'

export default {
  setup() {
    const { store } = useContext()
    const playerData = computed(
      () => store.getters.getPlayerData.players.players
    )
    const filteredPlayerData = computed(
      () => store.getters.getFilteredPlayerData
    )
    const selectedPlayer = ref({
      name: '',
      image: '',
    })

    const modalIsActive = ref(false)

    const loadFallbackImage = (e) => {
      e.target.src =
        'https://platform-static-files.s3.amazonaws.com/premierleague/photos/players/40x40/Photo-Missing.png'
    }

    const showPlayerData = (playerID) => {
      const player = playerData.value.filter((e) => e.id === playerID)
      selectedPlayer.value = { ...player[0] }
      modalIsActive.value = true
    }

    return {
      playerData,
      filteredPlayerData,
      loadFallbackImage,
      showPlayerData,
      selectedPlayer,
      modalIsActive,
    }
  },
}
</script>
<style lang="scss">
.modal {
  @apply inset-0;
  position: fixed;
  display: flex;
  justify-content: center;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(30, 30, 30, 0.5);
  opacity: 0;
  visibility: hidden;
  transform: scale(1.2);
  transition: visibility 0s linear 0.5s, opacity 0.5s 0s, transform 0.5s;
  z-index: 50;
  overflow-y: auto;

  &.active {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    transition: visibility 0s linear 0s, opacity 0.25s 0s, transform 0.25s;
  }
}
.player-row {
  &:hover {
    .player-news {
      @apply visible opacity-100;
    }
  }
}

.player-heading {
  @apply mb-4 text-2xl px-4;
}
</style>
