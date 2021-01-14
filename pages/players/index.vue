<template>
  <div>
    <Players></Players>
    <Filters></Filters>
  </div>
</template>

<script>
import Players from '@/components/Players/Players'
import Filters from '@/components/Filters/Filters'

export default {
  components: {
    Players,
    Filters,
  },
}
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
