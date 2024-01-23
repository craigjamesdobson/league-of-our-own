export default {
  root: ({ props }) => ({
    class: [
      // Spacing and Shape
      'my-4 mx-0',
      'rounded-md',
      'border-solid border-0 border-l-[6px]',

      // Colors
      {
        'bg-blue-100/70 ': props.severity == 'info',
        'bg-green-100/70 ': props.severity == 'success',
        'bg-yellow-100/70 ': props.severity == 'warn',
        'bg-red-100/70 ': props.severity == 'error',
      },
      {
        'border-blue-500 ': props.severity == 'info',
        'border-green-500 ': props.severity == 'success',
        'border-yellow-500 ': props.severity == 'warn',
        'border-red-500 ': props.severity == 'error',
      },
      {
        'text-blue-700 ': props.severity == 'info',
        'text-green-700 ': props.severity == 'success',
        'text-yellow-700 ': props.severity == 'warn',
        'text-red-700 ': props.severity == 'error',
      },
    ],
  }),
  wrapper: {
    class: [
      // Flexbox
      'flex items-center',

      // Spacing
      'p-3',
    ],
  },
  icon: {
    class: [
      // Sizing and Spacing
      'w-6 h-6',
      'text-lg leading-none mr-4 shrink-0',
    ],
  },
  text: {
    class: [
      // Font and Text
      'text-sm',
    ],
  },
  button: {
    class: [
      // Flexbox
      'flex items-center justify-center',

      // Size
      'w-8 h-8',

      // Spacing and Misc
      'ml-auto  relative',

      // Shape
      'rounded-full',

      // Colors
      'bg-transparent',

      // Transitions
      'transition duration-200 ease-in-out',

      // States
      'hover:bg-surface-0/50 ',

      // Misc
      'overflow-hidden',
    ],
  },
  transition: {
    enterFromClass: 'opacity-0',
    enterActiveClass: 'transition-opacity duration-300',
    leaveFromClass: 'max-h-40',
    leaveActiveClass: 'overflow-hidden transition-all duration-300 ease-in',
    leaveToClass: 'max-h-0 opacity-0 !m-0',
  },
};
