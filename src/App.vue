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
  background: #fafafa;
  // background: linear-gradient(126deg, #daf2ff 11.89%, #eaf4ff 86.3%);
  // background: url(https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/山水倒影简约设计4k壁纸_彼岸图网.jpg);
  // background: linear-gradient(124.51deg, #EBF8FF 11.89%, #EEF6FF 86.3%);
  // filter: blur(64px);
  z-index: -1;
}
</style>
