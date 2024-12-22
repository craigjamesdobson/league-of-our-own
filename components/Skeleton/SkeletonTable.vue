<script lang="ts" setup>
const loadingData = ref(new Array(20));
</script>

<template>
  <DataTable :value="loadingData">
    <Column
      field="code"
      header="Pos"
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
    <Column
      field="name"
      header="Prv Pos."
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
    <Column
      field="category"
      header="Team"
    >
      <template #body>
        <Skeleton class="mb-2.5 h-5 w-11/12" />
      </template>
    </Column>
    <Column
      field="quantity"
      header="Goals"
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
    <Column
      field="quantity"
      header="Assists"
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
    <Column
      field="quantity"
      header="CS."
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
    <Column
      field="quantity"
      header="RC"
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
    <Column
      field="quantity"
      header="Wk Pts."
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
    <Column
      field="quantity"
      header="Tot Pts."
    >
      <template #body>
        <Skeleton class="h-5 w-1/12" />
      </template>
    </Column>
  </DataTable>
</template>
