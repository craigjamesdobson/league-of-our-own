<script setup lang="ts">
import type {
  CompleteDraftedPlayer,
  DraftedTransfer,
} from '@/logic/drafted-teams/interfaces/DraftedTeamData';

const props = defineProps({
  draftedPlayer: {
    type: Object as PropType<CompleteDraftedPlayer | DraftedTransfer>,
    default: null,
  },
  isEditable: { type: Boolean, default: false },
  modelValue: { type: Number, default: null },
});

const emit = defineEmits(['update:modelValue']);

const handleModelEmit = (value: any) => {
  emit('update:modelValue', value);
};
</script>

<template>
  <div
    class="flex items-center w-full border-b border-gray-100"
    :class="{
      'opacity-25': props.draftedPlayer?.unavailableForSeason,
    }"
  >
    <input
      v-if="props.isEditable"
      type="text"
      class="w-1/12 p-2"
      :value="props.modelValue"
      @input="handleModelEmit"
    />
    <span v-else class="w-1/12 p-2">{{ props.draftedPlayer?.id }}</span>
    <span class="w-2/12 p-2">
      <img
        class="w-6 h-6 m-auto rounded-full shadow-md"
        :src="props.draftedPlayer?.image"
        :alt="props.draftedPlayer?.webName"
        @error="loadPlayerFallbackImage"
      />
    </span>
    <span class="w-2/12 p-2">{{ props.draftedPlayer?.teamNameShort }}</span>
    <span class="w-5/12 p-2 text-sm text-center">{{
      props.draftedPlayer?.webName
    }}</span>
    <span class="w-2/12 p-2 text-center">
      {{ props.draftedPlayer?.price }}
    </span>
  </div>
</template>

<style scoped></style>
