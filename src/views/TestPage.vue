<template>
  <Navbar>
    <a-button class="nav-btn" @click="a">
      默认按钮
    </a-button>
  </Navbar>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'


import Navbar from '../components/Navbar.vue';
export default defineComponent({
  components: {
    Navbar,
  },
  setup() {
    const a = () => {
      alert("123");
    }

    return {
      a,
    }
  },
})
</script>
