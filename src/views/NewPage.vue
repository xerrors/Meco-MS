<template>
  <div class="edit">
    <div class="navbar">
      <h1>编辑文章</h1>
      <div class="nav-actions nav-btn">
        <a-button
          @click="myEditor.saveDraft"
          :loading="draftBtnStatus != '保存草稿'"
          >{{ draftBtnStatus }}</a-button
        >
        <a-dropdown-button
          type="primary"
          @click="myEditor.upload"
          :loading="btnStatus != '发布'"
        >
          {{ btnStatus }}
          <template #overlay>
            <a-menu @click="toOtherPlat">
              <a-menu-item key="https://mp.csdn.net/editor/html">
                转 CSDN
              </a-menu-item>
              <a-menu-item key="https://juejin.cn">
                转 掘金
              </a-menu-item>
              <!-- <a-menu-item key="https://zhuanlan.zhihu.com/write">
                转 知乎(知乎暂不支持使用markdown)
              </a-menu-item> -->
            </a-menu>
          </template>
        </a-dropdown-button>
      </div>
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
import { useClipboard } from "@vueuse/core";

export default defineComponent({
  name: "NewPage",
  setup() {
    const date: string = parseTime(new Date());
    const oriText: string =
      "---\ntitle: \ndate: " +
      date +
      "\npermalink: /draft/\ncover: \ntags: \n- \ncategories: \n\n---\n";

    let route = useRoute();
    let router = useRouter();

    const btnStatus = ref("发布");
    const draftBtnStatus = ref("保存草稿");

    // myEditer 对象
    let myEditor = reactive({
      text: oriText,
      draft: false,

      resetContent: () => {
        myEditor.text = oriText;
      },

      saveDraft: () => {
        message.success("功能开发中~");
        myEditor.draft = true;
      },

      publish: () => {
        myEditor.draft = false;
      },

      upload: () => {
        if (!myEditor.draft) {
          btnStatus.value = "上传中";
        } else {
          draftBtnStatus.value = "上传中";
        }

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
              if (!myEditor.draft) {
                btnStatus.value = "编译中";
              } else {
                draftBtnStatus.value = "保存草稿";
              }
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
              btnStatus.value = "发布";
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
      btnStatus,
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

    onOpenNewPage(link: string): void {
      window.open(link);
    },

    toOtherPlat(e:any): void {
      var result = this.myEditor.text;

      const coverPatt = /cover:[ ]*.*/;
      const permalinkPatt = /permalink:[ ]*.*/;

      var cover: string = "";
      var permalink: string = "";

      var temp = coverPatt.exec(result);
      if (temp) {
        cover = String(temp).replace(" ", "").slice(6);
      } else {
        cover = "";
      }

      var temp = permalinkPatt.exec(result);
      if (temp) {
        permalink = String(temp).replace(" ", "").slice(10);
      } else {
        console.log("There is something WRONG!");
      }

      result = result.replace(/---[\s\S]*---/, "");

      result =
        `本文首发于个人博客：[https://xerrors.fun${permalink}](https://xerrors.fun${permalink})\n\n` +
        `欢迎访问更多文章：[https://xerrors.fun](https://xerrors.fun)\n\n---\n\n` +
        result;

      if (cover) {
        result = "![封面](" + cover + ")\n\n" + result;
      }

      const { text, isSupported, copy } = useClipboard();
      copy(result);
      message.success("已经复制到剪贴板，去粘贴吧！", 3);
      setTimeout(() => {
        this.onOpenNewPage(e.key);
      }, 3000);
    },
  },
});
</script>

<style lang="scss" scoped>
.nav-actions > * {
  margin-left: 10px;
}
</style>

<style lang="scss">
.v-md-editor {
  box-shadow: none;
  min-height: calc(100vh - var(--navbar-height) - var(--footer-height));

  &__toolbar {
    position: sticky;
    top: 0;
    z-index: 90;
    background: white;
  }
}
</style>
