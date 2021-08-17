<template>
  <div class="edit">
    <div class="navbar">
      <h1>编辑文章</h1>
      <div class="nav-actions">
        <div 
          style="
            display: inline-block;
            border-radius: 50%;
            background: #ccc;
            width: 6px; height: 6px;
            margin: 2px;"
          v-if="status.unLoad" 
          ></div>
        <div style="display: inline-block" class="span-offline" v-if="status.offline">已离线</div>
        <div style="display: inline-block" >自动保存于：{{ myEditor.update_time }}</div>
        <a-button
          @click="save_draft"
          :loading="myEditor.processing==1"
          :disabled="myEditor.processing!=0 && myEditor.processing!=1"
          >存为草稿</a-button
        >
        <a-button
          @click="revision"
          :loading="myEditor.processing==2"
          :disabled="myEditor.processing!=0 && myEditor.processing!=2"
          >保存修订</a-button
        >
        <a-dropdown-button
          type="primary"
          @click="save_and_compile"
          :disabled="myEditor.processing!=0"
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
    <a-spin :spinning="false">
      <v-md-editor
        v-model="myEditor.text"
        :disabled-menus="[]"
        mode="edit"
        left-toolbar="undo redo | table hr | link image code | save template"
        autofocus
        right-toolbar="preview toc sync-scroll fullscreen"
        @upload-image="handleUploadImage"
        @save="handleSave"
        @change="myEditor.handleChange"
        :toolbar="toolbar"
      ></v-md-editor>
    <!-- 右侧抽屉弹窗 -->
    </a-spin>
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
import { defineComponent, reactive, onMounted, ref, onBeforeUnmount } from "vue";
import request from "../utils/request";
import { formatTime, parseTime } from "../utils/format";
import { message } from "ant-design-vue";

import { useRoute, useRouter } from "vue-router";

import { useClipboard } from "@vueuse/core";
import { usePermission } from '@vueuse/core'
import { resolve } from "node:dns";

export default defineComponent({
  name: "NewPage",
  setup() {

    interface Item {
      title: string;
      date: string;
      permalink: string;
      cover: string;
      tags: string[];
      categories: string;
      abstract?: string;
    }

    const defaultItem:Item = {
      title: "",
      date: parseTime(new Date()),
      permalink: "/draft/",
      cover: "",
      tags: [],
      categories: "" 
    }

    const weekPostItems:Item = {
      title: "",
      date: parseTime(new Date()),
      permalink: "/" + parseTime(new Date(), "{y}-{m}-{d}") +"-week-post/",
      cover: "https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/20210430165756-image.png",
      tags: ["周报"],
      categories: "周报",
      abstract: "摘要"
    }

    const parseItems = (items:Item) => {
      var text: string = "---\n"
      let i:string;
      for (i in items) {
        if (typeof(items[i]) == "string") {
          text += i + ": " + items[i] + "\n";
        } else {
          text += i + ": " + "\n- ";
          text += items[i].join("\n- ")
          text += "\n"
        }
      }
      text += "\n---\n"

      console.log(text)
      return text
    }

    const templates = {
      "default": parseItems(defaultItem),
      "weekpost": parseItems(weekPostItems)
    }

    // console.log(templates);

    let route = useRoute();
    let router = useRouter();

    let localTimer: NodeJS.Timeout;

    const btnStatus = ref("发布");

    const status = reactive({
      offline: false,
      btn: "发布",
      unLoad: false,
    })

    // myEditor 对象
    const myEditor = reactive({
      text: templates['default'],
      loading: true,
      hash: 0,
      processing: 0,
      update_time: 'none',

      resetContent: (text:string) => {
        myEditor.text = text;
      },
      
      handleChange: (text: string, html: string) => {
        // console.log(text)
        // localStorage.draft = text;
        status.unLoad = customHash(myEditor.text) != myEditor.hash;
      },
    });

    const toolbar = reactive({
      clear: {
        icon: "v-md-icon-clear",
        title: "重置内容",
        action(editor: any) {
          myEditor.resetContent(templates['default']);
          localStorage.removeItem(String(route.params.path));
        },
      },
      template: {
        title: "使用模板",
        icon: "v-md-icon-tip",
        menus: [
          {
            name: "默认",
            text: "默认模板",
            action() {
              myEditor.resetContent(templates['default']);
            }
          }, 
          {
            name: "周报",
            text: "周报模板",
            action() {
              myEditor.resetContent(templates['weekpost']);
            }
          }
        ]
      }
    });

    // 发布到其他平台
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

    // 上传资源
    function praseUploadRes(data:any, revision:boolean, compile:boolean) {
      if (data.code && data.code == "403") {
        message.error(data.message)
        btnStatus.value = "发布";
        myEditor.processing = 0;
      } else {
        if (revision && route.params.path == 'draft' && data.data) {
          router.push('/edit/' + data.data)
          message.success(data.message);
        } else {
          message.success("文章已自动保存~")
        }

        if (compile) {
          btnStatus.value = "编译中";
          compile_md();
        } else {
          myEditor.processing = 0;
        }
      }
    }

    // 上传
    function upload(revision:boolean, compile: boolean, need: boolean=false) {
      if (compile) {
        btnStatus.value = "上传中";
        myEditor.loading = true;
      }

      // 保存源文件
      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/articles/md_source",
          method: "post",
          data: myEditor.text,
          headers: {
            "Content-Type": "text/plain",
          },
          params: {
            path: route.params.path,
            revision: revision ? 1 : 0,
            need: need ? 1 : 0,
          },
        })
          .then((res) => {
            praseUploadRes(res.data, revision, compile);
            myEditor.update_time = parseTime(new Date(), '{h}:{i}:{s}')
            myEditor.hash = customHash(myEditor.text)
            status.offline = false;
            status.unLoad = false;
            resolve(res);
          })
          .catch((err) => {
            message.error("there is something wrong")
            myEditor.processing = 0;
            status.offline = true;
            reject(err);
          });
      });
    }

    function compile_md() {
      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/deploy-vuepress",
          method: "get",
        })
          .then((res) => {
            message.success(res.data.message);
            btnStatus.value = "发布";
            myEditor.processing = 0;
            myEditor.loading = false;
            status.offline = false;
            resolve(res);
          })
          .catch((err) => {
            message.error("there is something wrong")
            myEditor.processing = 0;
            myEditor.loading = false;
            reject(err);
          });
      });
    }

    // 加载数据
    function loadData(): void {
      myEditor.update_time = parseTime(new Date(), '{h}:{i}:{s}')
      const key: string = "load_data";
      message.loading({ content: "正在向服务器获取数据……", key });
      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/articles/md_source",
          method: "get",
          params: {
            path: route.params.path,
          },
        })
          .then((res) => {
            myEditor.loading = false;
            if (res.data.data) {
              myEditor.text = res.data.data;
              message.success({ content: "加载成功~", key });
            } else {
              message.success({ content: "从本地新建~", key })
            }
            
            myEditor.hash = customHash(myEditor.text)
            status.offline = false;
            resolve(res);
          })
          .catch((err) => {
            myEditor.loading = false;
            message.error({ content: "所访问的资源不存在", key });
            router.push("/edit/draft");
            reject(err);
          });
      });
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

    function save_draft() {
      if (!Boolean(status.offline)) {
        myEditor.update_time = parseTime(new Date(), '{h}:{i}:{s}')
      }
      if (status.unLoad) {
        myEditor.processing = 1
        upload(false, false)
      }
      else {
        new Promise((resolve, reject) => {
          request({
            url: "/api/admin/test-connect",
            method: "get",
          })
          .then((res) => {
            status.offline = false;
            resolve(res);
          })
          .catch((err) => {
            status.offline = true;
            reject(err)
          })
        })
      }
    }

    function revision() {
      myEditor.processing = 2
      upload(true, false)
    }

    function save_and_compile() {
      myEditor.processing = 3
      upload(true, true)
    }

    // 此哈希函数来源于提问的解答：
    // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    function customHash (str:string) {
      var hash = 0, i, chr;
      for (i = 0; i < str.length; i++) {
        chr   = str.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }

    onBeforeUnmount(() => {
      clearInterval(localTimer);
    })
    
    onMounted(() => {
      // 向服务器获取数据
      console.log(route.params.path);
      loadData();
      localTimer = setInterval(save_draft, 8000);
    });

    return {
      myEditor,
      status,
      toolbar,
      btnStatus,
      transmit,
      save_draft,
      revision,
      save_and_compile,
    };
  },
  methods: {
    handleUploadImage(event: any, insertImage: any, files: any) {
      // 拿到 files 之后上传到文件服务器，然后向编辑框中插入对应的内容
      // console.log(files);
      this.myEditor.loading = true;

      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/post-image",
          method: "post",
          data: files[0],
          params: {
            filename: files[0].name.replace(/\W/g, ''),
            rename_format: '%Y%m%d%H%M%S'
          },
          headers: {
            "Content-Type": "multipart/form-data",
          }
        })
        .then(res => {
          console.log(res)
          insertImage({
            url: res.data.data,
            desc: '图片',
          });
          
          this.myEditor.loading = false;
          resolve(res)
        })
        .catch(err => {
          this.myEditor.loading = false;
          reject(err)
        })
      })
    },

    handleSave(text: string, html: string) {
      this.save_draft();
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
.nav-actions {
  margin-right: 0;
  margin-left: auto;
  & > * {
    margin-left: 10px;
  }

  .ant-btn {
    background: #e9fafe;
    padding: 4px 16px;
    height: auto;
  }

  .ant-btn, .ant-btn-group {
    overflow: hidden;
    border-radius: 8px;

    border: 2px solid white;
  }

  .span-offline {
    background: rgb(214, 65, 65);
    border-radius: 8px;
    border: 2px solid white;
    color: white;
    padding: 2px 8px;
    box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  }
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
  // min-height: calc(100vh - var(--navbar-height) - var(--footer-height));
  height: calc(100vh - var(--navbar-height) - var(--footer-height));

  border-radius: 16px;
  border: 2px solid white;
  box-shadow: 0 2px 12px 0 rgb(0 0 0 / 10%);
  overflow: hidden;

  textarea {
    font-size: 11pt;
    line-height: 1.7;
  }

  &__toolbar {
    position: sticky;
    top: 0;
    z-index: 90;
    background: white;
  }
}
</style>
