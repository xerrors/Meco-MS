<template>
  <div class="navbar">
    <button class="slides-swt" v-if="true" @click="toggleSlides"><MenuOutlined /></button>
    <h1 class="nav-title"><slot name="title">{{ route_name }}</slot></h1>
    <div class="nav-actions">
      <slot>
        <a-button class="nav-btn" @click="alert('测试')">
          次要按钮
        </a-button>
        <a-button type="primary" class="nav-btn" @click="alert('测试')">
          默认按钮
        </a-button>
      </slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, toRaw } from 'vue';
import { useRoute, useRouter } from "vue-router";
import { useStore } from 'vuex';
import {
  MenuOutlined,
} from '@ant-design/icons-vue';
export default defineComponent({
  name: "navbar",
  components: {
    MenuOutlined,
  },
  setup() {
    let route = useRoute();
    let router = useRouter();
    let store = useStore();
    let route_name = toRaw(route).name;

    const toggleSlides = () => {
      store.commit("toggleSlides")
      console.log(store.state.show_slides)  
    }

    const routerJump = (path:string):void => {
      router.push(path);
    }

    return {
      route_name,
      routerJump,
      toggleSlides,
    }
  },
});
</script>

<style lang="scss">
// navbar
.navbar {
  //position: sticky;
  top: 0;
  // background: red;

  width: 100%;
  height: var(--navbar-height);

  display: flex;
  justify-content: flex-start;
  align-items: center;

  button.slides-swt {
    // width: 40px;
    padding: 4px 12px;
    font-size: 16px;
    margin-right: 16px;
    background: white;
    box-shadow: 1px 1px 14px 4px rgb(166 166 166 / 5%);
  }

  h1.nav-title {
    font-size: 28px;
    font-weight: 600;
    line-height: 40px;
    margin-bottom: 0;
  }

  div.nav-actions {
    width: auto;
    justify-self: flex-end;
    margin-left: auto;

    > .nav-btn:not(:first-child) {
      margin-left: 16px;
    }
  }

  .nav-btn {
    margin-left: auto;
    border-radius: 4px;
    padding: 4px 12px;
    height: auto;
    width: auto;
    // border: 1px solid var(--primary-color);
    letter-spacing: 1px;
  }

  .nav-btn.ant-btn-primary {
    background: var(--primary-color);
    border-color: var(--primary-color);
  }

  .nav-btn.ant-btn:not(.ant-btn-primary):hover,
  .nav-btn.ant-btn:not(.ant-btn-primary):focus {
    color: var(--primary-color);
    border-color: var(--primary-color);
  }
}
</style>