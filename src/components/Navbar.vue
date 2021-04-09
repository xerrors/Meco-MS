<template>
  <div class="navbar">
    <h1>{{ route_name }}</h1>
    <a-button type="primary" class="nav-btn" @click="routerJump('/edit/draft')">
      开始写作
    </a-button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRaw } from 'vue';
import { useRoute, useRouter } from "vue-router";
export default defineComponent({
  name: "navbar",
  setup() {
    let route = useRoute();
    let router = useRouter();
    let route_name = toRaw(route).name;

    const routerJump = (path:string):void => {
      router.push(path);
    }

    return {
      route_name,
      routerJump,
    }
  },
});
</script>

<style lang="scss" scoped>

</style>