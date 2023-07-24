<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { usePlayersStore } from '~~/stores/players';
const store = usePlayersStore();

const props = defineProps({
  modelValue: {
    type: Number,
    default: null,
  },
  transferStatus: {
    type: Number,
    default: 0,
  },
});

const vFocus = {
  mounted: (el: any) => el.focus(),
};

const emit = defineEmits(['update:modelValue', 'update:newTransfer']);

const handleEmit = useDebounceFn((e: any) => {
  emit('update:modelValue', +e.target.value);
}, 1000);

const handleTransferEmit = (e: any) => {
  emit('update:newTransfer', e);
};

const Id = ref(props.modelValue);

const player = computed(() => store.getPlayerByID(+Id.value));
</script>

<template v-if="player">
  <div class="flex items-center w-full border-b border-gray-100">
    <div class="flex items-center w-1/12">
      <button
        v-if="transferStatus === 0"
        class="mr-2"
        @click="handleTransferEmit(player.id)"
      >
        <Icon
          class="cursor-pointer text-primary"
          size="22"
          name="ic:round-swap-horiz"
        />
      </button>
      <Icon
        v-if="transferStatus === 1"
        class="mr-2 text-red-700"
        size="22"
        name="ic:round-keyboard-double-arrow-left"
        title="player transferred out"
      />
      <Icon
        v-if="transferStatus === 2"
        class="mr-2 text-green-700"
        size="22"
        name="ic:round-keyboard-double-arrow-right"
        title="player transferred in"
      />
    </div>
    <input
      v-focus
      :value="Id"
      type="text"
      class="w-1/12 p-2 text-center bg-transparent"
      @input="handleEmit"
    />
    <span v-if="player" class="w-2/12 p-2">
      <img
        class="w-6 h-6 m-auto rounded-full shadow-md"
        :src="player?.image"
        :alt="player?.webName"
        @error="loadPlayerFallbackImage"
      />
    </span>
    <span v-if="player" class="w-2/12 p-2">{{ player?.teamNameShort }}</span>
    <span
      v-if="player"
      class="w-4/12 p-2 text-sm text-center"
      :class="{ 'line-through': transferStatus === 1 }"
      >{{ player?.webName }}</span
    >
    <span v-if="player" class="w-2/12 p-2 text-center">
      {{ player?.price }}
    </span>
    <div v-if="!player" class="w-10/12 p-2 text-center">
      No player with that ID
    </div>
  </div>
</template>

<style scoped></style>
