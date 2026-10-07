export default defineNuxtRouteMiddleware(() => {
  const { onlineTransferRequestsEnabled } = useAppSettings();

  if (!onlineTransferRequestsEnabled.value) {
    return navigateTo('/manage-team', { replace: true });
  }
});
