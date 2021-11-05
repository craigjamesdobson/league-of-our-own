<template>
  <div>
    <div class="flex justify-between mb-4 bg-white rounded-xl">
      <div class="w-full px-4 py-2">
        <ul class="flex flex-wrap">
          <li
            v-for="index in rows"
            :key="index"
            class="
              relative
              flex flex-col
              items-center
              justify-around
              text-sm
              border-b border-gray-100
              player-row
            "
            :class="columnWidth"
          >
            <div class="flex w-full content-loader-row">
              <div class="w-1/12 p-2">
                <span
                  class="content-loader"
                  :style="`width: ${Math.floor(Math.random() * 51) + 50}%;`"
                ></span>
              </div>
              <div class="w-1/12 p-2">
                <span class="content-loader" style="width: 50%"></span>
              </div>
              <div class="w-2/12 p-2">
                <span
                  class="content-loader"
                  :style="`width: ${Math.floor(Math.random() * 51) + 50}%;`"
                ></span>
              </div>
              <div class="w-5/12 p-2">
                <span
                  class="m-auto content-loader"
                  :style="`width: ${Math.floor(Math.random() * 51) + 50}%;`"
                ></span>
              </div>
              <div class="w-2/12 p-2">
                <span
                  class="content-loader"
                  :style="`width: ${Math.floor(Math.random() * 51) + 50}%;`"
                ></span>
              </div>
              <div class="w-2/12 p-2">
                <span
                  class="content-loader"
                  :style="`width: ${Math.floor(Math.random() * 51) + 50}%;`"
                ></span>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    rows: {
      type: Number,
      default: 60
    },
    columnWidth: {
      type: String,
      default: 'w-1/2'
    }
  }
}
</script>
<style lang="scss">
@keyframes aniHorizontal {
  0% {
    background-position: -100% 0;
  }

  100% {
    background-position: 100% 0;
  }
}

.content-loader-row {
  position: relative;

  &:before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    animation-name: aniHorizontal;
    animation-duration: 3.5s;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    background: linear-gradient(to right, #ccc 2%, #666 18%, #ccc 33%);
    background-size: 50%;
    mix-blend-mode: overlay;
  }

  .content-loader {
    @apply flex rounded-md h-4;
    background-color: #ccc;
  }
}
</style>
