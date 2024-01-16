export default {
  root: ({ context }) => ({
    class: [
      // Font
      'font-sans leading-none',

      // Spacing
      'm-0',
      'p-3',

      // Shape
      'rounded-md',

      // Colors
      'text-surface-600 ',
      'placeholder:text-surface-400 ',
      'bg-surface-0 ',
      'border border-surface-300 ',

      // States
      {
        'hover:border-primary-500 ': !context.disabled,
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-500/50 ':
          !context.disabled,
        'opacity-60 select-none pointer-events-none cursor-default':
          context.disabled,
      },

      // Misc
      'appearance-none',
      'transition-colors duration-200',
    ],
  }),
};
