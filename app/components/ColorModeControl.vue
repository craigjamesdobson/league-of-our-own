<script setup lang="ts">
const props = withDefaults(defineProps<{
  collapsed?: boolean;
}>(), {
  collapsed: false,
});

type ColorModePreference = 'system' | 'light' | 'dark';

const colorMode = useColorMode();

const modes: Array<{
  label: string;
  value: ColorModePreference;
  icon: string;
}> = [
  { label: 'System', value: 'system', icon: 'i-lucide-monitor' },
  { label: 'Light', value: 'light', icon: 'i-lucide-sun' },
  { label: 'Dark', value: 'dark', icon: 'i-lucide-moon' },
];

const fallbackMode = modes[0]!;
const activeMode = computed(() => modes.find(mode => mode.value === colorMode.preference) ?? fallbackMode);

const modeItems = computed(() =>
  modes.map(mode => ({
    label: mode.label,
    icon: mode.icon,
    type: 'checkbox' as const,
    checked: colorMode.preference === mode.value,
    onSelect: () => {
      colorMode.preference = mode.value;
    },
  })),
);

const buttonUi = computed(() => ({
  base: props.collapsed
    ? 'grid h-12 w-12 place-items-center p-0'
    : 'min-h-12 w-full justify-start overflow-hidden px-3',
  leadingIcon: 'size-5 text-current',
  label: 'truncate text-sm font-medium',
}));
</script>

<template>
  <UTooltip
    class="w-full"
    :text="`Theme: ${activeMode.label}`"
  >
    <UDropdownMenu
      class="w-full"
      :items="modeItems"
      :content="{ side: 'top', align: 'center', sideOffset: 8 }"
      :ui="{ content: 'min-w-36' }"
    >
      <UButton
        :icon="activeMode.icon"
        :label="collapsed ? undefined : `Theme: ${activeMode.label}`"
        :aria-label="`Theme: ${activeMode.label}`"
        color="neutral"
        variant="ghost"
        :square="collapsed"
        class="rounded-lg text-slate-200 hover:bg-white/10 hover:text-white"
        :ui="buttonUi"
      />
    </UDropdownMenu>
  </UTooltip>
</template>
