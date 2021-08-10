<template>
  <div class="slides round">
    <div class="logo">
      <!-- MECO -->
      <img src="https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/test.png" alt="Meco" style="object-fit: contain;">
    </div>

    <div class="button-panel">
      <router-link to="/dashboard"><DashboardOutlined />后台总览</router-link>
      <router-link to="/pages"><FileTextOutlined />文章管理</router-link>
      <router-link to="/messages"><CommentOutlined />消息管理</router-link>
      <router-link to="/server-log"><DatabaseOutlined />访问日志</router-link>
      <router-link to="/search"><SearchOutlined />全局搜索</router-link>
      <router-link to="/test-page"><ExperimentOutlined />测试页面</router-link>
    </div>

    <div class="logout">
      <button @click="logoutObj.showModal"><ImportOutlined />退出登录</button>
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
} from '@ant-design/icons-vue';
import { defineComponent, reactive, ref } from 'vue'
import Cookies from 'js-cookie';
import request from '../utils/request';

import { useRouter } from 'vue-router';
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
  },
  setup() {
    let router = useRouter();

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

    return {
      logoutObj,
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

  background: rgba(255, 255, 255, 0.8);
  border: 2px solid #FFFFFF;
  border-radius: 0 16px 16px 0;
  // margin: var(--slide-margin-width);
  
  box-sizing: border-box;
  // backdrop-filter: blur(32px);

  box-shadow: 0px 0px 10px 4px rgb(44 123 255 / 5%);
}

.slides {
  position: fixed;
  top: 0;
  
  width: var(--slides-width);
  height: 100vh;

  display: flex;
  flex-direction: column;
  align-items: center;

  background: white;

  padding: 60px 0;
  
  .logo, .button-panel {
    width: 200px;
  }

  .logo {
    display: flex;
    justify-content: center;
    
    font-size: 28px;
    font-weight: bold;
    color: #333;

    height: 60px;
  }

  .button-panel {
    display: flex;
    flex-direction: column;
    align-items: center;

    height: auto;

    margin-top: 30px;

    a {
      display: flex;
      align-items: center;
      gap: 8px;

      border-radius: 8px;
      margin: 20px;
      padding: 8px 28px;

      color: #333;
      font-weight: bold;
      text-decoration: none;

      letter-spacing: 2px;

      font-size: 16px;
      line-height: 24px;

      transition: background .2s ease-in-out;

      &:hover:not(.router-link-active) {
        background: #f0f2fa;
      }
    }

    .router-link-active {
      background: #333;
      color: white;
    }
  }

  .logout {
    margin-top: auto;
    margin-bottom: 0;

    button {
      display: flex;
      align-items: center;
      gap: 8px;

      padding: 8px 28px;
      background: none;
      transition: background .2s ease-in-out;
      border-radius: 8px;

      &:hover {
        background: #f0f2fa;
      }

      &:active {
        background: #f0f2fa;
      }

    }
  }
}
</style>
