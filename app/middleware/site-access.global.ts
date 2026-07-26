const publicRoutes = new Set(['/coming-soon', '/account/login']);

export default defineNuxtRouteMiddleware((to) => {
  const config = useRuntimeConfig();
  const user = useSupabaseUser();

  if (config.public.SITE_OPEN) {
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
