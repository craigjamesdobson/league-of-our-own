import { createConfigForNuxt } from '@nuxt/eslint-config/flat';

export default createConfigForNuxt({
  features: {
    stylistic: {
      semi: true,
      quotes: 'single',
      indent: 2,
      commaDangle: 'only-multiline',
    },
  },
}).prepend(
  {
    ignores: [
      'tailwind.config.ts',
      'types/database-generated.types.ts',
    ],
  }).override('nuxt/vue/rules', {
  rules: {
    'vue/multi-word-component-names': 'off',
  },
});
