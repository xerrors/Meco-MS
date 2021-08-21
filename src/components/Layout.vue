<template>
  <div>
    <div v-if="route_meta.specialLayout">
      <router-view></router-view>
    </div>

    <div v-else class="default-container">
      <slides v-if="slides_state"></slides>

      <main>
        <!-- <navbar></navbar> -->
        <router-view></router-view>
        <!-- <footer>Designed & Developed by Xerrors {{ slides_state ? "open" : "close" }}</footer> -->
      </main>

    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, toRaw } from 'vue'
import { useRoute } from 'vue-router'
import Slides from './Slides.vue'
import Navbar from './Navbar.vue'
import { useStore } from 'vuex';

export default defineComponent({
  name: 'Layout',
  components: {
    Slides,
    Navbar,
  },
  setup() {
    let route = useRoute();
    let store = useStore();
    let route_meta = toRaw(route).meta;

    return {
      route_meta,
      slides_state: computed(() => store.state.show_slides),
    }
  },
})
</script>

<style lang="scss" scoped>
.default-container {
  min-width: 760;
  display: flex;
  
  // background: linear-gradient(124.51deg, #EBF8FF 11.89%, #e5f1ff 86.3%);
  main{
    display: flex;
    flex-direction: column;

    min-height: 100vh;
    width: 100%;

    padding: 0 24px;

    /* for test */
    // height: 1000px;

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
