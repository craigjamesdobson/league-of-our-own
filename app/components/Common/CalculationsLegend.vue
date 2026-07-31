<template>
  <div class="grid grid-cols-2 gap-2.5 px-5 pb-5 pt-4 justify-center text-slate-900 dark:text-slate-100">
    <div class="flex gap-2.5 items-end">
      <div class="h-5 w-5 bg-yellow-200 dark:bg-yellow-950/70" />
      <p class="text-xs">
        Selected week transfer
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <div class="h-5 w-5 bg-green-200 dark:bg-green-950/70" />
      <p class="text-xs">
        Previous week transfer
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center dark:text-slate-300"
        size="22"
        name="mage:goals"
      />
      <p class="text-xs">
        Goals scored
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center dark:text-slate-300"
        size="20"
        name="icon-park-outline:soccer-one"
      />
      <p class="text-xs">
        Assists made
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center dark:text-slate-300"
        size="20"
        name="oi:shield"
      />
      <p class="text-xs">
        Clean sheet
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center dark:text-slate-300"
        size="20"
        name="gravity-ui:square-exclamation"
      />
      <p class="text-xs">
        Sent off
      </p>
    </div>
  </div>
</template>
