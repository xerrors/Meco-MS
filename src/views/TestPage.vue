<template>
  <div>
    <div class="navbar">
      <h1>测试页面</h1>
    </div>
  </div>
</template>

<script lang="ts">
import { message } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { formatTime, parseTime } from "../utils/format";

import request from "../utils/request";

export default defineComponent({
  name: "server",
  setup() {
    
    let router = useRouter();
    let routerJump = (path: string): void => {
      router.push(path);
    };
     

    return {
      routerJump,
    };
  },
});
</script>



<style lang="scss" scoped>
</style>