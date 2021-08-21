<template>
  <div class="slides round">
    <div class="logo">
      <div>Meco<span style="color: var(--primary-color)">.</span>ms</div>
      <!-- <img src="https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/test.png" alt="Meco" style="object-fit: contain;"> -->
    </div>

    <div class="button-panel">
      <router-link class="slides-btn" to="/dashboard"><DashboardOutlined />控制台</router-link>
      <router-link class="slides-btn" to="/pages"><FileTextOutlined />文章</router-link>
      <router-link class="slides-btn" to="/messages"><CommentOutlined />消息</router-link>
      <router-link class="slides-btn" to="/server-log"><DatabaseOutlined />访问记录</router-link>
      <router-link class="slides-btn" to="/search"><SearchOutlined />搜索</router-link>
      <router-link class="slides-btn" to="/test-page"><ExperimentOutlined />Lab</router-link>
    </div>

    <div class="bookmarks">
      <div v-if="marks.length != 0" style="font-weight: bold; margin-bottom: 24px;">
        已暂存的书签：
      </div>
      <p class="bookmark"
        v-for="(mark, ind) in marks"
        :key="ind" 
        @click.right="removeBookmark($event, mark.path)"
      >
        <router-link :to="'/edit/'+mark.path"><FileTextOutlined /> {{ mark.title }}</router-link>
      </p>
    </div>

    <div class="logout">
      <button class="slides-btn" @click="logoutObj.showModal"><ImportOutlined />退出登录</button>
      <a-modal
        title="提示"
        :visible="logoutObj.visible"
        :confirm-loading="logoutObj.confirmLoading"
        @ok="logoutObj.logout"
        @cancel="logoutObj.hideModal"
        >
        <p>确认退出登录吗？</p>
      </a-modal>
    </div>
  </div>
</template>

<script lang="ts">
import {
  DashboardOutlined,
  FileTextOutlined,
  CommentOutlined,
  DatabaseOutlined,
  ImportOutlined,
  SearchOutlined,
  ExperimentOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue';
import { defineComponent, reactive, ref } from 'vue'
import Cookies from 'js-cookie';
import request from '../utils/request';

import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { message } from 'ant-design-vue';
export default defineComponent({
  components: {
    DashboardOutlined,
    FileTextOutlined,
    DatabaseOutlined,
    CommentOutlined,
    ImportOutlined,
    SearchOutlined,
    ExperimentOutlined,
    CloseOutlined,
  },
  setup() {
    let router = useRouter();
    let store = useStore();
    let marks = store.state.marks;

    // let slides_state = store.state.show_slides;

    let logoutObj = reactive({
      visible: false,
      confirmLoading: false,
      showModal: () => {
        logoutObj.visible = true;
      },
      hideModal: () => {
        logoutObj.visible = false;
      },
      logout: () => {
        Cookies.remove('logged');
        logoutObj.confirmLoading = true;
        new Promise((resolve, reject) => {
          request({
            url: '/api/admin/logout',
            method: 'post',
          })
          .then(res => {
            message.success(res.data.message);
            logoutObj.confirmLoading = false;
            logoutObj.visible = false
            router.push('/login');
            resolve(res);
          })
          .catch(err => {
            logoutObj.confirmLoading = false;
            // message.error(err.message);
            reject(err);
          })
        })
      }
    })

    let removeBookmark = (e:Event, path:string) => {
      store.commit("delBookmark", path)
      e.preventDefault()
    }

    return {
      logoutObj,
      marks,
      removeBookmark,
      // slides_state,
    }
  }
});
</script>

<style lang="scss" scoped>
.slides.round {
  --slide-margin-width: 24px;
  width: var(--slides-width);
  height: 100vh;
  // height: calc(100vh - var(--slide-margin-width) * 2);
  // width: calc(var(--slides-width) - var(--slide-margin-width));

  // background: rgba(255, 255, 255, 0.8);
  // border: 2px solid #FFFFFF;
  // border-radius: 0 16px 16px 0;
  // margin: var(--slide-margin-width);
  // backdrop-filter: blur(32px);
  // box-shadow: 0px 0px 10px 4px rgb(44 123 255 / 5%);

  background: white;
  
  box-sizing: border-box;
}

.slides {
  position: sticky;
  top: 0;
  
  width: var(--slides-width);
  height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 32px;

  background: white;
  
  .logo, .button-panel, .logout, .bookmarks {
    width: calc(var(--slides-width) - 60px);
  }

  .logo {
    display: flex;
    justify-content: left;
    align-items: center;
    
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 1px;
    color: #333;

    height: var(--navbar-height);
  }

  .button-panel {
    display: flex;
    flex-direction: column;
    align-items: center;

    height: auto;

    .slides-btn {
      // 只适用于侧边栏上侧按钮
      width: 100%;
      gap: 8px;
    }

    .router-link-active {
      background: var(--primary-color);
      color: white;
    }
  }

  .slides-btn {
    display: flex;
    align-items: center;
    border-radius: 4px;
    margin-bottom: 16px;
    padding: 6px 16px;

    color: var(--text-color);
    text-decoration: none;

    font-size: 15px;
    line-height: 24px;

    transition: background .2s ease-in-out;

    &:hover:not(.router-link-active) {
      background: #f0f2f4;
    }

    > span {
      margin-right: 10px;
      font-size: 18px;
    }
  }

  .logout {
    margin-top: 80px;
    margin-bottom: 40px;

    button {
      width: 100%;
      background: none;

      &:hover {
        background: #f0f2fa;
      }

      &:active {
        background: #f0f2fa;
      }

    }
  }
}

.bookmarks {
  margin-top: auto;
  width: 80%;
  .bookmark {
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    position: relative;

    background: white;
    // box-shadow: 1px 1px 10px 2px rgba(0,0,0,0.05);
    margin-top: 8px;
    margin-bottom: 0;
    // padding: 6px 12px;
    // border-radius: 8px;

    & > a {
      color: #333;
    }
  }
}
</style>
