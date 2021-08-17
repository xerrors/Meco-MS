<template>
  <div class="quicklink-component">
    <h3>快捷入口</h3>
    <div class="ql-container">
      <div
        class="ql-card"
        v-for="(card, ind) in data.cards"
        :key=ind
        :style="{'background': card.color}"
        @click="onOpenNewPage(card.link)"
        >
        <p>{{ card.title }}</p>
        <span>{{ card.domain }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
// import { EyeOutlined, MessageOutlined, LikeOutlined } from '@ant-design/icons-vue';
import { parseTime, joinPath } from "../utils/format";
import request from "../utils/request";

export default defineComponent({
  name: "Pages",
  components: {
    // EyeOutlined,
    // MessageOutlined,
    // LikeOutlined,
  },
  setup() {
    let router = useRouter();

    let data = reactive({
      cards: [
        {
          title: "论文整理",
          link: "https://www.notion.so/krance/e30b2dbdcf4d4a3e931ad720619e0852",
          domain: "Notion",
          color: "hsl(30deg 40% 40%)"
        },
        {
          title: "石墨文档",
          link: "https://shimo.im/desktop",
          domain: "ShiMo",
          color: "hsl(180deg 40% 40%)"
        },
        {
          title: "开发日志",
          link: "https://shimo.im/docs/GpV69tpQK9c99JGv",
          domain: "ShiMo",
          color: "hsl(0deg 40% 40%)"
        },
        {
          title: "博客网页",
          link: "https://www.xerrors.fun",
          domain: "Xerrors",
          color: "hsl(140deg 40% 40%)"
        },
        {
          title: "开源项目",
          link: "https://github.com/Xerrors",
          domain: "GitHub",
          color: "hsl(200deg 40% 40%)"
        },
        {
          title: "滴答清单",
          link: "https://dida365.com/webapp/",
          domain: "DiDa",
          color: "hsl(170deg 40% 40%)"
        },
        {
          title: "卖萌屋学术",
          link: "https://arxiv.xixiaoyao.cn/trend",
          domain: "XiXiaoYao",
          color: "hsl(248deg 40% 40%)"
        },
        {
          title: "阿里云",
          link: "https://swas.console.aliyun.com/?spm=5176.12818093.ProductAndService--ali--widget-home-product-recent.dre0.420816d0KlPNww#/server/fe0c079f181f4e22b129b2f215cf632f/cn-hangzhou/dashboard",
          domain: "Aliyun",
          color: "hsl(25deg 80% 40%)"
        },
      ]
    });


    return {
      data,
    };
  },
  methods: {
    onOpenNewPage(link: string): void {
      window.open(link);
    },
  },
});
</script>

<style lang="scss" scoped>
.quicklink-component {
  h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 0;
  }

  max-height: 100%;


  .ql-container {
    width: 100%;
    margin-top: 16px;
    display: grid;
    justify-content: space-between;
    grid-template-columns: 1fr 1fr;
    grid-auto-rows: 50px;
    grid-gap: 8px 12px;

    overflow: scroll;
    height: 244px;

    &::-webkit-scrollbar { width: 0 !important }
    overflow: -moz-scrollbars-none;

    .ql-card {
      width: 100%;
      height: 50px;
      position: relative;
      overflow: hidden;
      z-index: 0;

      &:hover {
        cursor: pointer;
      }

      padding: 8px 12px;
      border-radius: 4px;
      background: #ff5b1f;
      // box-shadow: 1px 1px 12px 4px rgba(0,0,0,0.05);
      // border: 2px solid  #666;

      p {
        font-size: 14pt;
        font-weight: 600;
        color: white;
        letter-spacing: 1px;
      }

      span {
        position: absolute;
        right: -2px;
        bottom: -12px;
        font-size: 28px;
        font-weight: 800;
        z-index: -1;
        color: rgba(255,255,255,0.2);
        // -webkit-text-stroke: 1px #ffaf92;
      }
    }
  }
}
</style>