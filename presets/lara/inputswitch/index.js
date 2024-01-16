export default {
  root: ({ props, state }) => ({
    class: [
      'inline-block relative',
      'w-12 h-7',
      'rounded-2xl',
      {
        'opacity-60 select-none pointer-events-none cursor-default':
          props.disabled,
      },
      {
        'outline-none outline-offset-0 ring ring-primary-400/50 ':
          state.focused,
      },
    ],
  }),
  slider: ({ props }) => ({
    class: [
      // Position
      'absolute top-0 left-0 right-0 bottom-0',
      { 'before:transform before:translate-x-5': props.modelValue },

      // Shape
      'rounded-2xl',

      // Before:
      'before:absolute before:top-1/2 before:left-1',
      'before:-mt-2.5',
      'before:h-5 before:w-5',
      'before:rounded-full',
      'before:duration-200',
      'before:bg-surface-0 before:',

      // Colors
      'border border-transparent',
      {
        'bg-surface-200 ': !props.modelValue,
        'bg-primary-500 ': props.modelValue,
      },

      // States
      { 'hover:bg-surface-300 hover: ': !props.modelValue },

      // Transition
      'transition-colors duration-200',

      // Misc
      'cursor-pointer',
    ],
  }),
};
