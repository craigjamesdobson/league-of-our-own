export default {
  root: ({ props, context }) => ({
    class: [
      // Alignments
      'items-center inline-flex text-center align-bottom justify-center',

      // Sizes & Spacing
      'px-4 py-3 leading-none',

      // Shapes
      'rounded-md border',

      // Colors
      {
        'bg-surface-0  ': !props.modelValue,
        'border-surface-200  ': !props.modelValue,
        'text-surface-700 ': !props.modelValue,
        'bg-primary-500 ': props.modelValue,
      },

      // States
      {
        'hover:bg-surface-50  hover:border-surface-200  hover:text-surface-700 ':
          !props.modelValue,
        'hover:bg-primary-600 hover:border-primary-600 ': props.modelValue,
        'outline-none outline-offset-0 ring ring-primary-400/50 ':
          context.focused && !props.disabled,
      },

      // Transitions
      'transition-all duration-200',

      // Misc
      {
        'cursor-pointer': !props.disabled,
        'opacity-60 select-none pointer-events-none cursor-default':
          props.disabled,
      },
    ],
  }),
  label: {
    class: 'font-bold text-center w-full',
  },
  icon: ({ props }) => ({
    class: [
      ' mr-2',
      {
        'text-surface-600 ': !props.modelValue,
        'text-white ': props.modelValue,
      },
    ],
  }),
};
