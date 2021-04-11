<template>
  <div class="edit">
    <div class="navbar">
      <h1>编辑文章</h1>
      <a-button
        class="nav-btn"
        @click="myEditor.upload"
        :loading="buttonStatus!='发布'"
        >{{ buttonStatus }}</a-button
      >
    </div>
    <!-- config: https://code-farmer-i.github.io/vue-markdown-editor/zh/ -->
    <v-md-editor
      v-model="myEditor.text"
      :disabled-menus="[]"
      mode="edit"
      right-toolbar="preview toc sync-scroll fullscreen"
      @upload-image="handleUploadImage"
      @save="handleSave"
      :toolbar="toolbar"
    ></v-md-editor>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, ref } from "vue";
import request from "../utils/request";
import { parseTime } from "../utils/format";
import { message } from "ant-design-vue";

import { useRoute, useRouter } from "vue-router";

export default defineComponent({
  name: "NewPage",
  setup() {
    const date: string = parseTime(new Date());
    const oriText: string =
      "---\ntitle: \ndate: " +
      date +
      "\npermalink: /draft\ncover: \ntags: \n- \ncategories: \n\n---\n";

    let route = useRoute();
    let router = useRouter();

    const buttonStatus = ref("发布")

    // myEditer 对象
    let myEditor = reactive({
      text: oriText,

      resetContent: () => {
        myEditor.text = oriText;
      },

      upload: () => {
        buttonStatus.value = "上传中"
        console.log(myEditor.text);
        // 保存源文件
        new Promise((resolve, reject): void => {
          request({
            url: "/api/admin/articles/md_source",
            method: "post",
            data: myEditor.text,
            headers: {
              "Content-Type": "text/plain",
            },
            params: {
              path: route.params.path,
            },
          })
            .then((res) => {
              message.success(res.data.message);
              buttonStatus.value = "编译中"
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        });
        // 编译 vuepress
        new Promise((resolve, reject): void => {
          request({
            url: "/api/admin/deploy-vuepress",
            method: "get",
          })
            .then((res) => {
              message.success(res.data.message);
              buttonStatus.value = "发布"
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        });
      },
    });

    let toolbar = reactive({
      clear: {
        icon: "v-md-icon-clear",
        title: "重置内容",
        action(editor: any) {
          myEditor.resetContent();
          localStorage.removeItem(String(route.params.path));
        },
      },
    });

    onMounted(() => {
      // 向服务器获取数据
      console.log(route.params.path);

      const key: string = "load_data";
      if (route.params.path == "draft") {
        if (localStorage.getItem("draft")) {
          myEditor.text = localStorage.getItem("draft") || "";
        }
      } else {
        message.loading({ content: "正在向服务器获取数据……", key });
        new Promise((resolve, reject): void => {
          request({
            url: "/api/admin/articles/md_source",
            method: "get",
            params: {
              path: route.params.path,
            },
          })
            .then((res) => {
              myEditor.text = res.data.data;
              message.success({ content: "加载成功~", key });
              resolve(res);
            })
            .catch((err) => {
              message.error({ content: "所访问的资源不存在", key });
              router.push("/edit/draft");
              reject(err);
            });
        });
      }
    });

    return {
      myEditor,
      toolbar,
      buttonStatus,
    };
  },
  methods: {
    handleUploadImage(event: any, insertImage: any, files: any) {
      // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
      console.log(files);

      // // 此处只做示例
      // insertImage({
      //   url:
      //     'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1269952892,3525182336&fm=26&gp=0.jpg',
      //   desc: '七龙珠',
      //   // width: 'auto',
      //   // height: 'auto',
      // });
    },
    handleSave(text: string, html: string) {
      localStorage.draft = text;
    },
  },
});
</script>

<style lang="scss">
.v-md-editor {
  box-shadow: none;
  min-height: calc(100vh - var(--navbar-height) - var(--footer-height));
}
</style>
