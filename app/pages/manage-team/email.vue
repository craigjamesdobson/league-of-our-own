<script setup lang="ts">
import TransferEmailInstructions from '~/components/TransferEmailInstructions.vue';

const { onlineTransferRequestsEnabled } = useAppSettings();
</script>

<template>
  <TransferEmailInstructions :show-back-link="onlineTransferRequestsEnabled" />
</template>
