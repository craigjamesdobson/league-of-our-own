export default {
  root: {
    class: 'relative',
  },
  menu: {
    class: 'p-0 m-0 list-none flex',
  },
  menuitem: {
    class: [
      // Flexbox and Position
      'relative',
      'flex',
      'justify-center',
      'flex-1',
      'overflow-hidden',

      // Before
      'before:border-t',
      'before:border-surface-200',
      'before:',
      'before:w-full',
      'before:absolute',
      'before:top-1/2',
      'before:left-0',
      'before:transform',
      'before:-mt-4',
    ],
  },
  action: ({ props }) => ({
    class: [
      // Flexbox
      'inline-flex items-center',
      'flex-col',

      // Transitions and Shape
      'transition-shadow',
      'rounded-md',

      // Colors
      'bg-surface-0',
      '',

      // States
      'focus:outline-none focus:outline-offset-0 focus:ring',
      'focus:ring-primary-400/50 ',

      // Misc
      'overflow-hidden',
      { 'cursor-pointer': !props.readonly },
    ],
  }),
  step: ({ context, props }) => ({
    class: [
      // Flexbox
      'flex items-center justify-center',

      // Position
      'z-20',

      // Shape
      'rounded-full',
      'border',

      // Size
      'w-[2rem]',
      'h-[2rem]',
      'text-sm',
      'leading-[2rem]',

      // Colors
      {
        'text-surface-400 ': !context.active,
        'border-surface-100 ': !context.active,
        'bg-surface-0 ': !context.active,
        'bg-primary-500 ': context.active,
        'border-primary-500 ': context.active,
        'text-surface-0 ': context.active,
      },

      // States
      {
        'hover:border-surface-300 ': !context.active && !props.readonly,
      },

      // Transition
      'transition-colors duration-200 ease-in-out',
    ],
  }),
  label: ({ context }) => ({
    class: [
      // Font
      'leading-5',
      { 'font-bold': context.active },

      // Display
      'block',

      // Spacing
      'mt-2',

      // Colors
      {
        'text-surface-400 ': !context.active,
        'text-surface-800 ': context.active,
      },

      // Text and Overflow
      'whitespace-nowrap',
      'overflow-hidden',
      'overflow-ellipsis',
      'max-w-full',
    ],
  }),
};
