<template>
  <div class="flex justify-center h-6">
    <button
      class="decrement px-2 rounded-l-sm bg-primary text-white disabled:opacity-50"
      disabled
      @click="decrement"
    >
      -
    </button>
    <input
      class="flex w-8 border-t border-b border-primary p-1 appearance-none text-center"
      :value="0"
      min="0"
      pattern="[0-9]*"
      type="number"
    />
    <button class="px-2 rounded-r-sm bg-primary text-white" @click="increment">
      +
    </button>
  </div>
</template>

<script>
export default {
  setup() {
    const increment = (event) => {
      const numberInput = event.target.parentNode.querySelector(
        'input[type="number"]'
      )
      const decrementButton = event.target.parentNode.querySelector(
        '.decrement'
      )

      numberInput.value++
      decrementButton.disabled = false
    }

    const decrement = (event) => {
      const numberInput = event.target.parentNode.querySelector(
        'input[type="number"]'
      )
      const decrementButton = event.target.parentNode.querySelector(
        '.decrement'
      )

      numberInput.value--
      numberInput.value > 0
        ? (decrementButton.disabled = false)
        : (decrementButton.disabled = true)
    }
    return { increment, decrement }
  },
}
</script>
