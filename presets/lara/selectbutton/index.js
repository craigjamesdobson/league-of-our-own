export default {
  root: ({ props }) => ({
    class: [
      {
        'opacity-60 select-none pointer-events-none cursor-default':
          props.disabled,
      },
    ],
  }),
  button: ({ context }) => ({
    class: [
      'relative',
      // Font
      'leading-none',

      // Flex Alignment
      'inline-flex items-center align-bottom text-center',

      // Spacing
      'px-4 py-3',

      // Shape
      'border border-r-0',
      'first:rounded-l-md first:rounded-tr-none first:rounded-br-none',
      'last:border-r last:rounded-tl-none last:rounded-bl-none last:rounded-r-md',

      // Color
      {
        'bg-surface-0 ': !context.active,
        'text-surface-700 ': !context.active,
        'border-surface-200 ': !context.active,
        'bg-primary-500 ': context.active,
      },

      // States
      'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 ',
      {
        'hover:bg-surface-50  ': !context.active,
        'hover:bg-primary-600 ': context.active,
      },
      {
        'opacity-60 select-none pointer-events-none cursor-default':
          context.disabled,
      },
      // Transition
      'transition duration-200',

      // Misc
      'cursor-pointer select-none overflow-hidden',
    ],
  }),
  label: {
    class: 'font-bold',
  },
};
