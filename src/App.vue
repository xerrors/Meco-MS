<template>
  <layout/>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Layout from './components/Layout.vue';

export default defineComponent({
  name: 'App',
  components: {
    Layout
  },
})
</script>

<style lang="scss">
body::before {
  content: "";
  height: 100%;
  width: 100%;

  position: fixed;
  background: url("/test.png");
  background: white;
  // background: linear-gradient(124.51deg, #e4f6ff 11.89%, #d5e8ff 86.3%);;
  background: linear-gradient(124.51deg, #EBF8FF 11.89%, #EEF6FF 86.3%);
  // filter: blur(64px);
  z-index: -1;
}
</style>
