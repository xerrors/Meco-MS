<template>
  <div class="home">
    <div class="navbar">
      <h1>后台总览</h1>
      <a-button
        type="primary"
        class="nav-btn"
        @click="routerJump('/edit/draft')"
      >
        开始写作
      </a-button>
    </div>
    <div class="main-container">
      <div class="block spc8 spr2 data-charts">
        <h3>数据表现</h3>
        <div id="chartsFlow"></div>
      </div>
      <div class="block spc4 yiju">
        <h3 class="yiju__date">{{ yiju.date }}</h3>
        <div class="yiju__content">{{ yiju.content }}</div>
        <span class="yiju__origin">来自：{{ yiju.origin }}</span>
      </div>
      <div class="block spc4 spr3">
        <Poster ></Poster>
      </div>

      <div class="block spc4 spr3">
        <h3>阅读量文章排行</h3>
        <div class="pv-order-list">
          <div v-for="(a, ind) in articles" :key="ind" class="list-item">
            <span class="list-item-label">{{ ind + 1 }}</span>
            <span class="list-item-title"
              ><a :href="a.link">{{ a.title }}</a></span
            >
            <span class="list-item-count">{{ a.read_count }}</span>
          </div>
        </div>
      </div>

      <div class="block spc4">
        <h3>全部数据</h3>
        <div class="count-block">
          <div class="tiny-block" style="margin-left: 0">
            <div>{{ countAll.all.pv }}</div>
            <h4>访问量</h4>
          </div>
          <div class="tiny-block">
            <div>{{ countAll.all.like }}</div>
            <h4>点赞数</h4>
          </div>
          <div class="tiny-block" style="margin-right: 0">
            <div>{{ countAll.all.comment }}</div>
            <h4>评论数</h4>
          </div>
        </div>
      </div>
      <div class="block spc4">
        <h3>昨日数据</h3>
        <div class="count-block">
          <div class="tiny-block" style="margin-left: 0">
            <div>{{ countAll.day.pv }}</div>
            <h4>访问量</h4>
          </div>
          <div class="tiny-block">
            <div>{{ countAll.day.like }}</div>
            <h4>点赞数</h4>
          </div>
          <div class="tiny-block" style="margin-right: 0">
            <div>{{ countAll.day.comment }}</div>
            <h4>评论数</h4>
          </div>
        </div>
      </div>
      <div class="block spc4">
        <h3>过去 30 天数据</h3>
        <div class="count-block">
          <div class="tiny-block" style="margin-left: 0">
            <div>{{ countAll.month.pv }}</div>
            <h4>访问量</h4>
          </div>
          <div class="tiny-block">
            <div>{{ countAll.month.like }}</div>
            <h4>点赞数</h4>
          </div>
          <div class="tiny-block" style="margin-right: 0">
            <div>{{ countAll.month.comment }}</div>
            <h4>评论数</h4>
          </div>
        </div>
      </div>

      <div class="block spc4 spr2">8</div>
      <div class="block spc4 spr2">9</div>
      <div id="cpuChart" class="block spc2"> </div>
      <div id="memChart" class="block spc2"> </div>
      <div class="block spc2">知乎</div>
      <div class="block spc2">微信</div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref, onBeforeUnmount, onUpdated, reactive } from "vue";
import { useRouter } from "vue-router";
import { joinPath, parseTime } from "../utils/format";

import Poster from '../components/Poster.vue';

import request from "../utils/request";

export default defineComponent({
  name: "dashboard",
  components: {
    Poster,
  },
  setup() {
    let router = useRouter();
    let localTimer: NodeJS.Timeout;

    const routerJump = (path: string): void => {
      router.push(path);
    };

    let cpuChart: { resize: () => void; };
    let memChart: { resize: () => void; };
    let linChart: { resize: () => void; };

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
      month: { pv: 0, like: 0, comment: 0 }
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
            createPieOption(cpuChart, "CPU", serverStatus.value.status[0], "#546fc6", "#bbddff")
            createPieOption(memChart, "MEM", serverStatus.value.status[1], "#cc6670", "#ffbbaa")
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
            createEchartsOption(res.data.data.reverse());
            resolve(res)
          })
          .catch((err) => {
            reject(err);
          });
      });

    }

    function createEchartsOption(daysData:any) {
      const options = {
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
        dataZoom: [
          {
              type: 'slider',
              start: 90,
              end: 100
          }
        ],
        dataset: {
          source: daysData
        },
        series: [
          { name: "阅读量", smooth: true, type: "line", yAxisIndex: 1 },
          { name: "点赞数", smooth: true, type: "line", },
          { name: "评论数", smooth: true, type: "line", },
        ],
      }
      
      //需要获取到element,所以是onMounted的Hook
      // 绘制图表
      linChart.setOption(options);
    }

    function createPieOption(chart, name:string, persent:number, color1:string, color2: string) {
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
      chart.setOption(option);
    }

    function initCharts() {
      let echarts: any = inject("ec"); //引入
      cpuChart = echarts.init(document.getElementById("cpuChart"));
      memChart = echarts.init(document.getElementById("memChart"));
      linChart = echarts.init(document.getElementById("chartsFlow"));
      
      window.onresize = function () {
        cpuChart.resize();
        memChart.resize();
        linChart.resize();
      };

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
          reject(err)
        })
      })
    }

    getCount();
    getArticles();
    getServerStatus();
    getYiju();

    onMounted(() => {
      initCharts()
      getDaysData();
      localTimer = setInterval(getServerStatus, 60000);
    })
    
    onBeforeUnmount(() => {
      clearInterval(localTimer);
    })

    onUpdated(() => {
      getDaysData();
    })

    return {
      routerJump,
      countAll,
      articles,
      serverStatus,
      yiju,
    };
  },
});
</script>

<style lang="scss" scoped>
.main-container > .block {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #ffffff;
  box-sizing: border-box;
  // backdrop-filter: blur(32px);
  box-shadow: 1px 0px 20px 8px rgba(0, 0, 0, 0.05);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 16px;
  padding: 0.75rem 1rem;
}

/* Grid Layout */
.main-container {
  display: grid;

  grid-auto-rows: 140px;
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

.block > h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 0;
}

.count-block {
  display: flex;
  // flex: auto;
  // justify-content: space-between;
  height: auto;

  .tiny-block {
    margin-top: 10px;
  }

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
      color: #0b76da;
      line-height: 2;
      text-align: center;
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
  margin: 0.8rem 0;
  height: calc(100% - 1.6rem);

  &:first-child() {
    color: red;
  }

  &::-webkit-scrollbar { width: 0 !important }
  overflow: scroll;

  .list-item {
    height: 36px;
    width: 100%;
    display: flex;
    // justify-content: center;
    align-items: center;

    .list-item-label {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      margin-right: 10px;
      text-align: center;
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
      background: #dbedff;
      text-align: right;
      padding: 0px 8px;
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
    line-height: 1.2;
    border-left: 4px solid #0b76da;
    padding-left: 0.6rem;
  }

  &__content {
    height: auto;
    margin: 4px 0;
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