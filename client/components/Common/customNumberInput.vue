<template>
  <div class="flex h-5 number-input-container">
    <button
      class="flex items-center justify-center w-5 h-5 text-white rounded-l-sm  decrement bg-primary hover:bg-indigo-900 disabled:opacity-50 focus:outline-none animate"
      @click="decrement"
      :disabled="value === 0"
    >
      -
    </button>
    <input
      class="flex w-5 h-5 p-1 text-xs text-center border-t border-b appearance-none pointer-events-none  border-primary animate"
      min="0"
      pattern="[0-9]*"
      type="number"
      :value="value"
    />
    <button
      class="flex items-center justify-center w-5 h-5 text-white rounded-r-sm  bg-primary hover:bg-indigo-900 focus:outline-none animate"
      @click="increment"
    >
      +
    </button>
  </div>
</template>

<script>
export default {
  props: {
    value: Number,
  },
  emits: ['input-updated'],
  setup(_, { emit }) {
    const increment = (event) => {
      const numberInput = event.target.parentNode.querySelector(
        'input[type="number"]'
      )
      const decrementButton =
        event.target.parentNode.querySelector('.decrement')

      numberInput.value++
      decrementButton.disabled = false

      event.target.parentNode.classList.add('active')
      emit('input-updated', +numberInput.value)
    }

    const decrement = (event) => {
      const numberInput = event.target.parentNode.querySelector(
        'input[type="number"]'
      )
      const decrementButton =
        event.target.parentNode.querySelector('.decrement')

      numberInput.value--
      if (numberInput.value > 0) {
        decrementButton.disabled = false
      } else {
        decrementButton.disabled = true
        event.target.parentNode.classList.remove('active')
      }
      emit('input-updated', +numberInput.value)
    }
    return { increment, decrement }
  },
}
</script>

<style lang="scss">
.number-input-container {
  &.active {
    button {
      @apply bg-green-600 text-white animate;
      &:hover {
        @apply bg-green-700;
      }
    }
    input {
      @apply border-green-600 bg-green-100 animate;
    }
  }
}
</style>
