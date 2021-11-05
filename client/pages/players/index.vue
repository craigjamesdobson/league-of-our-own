<template>
  <div>
    <Players column-size:4></Players>
    <Filters></Filters>
  </div>
</template>

<script>
import Players from '@/components/Players/Players'
import Filters from '@/components/Filters/Filters'

export default {
  components: {
    Players,
    Filters
  }
}
</script>
