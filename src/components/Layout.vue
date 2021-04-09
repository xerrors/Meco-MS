<template>
  <div>
    <div v-if="route_meta.specialLayout">
      <router-view/>
    </div>

    <div v-else class="default-container">
      <slides/>

      <main>
        <!-- <navbar></navbar> -->
        <router-view/>
        <footer>Designed & Developed by Chen</footer>
      </main>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import Slides from './Slides.vue'
import Navbar from './Navbar.vue'

export default defineComponent({
  name: 'Layout',
  components: {
    Slides,
    Navbar,
  },
  setup() {
    let route = useRoute();
    let route_meta = toRaw(route).meta;

    return {
      route_meta,
    }
  },
})
</script>

<style lang="scss" scoped>
.default-container {
  // background: linear-gradient(124.51deg, #EBF8FF 11.89%, #e5f1ff 86.3%);
  main{
    display: flex;
    flex-direction: column;

    margin-left: var(--slides-width);
    min-height: 100vh;
    width: auto;

    padding: 0 24px;

    /* for test */
    height: 1000px;

    footer {
      margin-top: auto;
      height: var(--footer-height);
      padding: 20px 0;

      // display: flex;
      // align-items: center;
      // justify-content: center;

      text-align: center;

      color: #666;
      line-height: calc(var(--footer-height) - 40px);
    }
  } 
}
</style>
