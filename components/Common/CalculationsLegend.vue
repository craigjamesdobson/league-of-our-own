<template>
  <div class="grid grid-cols-2 gap-2.5 px-5 pb-5 justify-center">
    <div class="flex gap-2.5 items-end">
      <div class="h-5 w-5 bg-yellow-200" />
      <p class="text-xs">
        Selected week transfer
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <div class="h-5 w-5 bg-green-200" />
      <p class="text-xs">
        Previous week transfer
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center"
        size="22"
        name="mage:goals"
      />
      <p class="text-xs">
        Goals scored
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center"
        size="20"
        name="icon-park-outline:soccer-one"
      />
      <p class="text-xs">
        Assists made
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center"
        size="20"
        name="oi:shield"
      />
      <p class="text-xs">
        Clean sheet
      </p>
    </div>
    <div class="flex gap-2.5 items-end">
      <Icon
        class="text-surface-600 flex items-end justify-center"
        size="20"
        name="gravity-ui:square-exclamation"
      />
      <p class="text-xs">
        Sent off
      </p>
    </div>
  </div>
</template>
