<template>
  <div class="login">
    <!-- <div>Login</div> -->
    <form class="login-form">
      <input v-model="formdata.username" type="text" placeholder="Username" required/>
      <input v-model="formdata.password" type="password" placeholder="Password" required/>
      <a-button type="button" @click="formdata.submit" :disabled=formdata.disabled :loading=formdata.loading>Login</a-button>
    </form>
  </div>
</template>

<script lang="ts">
import { message } from 'ant-design-vue';
import { defineComponent, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import cookie from 'js-cookie';
import request from '../utils/request';

export default defineComponent({
  setup() {
    let router = useRouter();

    let formdata = reactive({
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
    display: flex;
    flex-direction: column;
    background: white;
    padding: 40px 30px;
    border-radius: 16px;
    box-shadow: 1px 1px 12px 2px rgba(255, 255, 255, 0.05);

    & > * {
      margin: 10px;
    }

    & > input {
      outline: none;
      border: none;
      border-radius: 0;
      border-bottom: 1px dashed #222;
      padding: 4px 0;

      &:focus {
        border-bottom: 1px solid var(--primary-color);
      }
    }

    & > button {
      margin-top: 20px;
      padding: 5px;
      border-radius: 4px;
      color: white;

      background: var(--primary-color);

      &:disabled {
        background: #888;
        cursor: not-allowed;
      }
    }
  }
}
</style>