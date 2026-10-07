<script setup lang="ts">
import OnlineTeamManagement from '~/components/OnlineTeamManagement.vue';
import TransferEmailInstructions from '~/components/TransferEmailInstructions.vue';

definePageMeta({
  key: route => route.fullPath,
});

const { onlineTransferRequestsEnabled } = useAppSettings();
</script>

<template>
  <OnlineTeamManagement v-if="onlineTransferRequestsEnabled" />
  <TransferEmailInstructions v-else />
</template>
