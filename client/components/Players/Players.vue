<template>
  <div class="flex flex-col w-3/4">
    <playerLoadingSkeleton v-if="isLoading"></playerLoadingSkeleton>
    <div
      v-for="(playerTypes, key, index) in filteredPlayerData"
      v-else
      :key="index"
    >
      <h2 class="capitalize player-heading">
        {{ key }}
      </h2>
      <div
        v-if="playerTypes.length"
        class="flex justify-between mb-4 bg-white rounded-sm"
      >
        <div class="w-full px-4 py-2 border-r border-gray-100">
          <ul class="flex flex-wrap">
            <li
              v-for="player in playerTypes"
              :key="player.id"
              class="relative flex flex-col items-center justify-around w-full text-sm border-b border-gray-100 cursor-pointer  player-row lg:w-1/2"
              @click.stop="showPlayerDataModal(player.id)"
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
                  class="flex items-center w-2/12 p-2 text-xs"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-red-500 rounded-full "
                  ></span>
                  Unavailable
                </span>
                <span
                  v-if="player.isUnavailable && !player.unavailableForSeason"
                  class="flex items-center w-2/12 p-2 text-xs"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-yellow-400 rounded-full "
                  ></span>
                  Unavailable
                </span>
                <span
                  v-else-if="!player.isUnavailable"
                  class="flex items-center w-2/12 p-2 text-xs"
                  :class="player.availabilityType"
                >
                  <span
                    class="flex justify-center w-3 h-3 mr-2 leading-tight bg-green-400 rounded-full "
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
          class="flex items-center p-3 mb-4 text-sm text-blue-700 bg-blue-100 border-t border-b border-blue-500 rounded-b-sm shadow-sm "
        >
          <span
            class="flex items-center justify-center w-5 h-5 mr-4 bg-blue-700 rounded-full "
          >
            <font-awesome-icon
              class="text-white fa-xs"
              :icon="['fa', 'info']"
            />
          </span>
          No results for filtered
          <span class="ml-1 font-bold">{{ key }}</span>
          , please adjust filters
        </div>
      </div>
    </div>
    <portal to="modals">
      <div
        class="flex items-center justify-center modal"
        :class="{
          active: modalIsActive,
        }"
        @click.self="hidePlayerDataModal"
      >
        <div v-if="selectedPlayer" class="px-4 modal--content">
          <div
            class="absolute top-0 right-0 p-12 opacity-75 cursor-pointer"
            @click="hidePlayerDataModal"
          >
            <font-awesome-icon
              class="text-white fa-3x"
              :icon="['fa', 'times']"
            />
          </div>
          <div
            class="modal--inner"
            :class="{
              'border-4 border-yellow-300':
                !selectedPlayer.unavailableForSeason &&
                selectedPlayer.isUnavailable,
              'border-4 border-red-500': selectedPlayer.unavailableForSeason,
            }"
          >
            <svg-icon
              class="w-full h-full px-2 modal--badge"
              :name="selectedPlayer.teamShort"
            />
            <div class="flex flex-row items-end justify-between">
              <div class="w-24">
                <img
                  class="rounded-full"
                  :src="selectedPlayer.imageLarge"
                  :alt="selectedPlayer.name"
                  @error="loadFallbackImage"
                />
              </div>
              <h4
                class="flex flex-col items-end text-4xl leading-none text-right uppercase "
              >
                <span class="mb-2 text-base">
                  {{ selectedPlayer.firstName }}
                </span>
                {{ selectedPlayer.secondName }}
              </h4>
            </div>
            <div class="mt-6 rounded-lg inner">
              <div class="flex items-end justify-between">
                <div
                  v-if="selectedPlayer.availabilityNews"
                  class="flex items-center flex-grow w-3/4 mr-4"
                >
                  <span
                    class="flex items-center justify-center w-5 h-5 mr-2 bg-gray-300 rounded-full "
                  >
                    <font-awesome-icon
                      class="text-gray-900 fa-xs"
                      :icon="['fa', 'info']"
                    />
                  </span>
                  <strong class="text-sm">
                    {{ selectedPlayer.availabilityNews }}
                  </strong>
                </div>
                <ul class="flex flex-col items-end w-1/4 ml-auto">
                  <li class="flex justify-between w-full">
                    <span>Goals:</span>
                    <strong>{{ selectedPlayer.goalsScored }}</strong>
                  </li>
                  <li class="flex justify-between w-full">
                    <span>Assists:</span>
                    <strong>{{ selectedPlayer.assists }}</strong>
                  </li>
                  <li
                    v-if="
                      selectedPlayer.playerType === 1 ||
                      selectedPlayer.playerType === 2
                    "
                    class="flex justify-between w-full"
                  >
                    <span class="mr-2">Clean Sheets:</span>
                    <strong>{{ selectedPlayer.cleanSheets }}</strong>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </portal>
  </div>
</template>
<script>
import { useContext, computed, ref } from '@nuxtjs/composition-api'
import playerLoadingSkeleton from '@/components/Common/playerLoadingSkeleton'
import { loadFallbackImage } from '@/helpers/helpers'

export default {
  components: {
    playerLoadingSkeleton,
  },
  setup() {
    const { store } = useContext()
    const playerData = computed(
      () => store.getters.getPlayerData.players.players
    )
    const filteredPlayerData = computed(
      () => store.getters.getFilteredPlayerData
    )
    const selectedPlayer = ref(null)
    const modalIsActive = ref(false)
    const isLoading = computed(() => store.getters.isLoading)

    const showPlayerDataModal = (playerID) => {
      const player = playerData.value.filter((e) => e.id === playerID)
      selectedPlayer.value = { ...player[0] }
      modalIsActive.value = true
      document.querySelector('body').classList.add('overflow-hidden')
    }

    const hidePlayerDataModal = () => {
      modalIsActive.value = false
      document.querySelector('body').classList.remove('overflow-hidden')
    }

    return {
      playerData,
      filteredPlayerData,
      loadFallbackImage,
      showPlayerDataModal,
      hidePlayerDataModal,
      selectedPlayer,
      modalIsActive,
      isLoading,
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
  transform: scale(1.5);
  transition: visibility 0s linear 0.25s, opacity 0.25s 0s, transform 0.25s;
  z-index: 50;
  overflow-y: auto;

  &.active {
    opacity: 1;
    visibility: visible;
    transform: scale(1);
    transition: visibility 0s linear 0s, opacity 0.25s 0s, transform 0.25s;
  }

  .modal--inner {
    @apply bg-white rounded-xl p-8 shadow-2xl relative overflow-hidden z-10;
    width: 36rem;
  }

  .modal--badge {
    position: absolute;
    width: 500px;
    height: 500px;
    opacity: 0.1;
    left: -20%;
    top: 50%;
    transform: translateY(-50%);
    z-index: -1;
    pointer-events: none;
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
