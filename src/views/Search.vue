<template>
  <div>
    <div class="search-comp">
      <h1>全局搜索</h1>
      <div style="height: 90px;">
        <a-input-search
          v-model:value="search.text"
          placeholder="input search text"
          @search="search.onSearch"
        />
      </div>
      <div class="toolkit">
        <span
          :class="{'activate': search.case_sensitive}" 
          @click="handleClick(()=> {search.case_sensitive=!search.case_sensitive})"
        >Aa</span>
      </div>
      <div class="search-rst">
        <div class="res-card" v-for="(res, ind) in search.result" :key="ind">
          <div class="card-header">
            <h3><a :href="'https://www.xerrors.fun/' + res.path" target="_blank">{{ res.title }}</a></h3>
            <div class="actions">
              <a @click="routerJump('/edit/' + res.path)">编辑</a>
            </div>
          </div>
          
          <p>标签：{{ res.tags.join('，') }}</p>
          <p v-for="(t, ind3) in res.res" :key="ind3" v-html="t"></p>
        </div>
      </div>
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
  name: "search",
  setup() {
    function parseHTML (result:string[]) {
      return result.map((item:string) => {
        return item.replaceAll("$START$", '<span style="background: #c2e5f8; padding: 0 2px; border-radius: 4px;">')
            .replaceAll("$END$", '</span>') + "……";
      })
    }

    const search = reactive({
      text: <string>"",
      result: [],
      case_sensitive: false,
      onSearch: () => {
        return new Promise((resolve, reject) => {
          request({
            url: "/api/search",
            params: {
              key: search.text,
              case_sensitive: search.case_sensitive ? "YES": "NO",
            }
          })
          .then((res) => {
            console.log(res.data.data);
            search.result = res.data.data.map((item) => {
              item.res = parseHTML(item.res)
              return item;
            })
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          })
        })
      }
    })

    function handleClick(f) {
      f();
      search.onSearch();
    }
    
    let router = useRouter();
    let routerJump = (path: string): void => {
      router.push(path);
    };
     

    return {
      search,
      handleClick,
      routerJump,
    };
  },
});
</script>



<style lang="scss" scoped>
.search-comp {
  max-width: 900px;
  min-width: 400px;
  margin: 0 auto;

  h1 {
    text-align: center;
    font-weight: 600;
    letter-spacing: 2px;
    margin-top: 100px;
  }

  .ant-input-search {
    margin-top: 40px;
    border-radius: 8px;
    height: 50px;
    
    box-shadow: 1px 1px 14px 4px rgb(44 123 255 / 5%);
  }

  .toolkit {
    margin-top: 20px;
    & > span {
      border-radius: 4px;
      border: 1px solid rgba(118, 185, 221, 0.05);
      padding: 4px 8px;
      cursor: pointer;
      background: #cee5f1;
      margin-right: 16px;

      user-select: none;
    }
    & > span.activate {
      background: #c2e5f8;
      border: 1px solid #76b9dd;
    }
  }
}

.search-rst {
  margin-top: 40px;
  .res-card {
    width: 100%;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid white;
    box-shadow: 1px 1px 14px 4px rgb(44 123 255 / 5%);


    margin-bottom: 20px;
    background: rgb(224, 244, 255);

    div.card-header, p, div.res-tags {
      padding: 12px 16px;
      margin: 0;
    }

    div.card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: rgb(194, 229, 248);
    }

    div.card-header > h3 {
      margin: 0;
      & > a {
        color: #333;
      }
    }

    div.card-header > div.actions {

    }
  }
}
</style>