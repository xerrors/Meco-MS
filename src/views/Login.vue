<template>
  <div class="login">
    <div class="login-bg2"></div>
    <form class="login-form">
      <h2>Meco 后台管理系统</h2>
      <input v-model="formdata.username" type="text" placeholder="账户" required/>
      <input v-model="formdata.password" type="password" placeholder="密码" required/>
      <a-button type="primary" @click="formdata.submit" :disabled=formdata.disabled :loading=formdata.loading>进入系统</a-button>
    </form>
  </div>
</template>

<script lang="ts">
import { message } from 'ant-design-vue';
import { defineComponent, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import cookie from 'js-cookie';
import request from '../utils/request';

import { onKeyStroke } from '@vueuse/core';

export default defineComponent({
  setup() {
    let router = useRouter();
    

    let formdata:any = reactive({
      username: '',
      password: '',
      loading: false,
      disabled: computed(() => {
        return ! (Boolean(formdata.username) && Boolean(formdata.password));
      }),
      submit: () => {
        formdata.loading = true;
        new Promise((resolve, reject): void => {
          request({
            url: '/api/admin/login',
            method: 'post',
            data: {
              username: formdata.username,
              password: formdata.password,
            },
            headers: { 
              'Content-Type': 'application/json'
            },
          })
          .then(res => {
            if (res.data.code != '1000') {
              message.error(res.data.message);
            } else {
              message.success(res.data.message);
              cookie.set('logged', '1')
              router.push('/dashboard');
            }
            formdata.loading = false;
            resolve(res);
          })
          .catch(err => {
            message.error(err.message);
            formdata.loading = false;
            reject(err);
          })
        });
      },
    });

    onKeyStroke('Enter', (e: KeyboardEvent) => {
      formdata.submit();
    })

    return {
      formdata,
    }
  }
})
</script>

<style lang="scss" scoped>
.login {
  display: flex;
  flex-direction: column;
  height: 100vh;

  align-items: center;
  justify-content: center;

  .login-form {
    width: 300px;
    height: 370px;
    position: relative;
    // z-index: 3;
    display: flex;
    flex-direction: column;
    backdrop-filter: blur(32px);
    background: rgba(255,255,255,0.7);
    border: 4px solid white;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 1px 1px 12px 2px rgba(255, 255, 255, 0.05);

    h2 {
      text-align: center;
      font-weight: bold;
      margin-bottom: 50px;
    }

    & > * {
      margin: 10px;
    }

    & > input {
      outline: none;
      border: none;
      font-size: 1rem;
      border-radius: 0;
      border-bottom: 2px dashed #222;
      padding: 4px 0;
      background: none;

      &:focus {
        border-bottom: 2px solid var(--primary-color);
      }

      &::placeholder {
        color: #222;
      }
    }

    & > button {
      margin-top: 20px;
      padding: 10px;
      border: none;
      border-radius: 4px;
      color: white;
      height: auto;
      box-shadow: 1px 1px 10px 2px rgba(24, 144, 255, 0.5);

      background: var(--primary-color);

      &:disabled {
        box-shadow: none;
        cursor: not-allowed;
        border: none;
      }
    }
  }
  .login-bg2 {
    z-index: -1;
    position: absolute;
    left: calc(50% - 150px + 40px);
    top: calc(50% - 175px + 40px);
    border-radius: 16px;
    border: 4px solid white;
    width: 300px;
    height: 370px;
    background: var(--primary-color);
  }
}
</style>