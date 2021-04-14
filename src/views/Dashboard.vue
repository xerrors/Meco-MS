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
      <h3>数据表现图表</h3>
      <div></div>
    </div>
    <div class="block spc4">
      <h3>近24h，一周，一个月的阅读量</h3>
    </div>
    <div class="block spc4 spr3">
      <h3>头图管理</h3>
    </div>

    <div class="block spc4 spr3">
      <h3>阅读量文章排行</h3>
      <div class="pv-order-list">
        <div v-for="(a, ind) in articles" :key="ind" class="list-item">
          <span class="list-item-label">{{ ind+1 }}</span>
          <span class="list-item-title"><a :href="a.link">{{ a.title }}</a></span>
          <span class="list-item-count">{{ a.read_count }}</span>
        </div>
      </div>
    </div>

    <div class="block spc4">
      <h3>全部数据</h3>
      <div class="count-block">
        <div class="tiny-block" style="margin-left: 0;">
          <div>{{ countAll.all.pv }}</div>
          <h4>访问量</h4>
        </div>
        <div class="tiny-block">
          <div>{{ countAll.all.like }}</div>
          <h4>点赞数</h4>
        </div>
        <div class="tiny-block" style="margin-right: 0;">
          <div>{{ countAll.all.comment }}</div>
          <h4>评论数</h4>
        </div>
      </div>
    </div>
    <div class="block spc4">
      <h3>昨日数据</h3>
      <div class="count-block">
        <div class="tiny-block" style="margin-left: 0;">
          <div>{{ countAll.day.pv }}</div>
          <h4>访问量</h4>
        </div>
        <div class="tiny-block">
          <div>{{ countAll.day.like }}</div>
          <h4>点赞数</h4>
        </div>
        <div class="tiny-block" style="margin-right: 0;">
          <div>{{ countAll.day.comment }}</div>
          <h4>评论数</h4>
        </div>
      </div>
    </div>
    <div class="block spc4">
      <h3>过去 30 天数据</h3>
      <div class="count-block">
        <div class="tiny-block" style="margin-left: 0;">
          <div>{{ countAll.month.pv }}</div>
          <h4>访问量</h4>
        </div>
        <div class="tiny-block">
          <div>{{ countAll.month.like }}</div>
          <h4>点赞数</h4>
        </div>
        <div class="tiny-block" style="margin-right: 0;">
          <div>{{ countAll.month.comment }}</div>
          <h4>评论数</h4>
        </div>
      </div>
    </div>


    <div class="block spc4 spr2">
      8
    </div>
    <div class="block spc4 spr2">
      9
    </div>
    <div class="block spc2">
      CSDN
    </div>
    <div class="block spc2">
      掘金
    </div>
    <div class="block spc2">
      知乎
    </div>
    <div class="block spc2">
      微信
    </div>
  </div>
</div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { joinPath } from "../utils/format";

import request from "../utils/request";

export default defineComponent({
  name: "dashboard",
  setup() {
    let router = useRouter();

    const routerJump = (path:string):void => {
      router.push(path);
    };

    const countAll = ref({})
    const articles = ref([])

    let echarts:any = inject("ec");//引入
    onMounted(() => {//需要获取到element,所以是onMounted的Hook
      let myChart = echarts.init(document.getElementById("chartsFlow"));
      // 绘制图表
      myChart.setOption({
        tooltip: {},
        legend: {},
        grid: {
          left: 30,
          right: 20,
          top: '15%',
          bottom: '10%'
        },
        xAxis: {
          data: ["12-3", "12-4", "12-5", "12-6", "12-7", "12-8"],
        },
        yAxis: [{},{}],
        series: [
          {
            name: "评论数",
            type: "line",
            data: [5, 20, 36, 10, 10, 20],
          },
          {
            name: "阅读量",
            type: "line",
            data: [10, 50, 23,62, 20, 50],
          },
          {
            name: "点赞数",
            type: "line",
            data: [15, 40, 28, 37, 41, 18],
          },
        ],
      });
      window.onresize = function () {//自适应大小
        myChart.resize();
      };
    });

    function getCount() {
      return new Promise((resolve, reject) => {
        request({
          url: "/api/admin/count/all",
          method: "GET",
        }).then(res => {
          countAll.value = res.data.data;
          resolve(res);
        }).catch(err => {
          reject(err);
        })
      })
    }

    function getArticles() {
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/articles",
          method: "get",
          params: { source: 'db' },
        })
          .then((res) => {
            let temp = res.data.data.map((item:any) => {
              item.link = joinPath("https://xerrors.fun/", item.permalink);
              return item;
            });
            temp.sort((a:any, b:any) => {
              return Number(b.read_count) - Number(a.read_count)
            })
            articles.value = temp.slice(0,9)
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    getCount();
    getArticles();


    return {
      routerJump,
      countAll,
      articles,
    }
  }
})
</script>

<style lang="scss" scoped>
.main-container > .block {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #FFFFFF;
  box-sizing: border-box;
  // backdrop-filter: blur(32px);
  box-shadow: 1px 0px 20px 8px rgba(0,0,0,0.05);
  /* Note: backdrop-filter has minimal browser support */

  border-radius: 16px;
  padding: 0.75rem 1rem;
}

/* Grid Layout */
.main-container {
  display: grid;

  grid-auto-rows: 130px;
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
      text-align: center
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
  padding: 0.8rem 0;

  &:first-child {
    color: red;
  }

  .list-item {
    height: 40px;
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
      font-size: small;
      line-height: 20px;
    }

    .list-item-title {
      width: 100%;
      word-break:keep-all;
      white-space:nowrap;
      overflow:hidden;
      text-overflow:ellipsis;
    }

    .list-item-count {
      margin-left: auto;
      background: rgb(228, 243, 226);
      text-align: right;
      padding: 0px 8px;
      border-radius: 4px;

    }
  }
}

#chartsFlow {
  width: 100%;
  height: calc(100% - 25px);
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