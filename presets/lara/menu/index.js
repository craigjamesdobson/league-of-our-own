export default {
  root: {
    class: [
      // Sizing and Shape
      'min-w-[12rem]',
      'rounded-md',
      // Spacing
      'py-2',
      // Colors
      'bg-surface-0 ',
      'text-surface-700 ',
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
  content: ({ context }) => ({
    class: [
      // Shape
      'rounded-none',
      // Colors
      'text-surface-700 ',
      {
        'bg-surface-200 text-surface-700  ': context.focused,
      },
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
  submenuheader: {
    class: [
      // Font
      'font-bold',
      // Spacing
      'm-0',
      'py-3 px-5',
      // Shape
      'rounded-tl-none',
      'rounded-tr-none',
      // Colors
      'bg-surface-0 ',
      'text-surface-700 ',
    ],
  },
  transition: {
    enterFromClass: 'opacity-0 scale-y-[0.8]',
    enterActiveClass:
      'transition-[transform,opacity] duration-[120ms] ease-[cubic-bezier(0,0,0.2,1)]',
    leaveActiveClass: 'transition-opacity duration-100 ease-linear',
    leaveToClass: 'opacity-0',
  },
};
