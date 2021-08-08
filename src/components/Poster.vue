<template>
  <h3>精选管理</h3>
  <a-button shape="circle" size="small" class="add-poster" @click="addPoster">
    <template #icon><PlusOutlined /></template>
  </a-button>
  <a-modal
    title="新建精选"
    v-model:visible="newPoster.visible"
    :confirm-loading="newPoster.confirmLoading"
    @ok="newPoster.handleOk"
  >
  <a-form :model="newPoster.formData" :labelCol="newPoster.labelCol" :wrapperCol="newPoster.wrapperCol">
    <a-form-item label="标题">
      <a-input v-model:value="newPoster.formData.text" />
    </a-form-item>
    <a-form-item label="封面链接" required >
      <a-input v-model:value="newPoster.formData.cover" />
    </a-form-item>
    <a-form-item label="目标地址" required >
      <a-input v-model:value="newPoster.formData.link" />
    </a-form-item>
    <a-form-item label="是否置顶">
      <a-switch v-model:checked="newPoster.formData.top" />
    </a-form-item>
  </a-form>
  </a-modal>
  <div class="posters hide-scrollbar">
    <div class="poster-card" v-for="poster in posters" :key="poster.link">
      <img :src="poster.cover + '?x-oss-process=image/resize,m_fill,h_200,w_600'" alt="cover">
      <span v-if="poster.top" class="top-label"> TOP </span>
      <a-dropdown placement="topRight" class="poster-actions">
        <a-button size="small" shape="circle">
          <template #icon>
            <EllipsisOutlined />
          </template>
        </a-button>
        <template #overlay>
          <a-menu class="poster-overlay">
            <a-menu-item>
              <a @click="setAsTop(poster.id)"> 置顶 </a>
            </a-menu-item>
            <a-menu-item>
              <a @click="removePoster(poster.id)"> 移除 </a>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from 'vue'
import { EllipsisOutlined, PlusOutlined } from '@ant-design/icons-vue'

import request from "../utils/request";
import { message } from 'ant-design-vue';
export default defineComponent({
  name: "poster",
  components: {
    EllipsisOutlined,
    PlusOutlined,
  },
  setup() {    
    const posters = ref([]);

    function prasePosters(posters) {
      const topIndex = posters.findIndex(item => item.top)
      const temp = posters.splice(topIndex, 1)[0]
      posters.unshift(temp)
      console.log(posters)
      return posters;
    }

    function getPosters() {
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/poster",
          method: "get",
        })
          .then((res) => {
            posters.value = prasePosters(res.data.data);
            resolve(res)
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    function removePoster(id:string) {
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/poster",
          method: "delete",
          params: {
            id: id,
          }
        })
          .then((res) => {
            message.success(res.data.message)
            posters.value = prasePosters(res.data.data);
            resolve(res)
          })
          .catch((err) => {
            reject(err);
          });
      });
    }

    function addPoster() {
      newPoster.visible = true;
    }

    function setAsTop(id:string) {
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/poster/settop",
          method: "get",
          params: {
            id: id
          }
        })
          .then((res) => {
            posters.value = prasePosters(res.data.data);
            message.success(res.data.message)
            resolve(res)
          })
          .catch((err) => {
            message.error(err.message);
            reject(err);
          });
      });
    }

    function commitPoster() {
      newPoster.confirmLoading = true;
      new Promise((resolve, reject): void => {
        request({
          url: "/api/admin/poster",
          method: "post",
          data: newPoster.formData
        })
          .then((res) => {
            posters.value = prasePosters(res.data.data);
            newPoster.confirmLoading = false;
            newPoster.visible = false;
            newPoster.formData = {
              text: "",
              link: "",
              cover: "",
              top: false,
            }
            resolve(res)
          })
          .catch((err) => {
            message.error(err.message);
            newPoster.confirmLoading = false;
            reject(err);
          });
      });

    }

    getPosters();


    const newPoster = reactive({
      visible: false,
      confirmLoading: false,
      handleOk: commitPoster,
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      formData: {
        text: "",
        link: "",
        cover: "",
        top: false,
      }
    })

    return {
      posters,
      removePoster,
      addPoster,
      setAsTop,
      newPoster,
    }
  }
  
});
</script>

<style lang="scss" scoped>
h3 {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 0;
  width: fit-content;
  display: inline-block;
}

.add-poster {
  margin-left: auto;
  margin-right: 0;
  float: right;
  font-size: small;
}

.posters {
  margin-top: 0.8rem;
  overflow: scroll;
  max-height: calc(100% - 2rem);

  &::-webkit-scrollbar { width: 0 !important }
  overflow: -moz-scrollbars-none;

  .poster-card {
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 10px;
    position: relative;
    max-width: 100%;
    height: 120px;

    display: flex;
    justify-content: center;

    &:hover .poster-actions {
      opacity: 1;
    }
    

    img {
      object-fit: cover;
    }

    .top-label {
      position: absolute;
      right: 10px;
      top: 10px;

      background: rgb(255, 255, 255);
      padding: 0 6px;
      border-radius: 4px;
      font-weight: bold;
      font-size: small;
      color: #333;
    }

    .poster-actions {
      opacity: 0;
      position: absolute;
      right: 10px;
      bottom: 10px;
      color: #333;

      .poster-overlay:hover {
        display: inherit;
      }

      transition: 0.3s;
    }
  }
}

</style>

<style lang="scss">
.ant-modal-content {
  border-radius: 8px;

  .ant-modal-header {
    border-radius: 8px 8px 0 0;
  }
}
</style>