export default {
  root: {
    class: [
      // Sizing and Shape
      'min-w-[12rem]',
      'rounded-md',
      'shadow-md',

      // Spacing
      'py-2',

      // Colors
      'bg-surface-0 ',
      'text-surface-700 ',
      '',
    ],
  },
  menu: {
    class: [
      // Spacings and Shape
      'list-none',
      'm-0',
      'p-0',
      'outline-none',
    ],
  },
  menuitem: {
    class: 'relative',
  },
  content: ({ context }) => ({
    class: [
      // Shape
      'rounded-none',
      // Colors
      'text-surface-700 ',
      {
        'text-surface-500 ': !context.focused && !context.active,
        'text-surface-500 bg-surface-200 ': context.focused && !context.active,
        'text-primary-700  bg-primary-50 ': context.focused && context.active,
        'text-primary-700  bg-primary-50 ': !context.focused && context.active,
      },

      // Transitions
      'transition-shadow',
      'duration-200',

      // States
      {
        'hover:bg-surface-100 ': !context.active,
        'hover:bg-primary-400/30 ': context.active,
      },
    ],
  }),
  action: {
    class: [
      'relative',
      // Flexbox

      'flex',
      'items-center',

      // Spacing
      'py-3',
      'px-5',

      // Color
      'text-surface-700 ',

      // Misc
      'no-underline',
      'overflow-hidden',
      'cursor-pointer',
      'select-none',
    ],
  },
  icon: {
    class: [
      // Spacing
      'mr-2',

      // Color
      'text-surface-600 ',
    ],
  },
  label: {
    class: ['leading-none'],
  },
  submenu: ({ props }) => ({
    class: [
      // Size
      'w-full sm:w-48',

      // Spacing
      'py-1',
      'm-0',
      'list-none',

      // Shape
      'shadow-md',
      'rounded-md',
      '',

      // Position
      'static sm:absolute',
      'z-10',
      { 'sm:absolute sm:left-full sm:top-0': props.level > 1 },

      // Color
      'bg-surface-0 ',
    ],
  }),
  submenuicon: {
    class: ['ml-auto'],
  },
  separator: {
    class: 'border-t border-surface-200  my-1',
  },
  transition: {
    enterFromClass: 'opacity-0',
    enterActiveClass: 'transition-opacity duration-250',
  },
};
