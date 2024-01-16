export default {
  root: ({ props }) => ({
    class: [
      'relative',

      // Size
      {
        'h-1 w-60': props.orientation == 'horizontal',
        'w-1 h-56': props.orientation == 'vertical',
      },

      // Shape
      'border-0',

      // Colors
      'bg-surface-100 ',

      // States
      {
        'opacity-60 select-none pointer-events-none cursor-default':
          props.disabled,
      },
    ],
  }),
  range: ({ props }) => ({
    class: [
      // Position
      'block absolute',
      {
        'top-0 left-0': props.orientation == 'horizontal',
        'bottom-0 left-0': props.orientation == 'vertical',
      },

      // Size
      {
        'h-full': props.orientation == 'horizontal',
        'w-full': props.orientation == 'vertical',
      },

      // Colors
      'bg-primary-500 ',
    ],
  }),
  handle: ({ props }) => ({
    class: [
      'block',

      // Size
      'h-[1.143rem]',
      'w-[1.143rem]',
      {
        'top-[50%] mt-[-0.5715rem] ml-[-0.5715rem]':
          props.orientation == 'horizontal',
        'left-[50%] mb-[-0.5715rem] ml-[-0.5715rem]':
          props.orientation == 'vertical',
      },

      // Shape
      'rounded-full',
      'border-2',

      // Colors
      'bg-surface-0 ',
      'border-primary-500 ',

      // States
      'hover:bg-primary-500 hover:border-primary-500',
      'focus:outline-none focus:outline-offset-0 focus:ring',
      'ring-primary-400/50 ',

      // Transitions
      'transition duration-200',

      // Misc
      'cursor-grab',
      'touch-action-none',
    ],
  }),
  starthandler: ({ props }) => ({
    class: [
      'block',

      // Size
      'h-[1.143rem]',
      'w-[1.143rem]',
      {
        'top-[50%] mt-[-0.5715rem] ml-[-0.5715rem]':
          props.orientation == 'horizontal',
        'left-[50%] mb-[-0.5715rem] ml-[-0.4715rem]':
          props.orientation == 'vertical',
      },

      // Shape
      'rounded-full',
      'border-2',

      // Colors
      'bg-surface-0 ',
      'border-primary-500 ',

      // States
      'hover:bg-primary-500 hover:border-primary-500',
      'focus:outline-none focus:outline-offset-0 focus:ring',
      'focus:ring-primary-400/50 ',

      // Transitions
      'transition duration-200',

      // Misc
      'cursor-grab',
      'touch-action-none',
    ],
  }),
  endhandler: ({ props }) => ({
    class: [
      'block',

      // Size
      'h-[1.143rem]',
      'w-[1.143rem]',
      {
        'top-[50%] mt-[-0.5715rem] ml-[-0.5715rem]':
          props.orientation == 'horizontal',
        'left-[50%] mb-[-0.5715rem] ml-[-0.4715rem]':
          props.orientation == 'vertical',
      },

      // Shape
      'rounded-full',
      'border-2',

      // Colors
      'bg-surface-0 ',
      'border-primary-500 ',

      // States
      'hover:bg-primary-500 hover:border-primary-500',
      'focus:outline-none focus:outline-offset-0 focus:ring',
      'focus:ring-primary-400/50 ',

      // Transitions
      'transition duration-200',

      // Misc
      'cursor-grab',
      'touch-action-none',
    ],
  }),
};
