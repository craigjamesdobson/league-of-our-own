<template>
  <div class="relative flex flex-col mb-2">
    <label
      class="mb-2 text-xs"
      :for="label"
    >{{ label }}</label>
    <div class="relative flex flex-col">
      <Icon
        class="absolute text-primary left-4 top-3"
        :class="{
          'text-red-500': validation?.$error,
          'border-green-400 text-green-500': !validation?.$invalid,
        }"
        :name="icon"
      />
      <input
        :id="label"
        :v-model="modelValue"
        :class="{
          'border !border-red-500 rounded-b-none': validation?.$error,
          'border !border-green-400 ': !validation?.$invalid,
        }"
        class="p-2 pl-10 bg-white border rounded-md border-primary focus:outline-none"
        :type="fieldType"
        autocomplete="chrome-off"
        @change="validation?.$touch"
        @input="$emit('update:modelValue', $event?.target?.value)"
      >
      <button
        v-if="label === 'Password'"
        @click.prevent="fieldType = fieldType === 'password' ? 'text' : 'password'"
      >
        <Icon
          class="absolute text-primary right-4 top-3"
          :name="fieldType === 'password' ? 'bx:show' : 'clarity:eye-hide-solid'"
        />
      </button>
    </div>
    <div
      v-if="validation.$error"
      class="flex px-2 py-1 bg-red-600 rounded-b-md"
    >
      <span
        v-for="error in validation.$errors"
        :key="error.$uid"
        class="text-xs text-white"
      >{{ error.$message }}</span>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  modelValue: String,
  validation: Object,
  icon: String,
});

const fieldType = ref(props.label.toLowerCase());

defineEmits(['update:modelValue']);
</script>

<style scoped>

</style>