<script setup lang="ts">
type ColorModePreference = 'system' | 'light' | 'dark';

const colorMode = useColorMode();

const modes: Array<{
  label: string;
  value: ColorModePreference;
  icon: string;
}> = [
  { label: 'System theme', value: 'system', icon: 'i-lucide-monitor' },
  { label: 'Light theme', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark theme', value: 'dark', icon: 'i-lucide-moon' },
];

const setMode = (mode: ColorModePreference) => {
  colorMode.preference = mode;
};
</script>

<template>
  <div class="flex items-center gap-1 rounded-full border border-white/20 bg-white/10 p-1 xl:flex-col xl:rounded-2xl">
    <UTooltip
      v-for="mode in modes"
      :key="mode.value"
      :text="mode.label"
    >
      <UButton
        :icon="mode.icon"
        :aria-label="mode.label"
        :color="colorMode.preference === mode.value ? 'neutral' : 'primary'"
        :variant="colorMode.preference === mode.value ? 'solid' : 'ghost'"
        size="xs"
        square
        class="text-white hover:bg-white hover:text-primary"
        :class="{
          '!bg-white !text-primary': colorMode.preference === mode.value,
        }"
        @click="setMode(mode.value)"
      />
    </UTooltip>
  </div>
</template>
