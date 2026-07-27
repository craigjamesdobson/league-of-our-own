const publicRoutes = new Set(['/coming-soon', '/account/login']);

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser();
  const { refreshAppSettings, siteOpen } = useAppSettings();

  try {
    await refreshAppSettings();
  }
  catch {
    if (user.value) return;

    if (to.path !== '/coming-soon') {
      return navigateTo('/coming-soon');
    }

    return;
  }

  if (siteOpen.value) {
    if (to.path === '/coming-soon') {
      return navigateTo('/');
    }

    return;
  }

  if (user.value) {
    if (to.path === '/coming-soon') {
      return navigateTo('/');
    }

    return;
  }

  if (!publicRoutes.has(to.path)) {
    return navigateTo('/coming-soon');
  }
});
