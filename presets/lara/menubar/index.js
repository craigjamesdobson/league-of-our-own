export default {
  root: {
    class: [
      'relative',

      // Flexbox
      'flex',
      'items-center',

      // Spacing
      'p-2',

      // Shape
      'rounded-md',

      // Color
      'bg-surface-50 ',
      'border border-surface-200 ',
    ],
  },
  menu: ({ props }) => ({
    class: [
      // Flexbox
      'sm:flex',
      'items-center',
      'flex-wrap',
      'flex-col sm:flex-row',
      { hidden: !props?.mobileActive, flex: props?.mobileActive },

      // Position
      'absolute sm:relative',
      'top-full left-0',
      'sm:top-auto sm:left-auto',

      // Size
      'w-full sm:w-auto',

      // Spacing
      'm-0',
      'py-1 sm:py-0 sm:p-0',
      'list-none',

      // Shape
      'shadow-md sm:shadow-none',
      'border-0',

      // Color
      'bg-surface-0  sm:bg-transparent',

      // Misc
      'outline-none',
    ],
  }),
  menuitem: {
    class: 'sm:relative sm:w-auto w-full static',
  },
  content: ({ props, context }) => ({
    class: [
      // Shape
      { 'rounded-md': props.root },

      //  Colors
      {
        'text-surface-500 ': !context.focused && !context.active,
        'text-surface-500 bg-surface-200 ': context.focused && !context.active,
        'text-primary-700  bg-primary-50 ': context.focused && context.active,
        'text-primary-700  bg-primary-50 ': !context.focused && context.active,
      },

      // Hover States
      {
        'hover:bg-surface-100 ': !context.active,
        'hover:bg-primary-500/50 ': context.active,
      },

      // Transitions
      'transition-all',
      'duration-200',
    ],
  }),
  action: ({ context }) => ({
    class: [
      'relative',

      // Flexbox
      'flex',
      'items-center',

      // Spacing
      'py-3',
      'px-5',

      // Size
      {
        'pl-9 sm:pl-5': context.level === 1,
        'pl-14 sm:pl-5': context.level === 2,
      },
      'leading-none',

      // Misc
      'select-none',
      'cursor-pointer',
      'no-underline ',
      'overflow-hidden',
    ],
  }),
  icon: {
    class: 'mr-2',
  },
  submenuicon: ({ props }) => ({
    class: [
      {
        'ml-auto sm:ml-2': props.root,
        'ml-auto': !props.root,
      },
    ],
  }),
  submenu: ({ props }) => ({
    class: [
      // Size
      'w-full sm:w-48',

      // Spacing
      'py-1',
      'm-0',
      'list-none',

      // Shape
      'shadow-none sm:shadow-md',
      'border-0',

      // Position
      'static sm:absolute',
      'z-10',
      { 'sm:absolute sm:left-full sm:top-0': props.level > 1 },

      // Color
      'bg-surface-0 ',
    ],
  }),
  separator: {
    class: 'border-t border-surface-200  my-1',
  },
  button: {
    class: [
      // Flexbox
      'flex sm:hidden',
      'items-center justify-center',

      // Size
      'w-8',
      'h-8',

      // Shape
      'rounded-full',
      // Color
      'text-surface-500 ',

      // States
      'hover:text-surface-600 ',
      'hover:bg-surface-100 ',
      'focus:outline-none focus:outline-offset-0',
      'focus:ring focus:ring-primary-400/50 ',

      // Transitions
      'transition duration-200 ease-in-out',

      // Misc
      'cursor-pointer',
      'no-underline',
    ],
  },
  end: {
    class: 'ml-auto self-center',
  },
};
