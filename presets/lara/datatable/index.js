export default {
  root: ({ props }) => ({
    class: [
      'relative',

      // Flex & Alignment
      { 'flex flex-col': props.scrollable && props.scrollHeight === 'flex' },

      // Size
      { 'h-full': props.scrollable && props.scrollHeight === 'flex' },
    ],
  }),
  loadingoverlay: {
    class: [
      // Position
      'absolute',
      'top-0 left-0',
      'z-20',

      // Flex & Alignment
      'flex items-center justify-center',

      // Size
      'w-full h-full',

      // Color
      'bg-surface-100/40 ',

      // Transition
      'transition duration-200',
    ],
  },
  loadingicon: {
    class: 'w-8 h-8',
  },
  wrapper: ({ props }) => ({
    class: [
      {
        relative: props.scrollable,
        'flex flex-col grow': props.scrollable && props.scrollHeight === 'flex',
      },

      // Size
      { 'h-full': props.scrollable && props.scrollHeight === 'flex' },
    ],
  }),
  header: ({ props }) => ({
    class: [
      'font-bold',

      // Shape
      props.showGridlines
        ? 'border-x border-t border-b-0'
        : 'border-y border-x-0',

      // Spacing
      'p-4',

      // Color
      'bg-surface-50 ',
      'border-surface-200 ',
      'text-surface-700 ',
    ],
  }),
  table: {
    class: 'w-full border-spacing-0 border-separate',
  },
  thead: ({ context }) => ({
    class: [
      {
        'bg-surface-50 top-0 z-40 sticky': context.scrollable,
      },
    ],
  }),
  tbody: ({ instance, context }) => ({
    class: [
      {
        'sticky z-20 ': instance.frozenRow && context.scrollable,
      },
    ],
  }),
  tfoot: ({ context }) => ({
    class: [
      {
        'bg-surface-50 bottom-0 z-0': context.scrollable,
      },
    ],
  }),
  footer: {
    class: [
      'font-bold',

      // Shape
      'border-t-0 border-b border-x-0',

      // Spacing
      'p-4',

      // Color
      'bg-surface-50 ',
      'border-surface-200 ',
      'text-surface-700 ',
    ],
  },
  column: {
    headercell: ({ context, props }) => ({
      class: [
        'font-bold',

        // Position
        { 'sticky z-20 border-b': props.frozen || props.frozen === '' },

        { relative: context.resizable },

        // Alignment
        'text-left',

        // Shape
        { 'first:border-l border-y border-r': context?.showGridlines },
        'border-0 border-b border-solid',

        // Spacing
        context?.size === 'small'
          ? 'p-2'
          : context?.size === 'large'
          ? 'p-5'
          : 'p-4',

        // Color
        (props.sortable === '' || props.sortable) && context.sorted
          ? 'bg-primary-50 text-primary-700'
          : 'bg-surface-50 text-surface-700',
        (props.sortable === '' || props.sortable) && context.sorted ? '' : '',
        'border-surface-200  ',

        // States
        {
          'hover:bg-surface-100 ':
            (props.sortable === '' || props.sortable) && !context?.sorted,
        },
        'focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring focus-visible:ring-inset focus-visible:ring-primary-400/50 ',

        // Transition
        { 'transition duration-200': props.sortable === '' || props.sortable },

        // Misc
        { 'cursor-pointer': props.sortable === '' || props.sortable },
        {
          'overflow-hidden space-nowrap border-y bg-clip-padding':
            context.resizable, // Resizable
        },
      ],
    }),
    headercontent: {
      class: 'flex items-center',
    },
    sort: ({ context }) => ({
      class: [
        context.sorted ? 'text-primary-500' : 'text-surface-700',
        context.sorted ? '' : '',
      ],
    }),
    bodycell: ({ props, context, state, parent }) => ({
      class: [
        // Position
        { 'sticky box-border border-b': parent.instance.frozenRow },
        { 'sticky box-border border-b': props.frozen || props.frozen === '' },

        // Alignment
        'text-left',

        // Shape
        'border-0 border-b border-solid',
        { 'first:border-l border-r border-b': context?.showGridlines },
        {
          'bg-surface-0 ':
            parent.instance.frozenRow || props.frozen || props.frozen === '',
        },

        // Spacing
        { 'p-2': context?.size === 'small' && !state.d_editing },
        { 'p-5': context?.size === 'large' && !state.d_editing },
        {
          'p-4':
            context?.size !== 'large' &&
            context?.size !== 'small' &&
            !state.d_editing,
        },
        { 'py-[0.6rem] px-2': state.d_editing },

        // Color
        'border-surface-200 ',
      ],
    }),
    footercell: ({ context }) => ({
      class: [
        // Font
        'font-bold',

        // Alignment
        'text-left',

        // Shape
        'border-0 border-b border-solid',
        { 'border-x border-y': context?.showGridlines },

        // Spacing
        context?.size === 'small'
          ? 'p-2'
          : context?.size === 'large'
          ? 'p-5'
          : 'p-4',

        // Color
        'border-surface-200 ',
        'text-surface-700 ',
        'bg-surface-50 ',
      ],
    }),
    sorticon: ({ context }) => ({
      class: [
        'ml-2',
        context.sorted ? 'text-primary-700 ' : 'text-surface-700 ',
      ],
    }),
    sortbadge: {
      class: [
        // Flex & Alignment
        'flex items-center justify-center align-middle',

        // Shape
        'rounded-full',

        // Size
        'w-[1.143rem] leading-[1.143rem]',

        // Spacing
        'ml-2',

        // Color
        'text-primary-700 ',
        'bg-primary-50 ',
      ],
    },
    columnfilter: {
      class: 'inline-flex items-center ml-auto',
    },
    filteroverlay: {
      class: [
        // Position
        'absolute top-0 left-0',

        // Shape
        'border-0 ',
        'rounded-md',
        'shadow-md',

        // Size
        'min-w-[12.5rem]',

        // Color
        'bg-surface-0 ',
        'text-surface-800 ',
        '',
      ],
    },
    filtermatchmodedropdown: {
      root: ({ state }) => ({
        class: [
          // Display and Position
          'flex',
          'relative',

          // Spacing
          'my-2',

          // Shape
          'w-full',
          'rounded-md',

          // Color and Background
          'bg-surface-0 ',
          'border border-surface-300 ',
          'text-surface-800 ',
          'placeholder:text-surface-400 ',

          // Transitions
          'transition-all',
          'duration-200',

          // States
          'hover:border-primary-500 ',
          {
            'outline-none outline-offset-0 ring ring-primary-400/50 ':
              state.focused,
          },

          // Misc
          'cursor-pointer',
          'select-none',
        ],
      }),
    },
    filterrowitems: {
      class: 'm-0 p-0 py-3 list-none',
    },
    filterrowitem: ({ context }) => ({
      class: [
        // Font
        'font-normal',
        'leading-none',

        // Position
        'relative',

        // Shape
        'border-0',
        'rounded-none',

        // Spacing
        'm-0',
        'py-3 px-5',

        // Color
        { 'text-surface-700 ': !context?.highlighted },
        { 'bg-surface-0  text-surface-700 ': !context?.highlighted },
        { 'bg-primary-100 ': context?.highlighted },
        { 'bg-primary-50 ': context?.highlighted },

        // States
        { 'hover:bg-surface-100 ': !context?.highlighted },
        {
          'hover:text-surface-700 hover:bg-surface-100 ': !context?.highlighted,
        },
        'focus-visible:outline-none focus-visible:outline-offset-0 focus-visible:ring focus-visible:ring-inset focus-visible:ring-primary-400/50 ',

        // Transitions
        'transition-shadow',
        'duration-200',

        // Misc
        'cursor-pointer',
        'overflow-hidden',
        'whitespace-nowrap',
      ],
    }),
    filteroperator: {
      class: [
        // Spacing
        'px-5 py-3',

        // Shape
        'border-b border-solid',
        'rounded-t-md',

        // Color
        'text-surface-700 ',
        'border-surface-200 ',
        'bg-surface-0 ',
      ],
    },
    filteroperatordropdown: {
      root: ({ state }) => ({
        class: [
          // Display and Position
          'inline-flex',
          'relative',

          // Shape
          'w-full',
          'rounded-md',

          // Color and Background
          'bg-surface-0 ',
          'border border-surface-300 ',

          // Transitions
          'transition-all',
          'duration-200',

          // States
          'hover:border-primary-500 ',
          {
            'outline-none outline-offset-0 ring ring-primary-400/50 ':
              state.focused,
          },

          // Misc
          'cursor-pointer',
          'select-none',
        ],
      }),
      input: ({ props }) => ({
        class: [
          // Font
          'font-sans',
          'leading-none',

          // Display
          'block',
          'flex-auto',

          // Color and Background
          'bg-transparent',
          'border-0',
          {
            'text-surface-800 ': props.modelValue,
            'text-surface-400 ': !props.modelValue,
          },
          'placeholder:text-surface-400 ',

          // Sizing and Spacing
          'w-[1%]',
          'p-3',

          // Shape
          'rounded-none',

          // Transitions
          'transition',
          'duration-200',

          // States
          'focus:outline-none focus:shadow-none',

          // Misc
          'relative',
          'cursor-pointer',
          'overflow-hidden overflow-ellipsis',
          'whitespace-nowrap',
          'appearance-none',
        ],
      }),
      trigger: {
        class: [
          // Flexbox
          'flex items-center justify-center',
          'shrink-0',

          // Color and Background
          'bg-transparent',
          'text-surface-500',

          // Size
          'w-12',

          // Shape
          'rounded-tr-md',
          'rounded-br-md',
        ],
      },
      panel: {
        class: [
          // Position
          'absolute top-0 left-0',

          // Shape
          'border-0 ',
          'rounded-md',
          'shadow-md',

          // Color
          'bg-surface-0 ',
          'text-surface-800 ',
          '',
        ],
      },
      item: ({ context }) => ({
        class: [
          // Font
          'font-normal',
          'leading-none',

          // Position
          'relative',

          // Shape
          'border-0',
          'rounded-none',

          // Spacing
          'm-0',
          'py-3 px-5',

          // Color
          { 'text-surface-700 ': !context.focused && !context.selected },
          {
            'bg-surface-50  text-surface-700 ':
              context.focused && !context.selected,
          },
          { 'bg-primary-100 ': context.focused && context.selected },
          { 'bg-primary-50 ': !context.focused && context.selected },

          // States
          { 'hover:bg-surface-100 ': !context.focused && !context.selected },
          {
            'hover:text-surface-700 hover:bg-surface-100 ':
              context.focused && !context.selected,
          },

          // Transitions
          'transition-shadow',
          'duration-200',

          // Misc
          'cursor-pointer',
          'overflow-hidden',
          'whitespace-nowrap',
        ],
      }),
    },
    filterconstraint: {
      class: [
        // Spacing
        'py-3 px-5',

        // Shape
        'border-b border-solid',

        // Color
        'border-surface-200 ',
      ],
    },
    filteraddrule: {
      class: 'py-3 px-5',
    },
    filteraddrulebutton: {
      root: {
        class: [
          'relative',

          // Alignments
          'items-center inline-flex text-center align-bottom justify-center',

          // Sizes & Spacing
          'text-sm py-2 px-3 w-full',

          // Shape
          'rounded-md',

          'bg-transparent border-transparent',
          'text-primary-500 ',
          'hover:bg-primary-300/20',

          // Transitions
          'transition duration-200 ease-in-out',

          // Misc
          'cursor-pointer overflow-hidden select-none',
        ],
      },
      label: {
        class: 'flex-auto grow-0',
      },
      icon: {
        class: 'mr-2',
      },
    },
    filterremovebutton: {
      root: {
        class: [
          'relative',

          // Alignments
          'items-center inline-flex text-center align-bottom justify-center',

          // Sizes & Spacing
          'text-sm py-2 px-3 w-full mt-2',

          // Shape
          'rounded-md',

          'bg-transparent border-transparent',
          'text-red-500 ',
          'hover:bg-red-300/20',

          // Transitions
          'transition duration-200 ease-in-out',

          // Misc
          'cursor-pointer overflow-hidden select-none',
        ],
      },
      label: {
        class: 'flex-auto grow-0',
      },
      icon: {
        class: 'mr-2',
      },
    },
    filterbuttonbar: {
      class: [
        // Flex & Alignment
        'flex items-center justify-between',

        // Space
        'py-3 px-5',
      ],
    },
    filterclearbutton: {
      root: {
        class: [
          'relative',

          // Alignments
          'items-center inline-flex text-center align-bottom justify-center',

          // Sizes & Spacing
          'text-sm py-2 px-3',

          // Shape
          'rounded-md',

          'text-primary-500 border border-primary-500',
          'hover:bg-primary-300/20',

          // Transitions
          'transition duration-200 ease-in-out',

          // Misc
          'cursor-pointer overflow-hidden select-none',
        ],
      },
    },
    filterapplybutton: {
      root: {
        class: [
          'relative',

          // Alignments
          'items-center inline-flex text-center align-bottom justify-center',

          // Sizes & Spacing
          'text-sm py-2 px-3',

          // Shape
          'rounded-md',

          'text-white ',
          'bg-primary-500 ',
          'hover:bg-primary-600 ',

          // Transitions
          'transition duration-200 ease-in-out',

          // Misc
          'cursor-pointer overflow-hidden select-none',
        ],
      },
    },
    filtermenubutton: ({ context }) => ({
      class: [
        'relative',
        // Flex & Alignment
        'inline-flex items-center justify-center',

        // Size
        'w-8 h-8',

        // Spacing
        'ml-2',

        // Shape
        'rounded-full',

        // Color
        { 'bg-primary-50 text-primary-700': context.active },
        '',

        // States
        'hover:text-surface-700 hover:bg-surface-300/20',
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 ',

        // Transition
        'transition duration-200',

        // Misc
        'cursor-pointer no-underline overflow-hidden',
      ],
    }),
    headerfilterclearbutton: ({ context }) => ({
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex items-center justify-center',
        'text-left',

        // Shape
        'border-none',

        // Spacing
        'm-0 p-0 ml-2',

        // Color
        'bg-transparent',

        // Misc
        'cursor-pointer no-underline overflow-hidden select-none',
        {
          invisible: !context.hidden,
        },
      ],
    }),
    rowtoggler: {
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex items-center justify-center',
        'text-left',

        // Spacing
        'm-0 p-0',

        // Size
        'w-8 h-8',

        // Shape
        'border-0 rounded-full',

        // Color
        'text-surface-500 ',
        'bg-transparent',
        'focus-visible:outline-none focus-visible:outline-offset-0',
        'focus-visible:ring focus-visible:ring-primary-400/50 ',

        // Transition
        'transition duration-200',

        // Misc
        'overflow-hidden',
        'cursor-pointer select-none',
      ],
    },
    columnresizer: {
      class: [
        'block',

        // Position
        'absolute top-0 right-0',

        // Sizing
        'w-2 h-full',

        // Spacing
        'm-0 p-0',

        // Color
        'border border-transparent',

        // Misc
        'cursor-col-resize',
      ],
    },
    rowreordericon: {
      class: 'cursor-move',
    },
    roweditorinitbutton: {
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex items-center justify-center',
        'text-left',

        // Size
        'w-8 h-8',

        // Shape
        'border-0 rounded-full',

        // Color
        'text-surface-700 ',
        'border-transparent',

        // States
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 ',
        'hover:text-surface-700 hover:bg-surface-300/20',

        // Transition
        'transition duration-200',

        // Misc
        'overflow-hidden',
        'cursor-pointer select-none',
      ],
    },
    roweditorsavebutton: {
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex items-center justify-center',
        'text-left',

        // Size
        'w-8 h-8',

        // Shape
        'border-0 rounded-full',

        // Color
        'text-surface-700 ',
        'border-transparent',

        // States
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 ',
        'hover:text-surface-700 hover:bg-surface-300/20',

        // Transition
        'transition duration-200',

        // Misc
        'overflow-hidden',
        'cursor-pointer select-none',
      ],
    },
    roweditorcancelbutton: {
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex items-center justify-center',
        'text-left',

        // Size
        'w-8 h-8',

        // Shape
        'border-0 rounded-full',

        // Color
        'text-surface-700 ',
        'border-transparent',

        // States
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 ',
        'hover:text-surface-700 hover:bg-surface-300/20',

        // Transition
        'transition duration-200',

        // Misc
        'overflow-hidden',
        'cursor-pointer select-none',
      ],
    },
    radiobuttonwrapper: {
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex align-bottom',

        // Size
        'w-6 h-6',

        // Misc
        'cursor-pointer select-none',
      ],
    },
    radiobutton: ({ context }) => ({
      class: [
        // Flexbox
        'flex justify-center items-center',

        // Size
        'w-[1.571rem] h-[1.571rem]',

        // Shape
        'border-2 rounded-full',

        // Color
        { 'text-surface-700 ': !context.checked },
        { 'bg-surface-0 ': !context.checked },
        { 'border-surface-300 ': !context.checked },
        { 'border-primary-500 ': context.checked },
        { 'bg-primary-500 ': context.checked },

        // States
        { 'hover:border-primary-500 ': !context.disabled },
        {
          'outline-none outline-offset-0 ring ring-primary-400/50 ring-inset ':
            context.focused,
        },

        // Transition
        'transition duration-200 ease-in-out',

        // Misc
        { 'cursor-default opacity-60': context.disabled },
      ],
    }),
    radiobuttonicon: ({ context }) => ({
      class: [
        'block',

        // Shape
        'rounded-full',

        // Size
        'w-3 h-3',

        // Color
        'bg-surface-0 ',

        // Transition
        'transition duration-200 transform',
        {
          'backface-hidden scale-10 invisible': context.checked === false,
          'transform scale-100 visible': context.checked === true,
        },
      ],
    }),
    headercheckboxwrapper: {
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex align-bottom',

        // Size
        'w-6 h-6',

        // Misc
        'cursor-pointer select-none',
      ],
    },
    headercheckbox: ({ context }) => ({
      class: [
        // Flex & Alignment
        'flex items-center justify-center',

        // Shape
        'border-2 rounded-lg',

        // Size
        'w-6 h-6',

        // Color
        'text-surface-600',
        {
          'border-surface-200 bg-surface-0  ': !context.checked,
          'border-primary-500 bg-primary-500 ': context.checked,
        },

        // States
        'focus:outline-none focus:outline-offset-0',
        {
          'ring ring-primary-400/50 ': context.focused,
        },

        // Transition
        'transition-colors duration-200',

        // Misc
        { 'cursor-default opacity-60': context.disabled },
      ],
    }),
    headercheckboxicon: {
      class: [
        // Size
        'w-4 h-4',
        'text-base leading-none',

        // Color
        'text-white ',

        // Transition
        'transition-all duration-200',
      ],
    },
    checkboxwrapper: {
      class: [
        'relative',

        // Flex & Alignment
        'inline-flex align-bottom',

        // Size
        'w-6 h-6',

        // Misc
        'cursor-pointer select-none',
      ],
    },
    checkbox: ({ context }) => ({
      class: [
        // Flex & Alignment
        'flex items-center justify-center',

        // Shape
        'border-2 rounded-lg',

        // Size
        'w-6 h-6',

        // Color
        'text-surface-600',
        {
          'border-surface-200 bg-surface-0  ': !context.checked,
          'border-primary-500 bg-primary-500 ': context.checked,
        },

        // States
        'focus:outline-none focus:outline-offset-0',
        {
          'ring ring-primary-400/50 ': context.focused,
        },

        // Transition
        'transition-colors duration-200',

        // Misc
        { 'cursor-default opacity-60': context.disabled },
      ],
    }),
    checkboxicon: {
      class: [
        // Size
        'w-4 h-4',
        'text-base leading-none',

        // Color
        'text-white ',

        // Transition
        'transition-all duration-200',
      ],
    },
    transition: {
      enterFromClass: 'opacity-0 scale-y-[0.8]',
      enterActiveClass:
        'transition-[transform,opacity] duration-[120ms] ease-[cubic-bezier(0,0,0.2,1)]',
      leaveActiveClass: 'transition-opacity duration-100 ease-linear',
      leaveToClass: 'opacity-0',
    },
  },
  bodyrow: ({ context, props }) => ({
    class: [
      // Color
      '',
      { 'bg-primary-50 text-primary-700 ': context.selected },
      { 'bg-surface-0 text-surface-600 ': !context.selected },
      { 'font-bold bg-surface-0 ': props.frozenRow },
      {
        'odd:bg-surface-0 odd:text-surface-600  even:bg-surface-50 even:text-surface-600 ':
          context.stripedRows,
      },

      // State
      {
        'focus:outline-none focus:outline-offset-0 focus:ring focus:ring-primary-400/50 ring-inset ':
          context.selectable,
      },
      {
        'hover:bg-surface-300/20 hover:text-surface-600':
          props.selectionMode && !context.selected,
      },

      // Transition
      {
        'transition duration-200':
          (props.selectionMode && !context.selected) || props.rowHover,
      },

      // Misc
      { 'cursor-pointer': props.selectionMode },
    ],
  }),
  rowexpansion: {
    class: 'bg-surface-0  text-surface-600 ',
  },
  rowgroupheader: {
    class: ['sticky z-20', 'bg-surface-0 text-surface-600 ', ''],
  },
  rowgroupfooter: {
    class: ['sticky z-20', 'bg-surface-0 text-surface-600 ', ''],
  },
  rowgrouptoggler: {
    class: [
      'relative',

      // Flex & Alignment
      'inline-flex items-center justify-center',
      'text-left',

      // Spacing
      'm-0 p-0',

      // Size
      'w-8 h-8',

      // Shape
      'border-0 rounded-full',

      // Color
      'text-surface-500 ',
      'bg-transparent',
      'focus-visible:outline-none focus-visible:outline-offset-0',
      'focus-visible:ring focus-visible:ring-primary-400/50 ',

      // Transition
      'transition duration-200',

      // Misc
      'overflow-hidden',
      'cursor-pointer select-none',
    ],
  },
  rowgrouptogglericon: {
    class: 'inline-block w-4 h-4',
  },
  resizehelper: {
    class: 'absolute hidden w-[2px] z-20 bg-primary-500 ',
  },
};
