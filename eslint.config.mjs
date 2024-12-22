import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: true,
    },
  },
}).prepend(
  {
    ignores: [
      'tailwind.config.ts',
    ],
  }).override('nuxt/vue/rules', {
  rules: {
    'vue/multi-word-component-names': 'off',
  },
});
