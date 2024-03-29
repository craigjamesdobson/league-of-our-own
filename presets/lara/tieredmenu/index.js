export default {
  root: {
    class: [
      // Shape
      'rounded-md',

      // Size
      'min-w-[12rem]',
      'py-1',

      // Colors
      'bg-surface-0 ',
      'border border-surface-200 ',
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
    class: [
      // Position
      'relative',
    ],
  },
  content: ({ context }) => ({
    class: [
      // Shape
      'rounded-none',

      // Colors
      'text-surface-700 ',
      {
        'bg-surface-200 text-surface-700  ': context.focused,
      },
      console.log(context),

      // Transitions
      'transition-shadow',
      'duration-200',

      // States
      'hover:text-surface-700 ',
      'hover:bg-surface-100  ',
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
  submenuicon: {
    class: [
      // Position
      'ml-auto',
    ],
  },
  submenu: {
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

      // Color
      'bg-surface-0 ',
    ],
  },
  separator: {
    class: 'border-t border-surface-200  my-1',
  },
};
