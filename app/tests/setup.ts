import { createApp } from 'vue';

/**
 * Official Vue testing helper for testing composables
 * From Vue.js documentation: https://vuejs.org/guide/scaling-up/testing.html
 *
 * This helper creates a real Vue app instance to test composables
 * within a proper Vue context, providing real reactivity behavior.
 */
export function withSetup<T>(composable: () => T): [T, ReturnType<typeof createApp>] {
  let result: T;
  const app = createApp({
    setup() {
      result = composable();
      // Suppress missing template warning
      return () => {};
    },
  });
  app.mount(document.createElement('div'));

  // Return the result and the app instance
  // App instance allows for cleanup via app.unmount()
  return [result!, app];
}
