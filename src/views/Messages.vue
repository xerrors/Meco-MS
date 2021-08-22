<template>
  <div class="messages">
    <Navbar>
      <a-button
        type="primary"
        class="nav-btn"
        :loading="data.loading"
        @click="data.markAsReaded('all')"
      >
        全部已读
      </a-button>
      
      <a-button
        type="primary"
        class="nav-btn"
        @click="data.getMsgs"
      >
        <template #icon><SyncOutlined :spin="data.loading" /></template>
      </a-button>
    </Navbar>
    <div class="message-container">
      <!-- <div class="button-list">
        <div class="platforms">
          <div
            v-for="(text, ind) in btn_text"
            :key="ind"
            :class="{ isSelected: ind === selected }"
          >
            {{ text }}
          </div>
        </div>
        <div class="messages-btns">
          <a-button @click="data.markAsReaded('all')">全部已读</a-button>
          <a-button @click="data.getMsgs">
            <template #icon><SyncOutlined :spin="data.loading" /></template>
          </a-button>
        </div>
      </div> -->
      <!-- <a-empty v-if="data.empty" style="margin: 100px" /> -->
      <div v-if="data.msgs[0]" class="msg-lists">
        <div
          class="msg"
          v-for="(msg, ind) in data.msgs[0]"
          :key="ind"
        >
          <span
            class="msg__icon"
            style="color: #333; font-size: 20px; line-height: 0px"
            ><CompassOutlined
          /></span>
          <span class="msg__time">{{ msg.date }}</span>
          <a
            class="msg__text"
            :href="msg.link"
            target="_blank"
            @click="data.markAsReaded(msg.id)"
            >{{ msg.content }}</a
          >
          <a-button
            v-if="!msg.readed"
            type="link"
            class="msg-mark"
            @click="data.markAsReaded(msg.id)"
            >标记已读</a-button
          >
        </div>
      </div>
      <a-divider>以下为已读消息</a-divider>
      <div v-if="data.msgs[1]" class="msg-lists">
        <div
          class="msg readed_msg"
          v-for="(msg, ind) in data.msgs[1]"
          :key="ind"
        >
          <span
            class="msg__icon"
            style="color: #333; font-size: 20px; line-height: 0px"
            ><CompassOutlined
          /></span>
          <span class="msg__time">{{ msg.date }}</span>
          <a class="msg__text" :href="msg.link" target="_blank">{{
            msg.content
          }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref } from "vue";
import request from "../utils/request";
import Navbar from '../components/Navbar.vue';
import { message } from "ant-design-vue";
import { parseTime } from "../utils/format";
import { CompassOutlined, SyncOutlined } from "@ant-design/icons-vue";
export default defineComponent({
  name: "messages",
  components: {
    CompassOutlined,
    SyncOutlined,
    Navbar,
  },
  setup() {
    const btn_text = ref(["总览", "本站", "微信", "知乎", "掘金"]);
    const selected = ref(0);

    const parseMsgs = (msgs: any): any => {
      msgs = msgs.map((item: any) => {
        item.date = parseTime(new Date(item.date));
        return item;
      });
      msgs.reverse();

      const readedMsgs = msgs.filter((item: any) => {
        return item.readed;
      });
      const unreadMsgs = msgs.filter((item: any) => {
        return !item.readed;
      });
      return [unreadMsgs, readedMsgs];
    };

    const data = reactive({
      msgs: [[], []],
      source: "db",
      loading: true,
      empty: computed(() => data.msgs[0].length == 0),
      getMsgs: () => {
        data.loading = true;
        new Promise((resolve, reject) => {
          request({
            url: "/api/admin/messages",
            method: "get",
            params: {
              source: data.source,
            },
          })
            .then((res) => {
              data.msgs = parseMsgs(res.data.data);
              data.loading = false;
              // message.success("刷新完成")
              resolve(res);
            })
            .catch((err) => {
              data.loading = false;
              message.error(err.message);
              reject(err);
            });
        });
      },
      markAsReaded: (id) => {
        new Promise((resolve, reject) => {
          request({
            url: "/api/admin/readmessage",
            method: "post",
            params: {
              id: id,
            },
          }).then((res) => {
            data.msgs = parseMsgs(res.data.data);
            resolve(res);
          });
        });
      },
    });

    data.getMsgs();

    return {
      data,
      selected,
      btn_text,
    };
  },
});
</script>

<style lang="scss" scoped>
.message-container {
  .msg-lists {
    .msg {
      margin-top: 12px;
      padding: 10px 24px;

      background: rgba(255, 255, 255, 0.8);
      border: 1px solid #ffffff;
      box-sizing: border-box;
      box-shadow: 0px 2px 16px rgba(47, 116, 219, 0.05);
      // backdrop-filter: blur(32px);
      /* Note: backdrop-filter has minimal browser support */

      border-radius: 8px;

      display: grid;
      grid-template-columns: 24px 170px auto 100px;
      grid-gap: 24px;

      & > span,
      & > a {
        height: 20px;
        margin: 4px 0;

        font-size: 14px;
        // border: 1px dashed #333;
      }

      // &__time { color: #1d1d1d; }

      &__text {
        color: #222;
        overflow: hidden;
      }

      .msg-mark {
        color: #2f74db;
        height: auto;
      }
    }

    .readed_msg {
      filter: opacity(0.6);
      box-shadow: none;
    }
  }
}
</style>