<template>
  <DataTable :value="new Array(8)">
    <Column
      field="code"
      header="Player"
    >
      <template #body>
        <Skeleton />
      </template>
    </Column>
    <Column
      field="name"
      header="Goals"
    >
      <template #body>
        <Skeleton />
      </template>
    </Column>
    <Column
      field="category"
      header="Assists"
    >
      <template #body>
        <Skeleton />
      </template>
    </Column>
    <Column
      field="quantity"
      header="Clean sheet"
    >
      <template #body>
        <Skeleton />
      </template>
    </Column>
    <Column
      field="quantity"
      header="Red Card"
    >
      <template #body>
        <Skeleton />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts"></script>

<style scoped></style>
