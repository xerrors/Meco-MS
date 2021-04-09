<template>
<div class="home">
  <div class="navbar">
    <h1>后台总览</h1>
    <a-button type="primary" class="nav-btn" @click="routerJump('/edit/draft')">
      开始写作
    </a-button>
  </div>
  <div class="main-container">
    <div class="block spc8 spr2">
      数据表现图表
    </div>
    <div class="block spc4">
      2
    </div>
    <div class="block spc4 spr3">
      3
    </div>
    <div class="block spc4 spr3">
      4
    </div>
    <div class="block spc4">
      5
    </div>
    <div class="block spc4">
      6
    </div>
    <div class="block spc4">
      7
    </div>
    <div class="block spc4 spr2">
      8
    </div>
    <div class="block spc4 spr2">
      9
    </div>
    <div class="block">
      10
    </div>
    <div class="block">
      11
    </div>
    <div class="block">
      12
    </div>
    <div class="block">
      13
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { useRouter } from "vue-router";

// import  from 'vue'
export default defineComponent({
  setup() {
    let router = useRouter();

    const routerJump = (path:string):void => {
      router.push(path);
    };

    return {
      routerJump,
    }
  }
})
</script>

<style lang="scss" scoped>
.main-container > * {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #FFFFFF;
  box-sizing: border-box;
  // backdrop-filter: blur(32px);
  box-shadow: 1px 0px 20px 8px rgba(0,0,0,0.05);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 16px;

  /* just for test */ 
  display: flex;
  align-items: center;
  justify-content: center;
  /* test */
}

/* Grid Layout */
.main-container {
  display: grid;

  grid-auto-rows: 100px;
  grid-gap: 20px 24px;

  .spc8 { grid-column: span 8; }
  .spc7 { grid-column: span 7; }
  .spc6 { grid-column: span 6; }
  .spc5 { grid-column: span 5; }
  .spc4 { grid-column: span 4; }
  .spc3 { grid-column: span 3; }
  .spc2 { grid-column: span 2; }
  .spc1 { grid-column: span 1; }
  .spr4 { grid-row: span 4; }
  .spr3 { grid-row: span 3; }
  .spr2 { grid-row: span 2; }
  .spr1 { grid-row: span 1; }
}


.main-container {
  grid-template-columns: repeat(12, 1fr);
}

// 大于 1700px 的
@media (min-width: 1700px) {
  .main-container {
    grid-template-columns: repeat(16, 1fr);
  }
}

// 小于 1200px 的
@media (max-width: 1200px) {
  .main-container {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style>