export default defineNuxtPlugin(() => {
    addRouteMiddleware('global-middleware', (to, from) => {
        if (to.path !== '/') {
            return navigateTo('/');
        }
    },
        { global: true }
    )
})