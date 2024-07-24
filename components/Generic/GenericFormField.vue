<template>
  <div class="relative mb-2 flex flex-col">
    <label v-if="label" class="mb-2 text-xs" :for="label">{{ label }}</label>
    <div class="relative flex flex-col">
      <Icon
        v-if="icon"
        class="text-primary absolute left-4 top-3"
        :class="{
          'text-red-500': validation.$dirty && validation?.$error,
          'border-green-400 text-green-500': validation.$dirty && !validation?.$invalid
        }"
        :name="icon"
      />
      <input
        :id="label"
        v-model="modelValue"
        :class="{
          'rounded-b-none border !border-red-500': validation.$dirty && validation?.$error,
          'border !border-green-400 ': validation.$dirty && !validation?.$invalid,
          'pl-10 ': !!icon
        }"
        class="border-surface-300 rounded-md border bg-white px-4 py-2 focus:outline-none"
        :type="type"
        autocomplete="chrome-off"
        @change="validation?.$touch"
      />
    </div>
    <div
      v-if="validation.$error"
      class="flex rounded-b-md bg-red-600 px-2 py-1"
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
    default: ''
  },
  type: {
    type: String,
    default: ''
  },
  validation: {
    type: Object,
    default: () => {}
  },
  icon: {
    type: String,
    default: ''
  }
});

const modelValue = defineModel('modelValue');
</script>

<style scoped></style>
