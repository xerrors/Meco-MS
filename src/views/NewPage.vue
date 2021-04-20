<template>
  <div class="edit">
    <div class="navbar">
      <h1>编辑文章</h1>
      <div class="nav-actions nav-btn">
        <a-button
          @click="upload(false)"
          :loading="draftBtnStatus != '保存'"
          >{{ draftBtnStatus }}</a-button
        >
        <a-dropdown-button
          type="primary"
          @click="upload(true)"
          :loading="btnStatus != '发布'"
        >
          {{ btnStatus }}
          <template #overlay>
            <a-menu @click="transmit.handleClick">
              <a-menu-item key="https://mp.csdn.net/editor/html">
                转 CSDN
              </a-menu-item>
              <a-menu-item key="https://juejin.cn/editor/drafts/new"> 转 掘金 </a-menu-item>
              <a-menu-item key="https://www.jianshu.com/writer#/">
                转 简书
              </a-menu-item>
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
      autofocus
      right-toolbar="preview toc sync-scroll fullscreen"
      @upload-image="handleUploadImage"
      @save="handleSave"
      :toolbar="toolbar"
    ></v-md-editor>
    <!-- 右侧抽屉弹窗 -->
    <a-drawer
      title="请手动复制以下内容"
      placement="right"
      v-model:visible="transmit.show"
      width="520"
      class="drawer"
    >
      <a-textarea
        class="drawer__textarea"
        @focus="selectText"
        v-model:value="transmit.text"
        placeholder="Autosize height with minimum and maximum number of lines"
        :autoSize="{maxRows: 20}"
        style="margin-bottom: 20px;"
      />
      <a-button style="margin-right: 8px; margin-top: 16px;" @click="transmit.show=false">取消</a-button>
      <a-button type="primary" style="margin-top: 16px;" :href="transmit.target" target="_blank">跳转</a-button>
    </a-drawer>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, onMounted, ref } from "vue";
import request from "../utils/request";
import { parseTime } from "../utils/format";
import { message } from "ant-design-vue";

import { useRoute, useRouter } from "vue-router";

import { useClipboard } from "@vueuse/core";
import { usePermission } from '@vueuse/core'

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
    const draftBtnStatus = ref("保存");

    // myEditer 对象
    const myEditor = reactive({
      text: oriText,

      resetContent: () => {
        myEditor.text = oriText;
      },
    });

    const toolbar = reactive({
      clear: {
        icon: "v-md-icon-clear",
        title: "重置内容",
        action(editor: any) {
          myEditor.resetContent();
          localStorage.removeItem(String(route.params.path));
        },
      },
    });

    const transmit = reactive({
      show: false,
      target: '',
      text: '',
      handleClick: (e) => {
        transmit.target = e.key;
        transmit.text = praseText(myEditor.text);
        const { text, isSupported, copy } = useClipboard()

        if (isSupported) {
          const permissionRead = usePermission('clipboard-read')
          const permissionWrite = usePermission('clipboard-write')
          copy(transmit.text)
          message.success("已经复制到剪贴板，3s后自动跳转~", 3);
          setTimeout(() => {
            window.open(transmit.target);
          }, 3000);
        } else {
          message.error("浏览器不支持 Clipboard API，请手动复制")
          transmit.show = true;
        }
      }
    })

    // 上传
    function upload(compile: boolean) {
      if (compile) {
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
            if (compile) {
              btnStatus.value = "编译中";
            } else {
              draftBtnStatus.value = "保存";
            }
            resolve(res);
          })
          .catch((err) => {
            reject(err);
          });
      });
      // 编译 vuepress
      if (compile) {
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
      }
    }

    // 加载数据
    function loadData(): void {
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
    }

    // 解析文本
    function praseText(result:string):string {

      const coverPatt = /cover:[ ]*.*/;
      const permalinkPatt = /permalink:[ ]*.*/;
      const titlePatt = /title:[ ]*.*/;

      let temp:any;
      var cover: string = "";
      var permalink: string = "";
      var title: string = "";

      function replace_pun(sta_a: string): string {
        return sta_a.replace(" ", "")
                    .replace("'", "")
                    .replace('"', '')
      }

      // 提取封面
      temp = coverPatt.exec(result);
      if (temp) {
        cover = replace_pun(String(temp)).slice(6);
      } else {
        cover = "";
      }
      // 提取链接
      temp = permalinkPatt.exec(result);
      if (temp) {
        permalink = replace_pun(String(temp)).slice(10);
      } else {
        console.log("There is something WRONG!");
      }
      // 提取标题
      temp = titlePatt.exec(result);
      if (temp) {
        title = replace_pun(String(temp)).slice(6);
      } else {
        console.log("There is something WRONG!");
      }

      result = result.replace(/---[\s\S]*---/, "");

      result =
        `本文首发于个人博客：[https://xerrors.fun${permalink}](https://xerrors.fun${permalink})\n\n` +
        `欢迎访问更多文章：[https://xerrors.fun](https://xerrors.fun)\n\n---\n\n` +
        `# ${title}\n\n` +
        result;

      if (cover) {
        result = "![封面](" + cover + ")\n\n" + result;
      }
      return result;
    }

    onMounted(() => {
      // 向服务器获取数据
      console.log(route.params.path);

      loadData();
    });

    return {
      myEditor,
      toolbar,
      upload,
      btnStatus,
      draftBtnStatus,
      transmit,
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
      this.upload(false);
    },
    handleChange(text: string, html: string) {
      localStorage.draft = text;
    },

    onOpenNewPage(link: string): void {
      window.open(link);
    },

    selectText:function(event){
      event.currentTarget.select();
    }
  },
});
</script>

<style lang="scss" scoped>
.nav-actions > * {
  margin-left: 10px;
}

.drawer {
  &__textarea {
    max-height: 100px;
  }
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
