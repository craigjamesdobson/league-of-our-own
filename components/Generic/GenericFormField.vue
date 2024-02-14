<template>
  <div class="relative flex flex-col mb-2">
    <label v-if="label" class="mb-2 text-xs" :for="label">{{ label }}</label>
    <div class="relative flex flex-col">
      <Icon
        v-if="icon"
        class="absolute text-primary left-4 top-3"
        :class="{
          'text-red-500': validation?.$error,
          'border-green-400 text-green-500': !validation?.$invalid,
        }"
        :name="icon"
      />
      <input
        :id="label"
        v-model="modelValue"
        :class="{
          'border !border-red-500 rounded-b-none': validation?.$error,
          'border !border-green-400 ': !validation?.$invalid,
          'pl-10 ': !!icon,
        }"
        class="px-4 py-2 bg-white border rounded-md border-primary focus:outline-none"
        :type="type"
        autocomplete="chrome-off"
        @change="validation?.$touch"
      />
    </div>
    <div
      v-if="validation.$error"
      class="flex px-2 py-1 bg-red-600 rounded-b-md"
    >
      <span
        v-for="error in validation.$errors"
        :key="error.$uid"
        class="text-xs text-white"
        >{{ error.$message }}</span
      >
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: '',
  },
  validation: {
    type: Object,
    default: () => {},
  },
  icon: {
    type: String,
    default: '',
  },
});

const modelValue = defineModel('modelValue');
</script>

<style scoped></style>
