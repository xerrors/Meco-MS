<template>
  <div class="home">
    <Navbar>
      <template v-slot:default>
        <a-button
          type="primary"
          class="nav-btn"
          @click="routerJump('/edit/draft')"
        >
          <EditOutlined /> 写文章
        </a-button>
      </template>
    </Navbar>

    <div class="main-container">
      <div class="block spc8 spr2 data-charts">
        <h3>数据表现</h3>
        <v-chart class="chart" :option="options.count" autoresize/>
      </div>
      <div class="block spc4 yiju">
        <h3 class="yiju__date">{{ yiju.date }}</h3>
        <div class="yiju__content hide-scrollbar">{{ yiju.content }}</div>
        <span class="yiju__origin">来自：{{ yiju.origin }}</span>
      </div>
      <!-- <div class="block spc4 spr3 poster-card">
        <Poster ></Poster>
      </div> -->

      <div class="block spc4 spr3 pv-order">
        <h3>阅读量文章排行</h3>
        <div class="pv-order-list hide-scrollbar">
          <div v-for="(a, ind) in articles" :key="ind" class="list-item">
            <span class="list-item-label">{{ ind + 1 }}</span>
            <span class="list-item-title"
              ><a :href="a.link" target="_blank">{{ a.title }}</a></span
            >
            <span class="list-item-count">{{ a.read_count }}</span>
          </div>
        </div>
      </div>

      <div class="block spc4 pvdata all">
        <div class="pvdata-header">
          <h3>详细数据</h3>
          <a-switch 
            v-model:checked="countAll.viewMonth" 
            size="small"
          ></a-switch>
        </div>
        <div class="count-block">
          <div class="tiny-block" style="margin-left: 0">
            <div>{{ countAll.all.pv }}</div>
            <span class="pvdata__add" v-if="countAll.viewMonth">30日+{{ countAll.month.pv ? countAll.month.pv : 0  }}</span>
            <span class="pvdata__add" v-else>昨日+{{ countAll.day.pv ? countAll.day.pv : 0  }}</span>
            <h4>访问量</h4>
          </div>
          <div class="tiny-block">
            <div>{{ countAll.all.like }}</div>
            <span class="pvdata__add" v-if="countAll.viewMonth">30日+{{ countAll.month.like ? countAll.month.like : 0  }}</span>
            <span class="pvdata__add" v-else>昨日+{{ countAll.day.like ? countAll.day.like : 0  }}</span>
            <h4>点赞数</h4>
          </div>
          <div class="tiny-block" style="margin-right: 0">
            <div>{{ countAll.all.comment }}</div>
            <span class="pvdata__add" v-if="countAll.viewMonth">30日+{{ countAll.month.comment ? countAll.month.comment : 0  }}</span>
            <span class="pvdata__add" v-else>昨日+{{ countAll.day.comment ? countAll.day.comment : 0  }}</span>
            <h4>评论数</h4>
          </div>
        </div>
      </div>

      <div class="block spc4 spr2 quicklink">
        <QuickLink></QuickLink>
      </div>
      <!-- <div class="block spc4 spr2">9</div> -->

      <div class="block spc2 pie-charts cpu"><v-chart class="chart" :option="options.cpu" autoresize/></div>
      <div class="block spc2 pie-charts mem"><v-chart class="chart" :option="options.mem" autoresize/></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref, onBeforeUnmount, reactive, onBeforeUpdate } from "vue";
import { useRouter } from "vue-router";
import { joinPath, parseTime } from "../utils/format";

import Poster from '../components/Poster.vue';
import QuickLink from '../components/QuickLink.vue';
import Navbar from '../components/Navbar.vue';

import request from "../utils/request";

import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { PieChart, LineChart } from "echarts/charts";
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  DatasetComponent,
} from "echarts/components";
import VChart, {THEME_KEY} from "vue-echarts";


import {
  EditOutlined,
} from '@ant-design/icons-vue';

use([
  CanvasRenderer,
  PieChart,
  LineChart,
  GridComponent,
  TitleComponent,
  TooltipComponent,
  DataZoomComponent,
  LegendComponent,
  DatasetComponent,
]);

export default defineComponent({
  name: "dashboard",
  components: {
    Poster,
    QuickLink,
    VChart,
    Navbar,
    EditOutlined,
  },
  provide: {
    // [THEME_KEY]: "dark"
  },
  setup() {
    let router = useRouter();
    let localTimer: NodeJS.Timeout;

    const routerJump = (path: string): void => {
      router.push(path);
    };

    const options = reactive({
      count: {},
      cpu: {},
      mem: {}
    })

    const articles = ref([]);
    const serverStatus = ref({
      status: []
    });

    const yiju = reactive({
      content: "",
      origin: "",
      date: parseTime(new Date(), '{y}年{m}月{d}日')
    })

    const countAll = ref({
      all: { pv: 0, like: 0, comment: 0 },
      day: { pv: 0, like: 0, comment: 0 },
      week: { pv: 0, like: 0, comment: 0 },
      month: { pv: 0, like: 0, comment: 0 },
      viewMonth: false
    });

    function getCount() {
      return new Promise((resolve, reject) => {
        request({
          url: "/api/admin/count/all",
          method: "GET",
        })
          .then((res) => {
            countAll.value = res.data.data;
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    function getArticles() {
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/articles",
          method: "get",
          params: { source: "db" },
        })
          .then((res) => {
            let temp = res.data.data.map((item: any) => {
              item.link = joinPath("https://xerrors.fun/", item.permalink);
              return item;
            });
            temp.sort((a: any, b: any) => {
              return Number(b.read_count) - Number(a.read_count);
            });
            articles.value = temp.slice(0, 20);
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }
    function getServerStatus() {
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/status",
          method: "get",
        })
          .then((res) => {
            serverStatus.value = res.data.data;
            options.cpu = createPieOption("CPU", serverStatus.value.status[0], "#546fc6", "#bbddff");
            options.mem = createPieOption("MEM", serverStatus.value.status[1], "#cc6670", "#ffbbaa")
            resolve(res)
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    function getDaysData() {
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/count/days",
          method: "get",
          params: {
            days: 60
          }
        })
          .then((res) => {
            options.count = createEchartsOption(res.data.data.reverse());
            resolve(res)
          })
          .catch((err) => {
            reject(err);
          });
      });

    }

    function createEchartsOption(daysData:any) {
      var option = {
        tooltip: {},
        legend: { top: 3 },
        grid: {
          left: 25,
          right: 30,
          top: "20%",
          bottom: "25%",
        },
        xAxis: {type: 'category'},
        yAxis: [{},{}],
        dataZoom: [{
            type: 'slider',
            start: 80,
            end: 100
          }],
        dataset: {
          source: daysData
        },
        series: [
          { name: "阅读量", smooth: true, type: "line", yAxisIndex: 1 },
          { name: "点赞数", smooth: true, type: "line", },
          { name: "评论数", smooth: true, type: "line", },
        ],
      };
      return option;
    }

    function createPieOption(name:string, persent:number, color1:string, color2: string) {
      var option = {
        color: [color1, color2],
        title: {
          text: name,
          left: "center",
          top: "center",
          textStyle: {
            fontWeight: "bold",
            fontSize: 16,
          }
        },
        series: [
          {
            type: 'pie',
            radius: ['60%', '90%'],
            label: {
              show: false  
            },
            data: [
              {value: persent},
              {value: 100-persent},
            ]
          }
        ]
      };
      return option;
    }

    function getYiju() {
      new Promise((resolve, reject) => {
        request.get("https://api.xygeng.cn/one")
        .then(res => {
          yiju.content = res.data.data.content;
          yiju.origin = res.data.data.origin;
          resolve(res);
        })
        .catch(err => {
          yiju.content = "世界上只有一种真正的英雄主义，就是认清了生活的真相后还依然热爱它！";
          yiju.origin = "《米开朗琪罗》罗曼·罗兰";
          reject(err)
        })
      })
    }

    getCount();
    getArticles();
    getYiju();
    getDaysData();
    getServerStatus();

    onMounted(() => {
      localTimer = setInterval(getServerStatus, 60000);
    })
    
    onBeforeUnmount(() => {
      clearInterval(localTimer);
    })

    // console.log(options.count)
    console.log(options)

    return {
      routerJump,
      countAll,
      articles,
      serverStatus,
      yiju,
      options,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-container > .block {
  box-sizing: border-box;
  // backdrop-filter: blur(32px);
  // box-shadow: 1px 1px 14px 4px rgb(44 123 255 / 5%);
  /* Note: backdrop-filter has minimal browser support */
  // backdrop-filter: blur(64px);

  border-radius: 8px;
  padding: 0.75rem 1rem;
  box-shadow: 1px 1px 14px 4px rgb(166 166 166 / 5%);

  max-width: 100%;

  h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 0;
  }
}

.main-container:not(.color-block) > .block {
  background: white;
  // border: 2px solid #ffffff;
}

/* Grid Layout */
.main-container {
  display: grid;

  grid-auto-rows: 150px;
  grid-gap: 16px 20px;

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

.pvdata {
  .pvdata-header {
    display: flex;
    h3 { margin: 0;}
    align-items: center;
    justify-content: space-between;
  }
}

.count-block {
  display: flex;
  // flex: auto;
  // justify-content: space-between;
  height: auto;

  // .tiny-block {
  //   margin-top: 10px;
  // }

  > * {
    // background: white;
    flex-grow: 1;
    // padding: 10px;
    height: 100%;
    margin: 0 10px;
    // border: 1px solid black;
    border-radius: 8px;

    > div {
      font-size: 1.6rem;
      font-family: initial;
      color: var(--primary-color);
      line-height: 1;
      font-weight: 600;
      margin-top: 16px;
      text-align: center;
    }

    > span {
      margin: 4px auto;
      margin-bottom: 8px;
      width: fit-content;
      display: block;
      text-align: center;
      background: var(--block-light-theme-bg);
      border-radius: 4px;
      padding: 0px 6px;
      font-size: 0.75rem;
    }

    > h4 {
      font-size: 0.75rem;
      font-weight: bold;
      margin-bottom: 0;
      text-align: center;
    }
  }

  &:first-child() {
    margin-left: 0;
  }
  &:last-child() {
    margin-right: 0;
  }
}

.pv-order-list {
  margin: 0.4rem 0;
  height: calc(100% - 2rem);

  &:first-child() {
    color: red;
  }

  .list-item {
    height: 39px;
    width: 100%;
    display: flex;
    // justify-content: center;
    align-items: center;

    // &:first-child {
    //   .list-item-label {
    //     color: red;
    //   }
    // }

    .list-item-label {
      width: 18px;
      height: 20px;
      font-size: 14px;
      border-radius: 50%;
      margin-right: 10px;
      text-align: left;
      font-weight: 600;
      line-height: 20px;
    }

    .list-item-title {
      width: 100%;
      word-break: keep-all;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      a {
        color: inherit;
      }
    }

    .list-item-count {
      margin-left: auto;
      background: var(--block-light-theme-bg);
      font-weight: bold;
      text-align: right;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: smaller;
    }
  }
}

.data-charts {
  h3 {
    position: absolute;
  }

  #chartsFlow {
    width: 100%;
    height: 100%;
  }
}

.yiju {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  

  &__date {
    // color: #0b76da;
    line-height: 1.4;
    border-left: 4px solid var(--primary-color);
    padding-left: 0.6rem;
  }

  &__content {
    height: auto;
    margin: 8px 0;
    overflow: scroll;
    padding: 0;

    &::-webkit-scrollbar { display: none; }
    overflow: -moz-scrollbars-none;
  }

  &__origin {
    font-size: small;
    color: var(--text-color-secondary);
  }
}

.main-container.color-block {
  & > .block {
    // border: none;
    border: 1px solid rgb(44 123 255 / 10%);
    background: linear-gradient(170deg, #fbfeff, #e9f9ff);
  }
  .data-charts { background-image: linear-gradient(170deg, hsl(212deg 100% 99%), hsl(212deg 100% 95%));}

  .yiju { background-image: linear-gradient(153deg, #fafeff, #e5fbff);}
  .pvdata { background-image: linear-gradient(170deg, hsl(160deg 100% 99%), hsl(160deg 100% 96%)); }
  .pie-charts.cpu { background-image: linear-gradient(153deg, #fafcff, #e5f2ff); }
  .pie-charts.mem { background-image: linear-gradient(153deg, #fffbfa, #ffebe5); }
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