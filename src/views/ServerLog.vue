<template>
  <div class="server-log">
    <Navbar>
      <a-button
        type="primary"
        class="nav-btn"
        :loading="status.loading"
        @click="pv_logs.get_page_view_all"
      >
        加载更多
      </a-button>
      
      <a-button
        type="primary"
        class="nav-btn"
        @click="pv_logs.get_page_view_all(true)"
      >
        <template #icon><SyncOutlined :spin="status.loading" /></template>
      </a-button>
    </Navbar>
    <div class="log-content">
      <a-table
        :columns="pv_logs.col" 
        :data-source="pv_logs.value"
        :pagination="{ pageSize: 20 }"
        >
      
        <template #path="{ text }">
          <router-link :to="'/edit/'+text">{{ text }}</router-link>
        </template>

      </a-table>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import request from "../utils/request";
import { message } from "ant-design-vue";
import { parseTime } from "../utils/format";
import { rejects } from "node:assert";

import { CompassOutlined, SyncOutlined } from "@ant-design/icons-vue";
import Navbar from '../components/Navbar.vue';

export default defineComponent({
  name: "serverlog",
  components: {
    SyncOutlined,
    Navbar,
  },
  setup() {
    const pv_logs = reactive({
      value: [],
      col: [
        {
          title: '时间',
          key: 'date',
          dataIndex: 'date',
          width: 180,
        },
        {
          title: 'IP',
          key: 'ip',
          dataIndex: 'ip',
          // width: 150,
        },
        {
          title: '用户代理',
          key: 'ua',
          dataIndex: 'user_agent',
          width: 150,
        },
        {
          title: '路径',
          key: 'path',
          dataIndex: 'path',
          slots: { customRender: 'path' },
        },
      ],
      get_page_view_all: (reset:Boolean=false) => {
        status.loading = true;

        if (reset==true) {
          pv_logs.value = [];
        }

        new Promise((resolve, rejects) => {
          request({
            url: "/api/admin/page-view-log/all",
            method: "get",
            params: {
              cursor: Math.floor(pv_logs.value.length / 100)
            }
          })
            .then((res) => {
              status.loading = false;
              // message.success("加载完成");
              pv_logs.value = pv_logs.value.concat(parseLogs(res.data.data));
              resolve(res);
            })
            .catch((err) => {
              status.loading = false;
              message.error(err.message);
              rejects(err);
            });
        })
      }
    })
    const status = reactive({
      loading: true
    })

    function parseLogs(logs) {
      var logs_fmted = logs.map((item:any) => {
        item.date = parseTime(new Date(item.date));
        item.key = String(item.id);
        return item;
      });
      return logs_fmted;
    }

    pv_logs.get_page_view_all();

    return {
      pv_logs,
      status,
    }

  }
})
</script>

<style lang="scss" scoped>
.log-content {
  border-radius: 4px;
  overflow: hidden;
  background: white;
  // background: rgba(255, 255, 255, 0.8);
  // border: 2px solid white;
  box-shadow: 0px 0px 10px 2px rgb(130 130 130 / 5%);
  padding: 8px 16px;
  margin-bottom: 16px;
}

</style>

<style lang="scss">
.log-content {
  .ant-table {
    background: none;
  }
  .ant-table-thead > tr > th {
    font-size: 1rem;
    font-weight: bold;
    background: none;
  }
}
</style>