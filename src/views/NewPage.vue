<template>
  <div class="edit">
    <div class="navbar">
      <div class="nav-actions-left">
        <a-button
          class="nav-btn"
          @click="hideSlides"
        >
          <template #icon><MenuOutlined /></template>
        </a-button>
        <a-button
          class="nav-btn back"
          @click="routerBack"
        >
          <template #icon><LeftOutlined /></template>
        </a-button>
        <a-button
          class="nav-btn mark"
          @click="saveAsMark"
        >
          <template #icon><FolderAddOutlined /></template>
        </a-button>
        <div style="display: inline-block">
          <a-input 
            id="pasteInput"
            v-model:value="data.url"
            class="url-input"
            @focus="selectText"
            placeholder="点击这里粘贴图片"
            style="width: 160px;"
            ></a-input>
        </div>
        <a-button
          class="nav-btn"
          @click="activeToolbarItem('upload')"
        >
          <template #icon><CloudUploadOutlined /></template>
        </a-button>
        <a-button
          v-if="data.path == 'draft'"
          class="nav-btn"
          @click="vditor.setValue(data.templates['weekpost'])"
        >
          <template #icon><FileTextOutlined /></template>
        </a-button>
        <a-button
          v-if="data.path == 'draft'"
          class="nav-btn"
          @click="vditor.setValue(data.templates['default'])"
        >
          <template #icon><RestOutlined /></template>
        </a-button>
        <a-button
          class="nav-btn"
          @click="toggleToolbar(!data.toolbar)"
        >
          <template #icon><EllipsisOutlined /></template>
        </a-button>
        <a-button
          class="nav-btn"
          @click="activeToolbarItem('outline')"
        >
          <template #icon><AlignRightOutlined /></template>
        </a-button>
      </div>
      <div class="nav-actions-right">
        <div style="display: inline-block; opacity: 0.5;">{{ status.step_text[status.step] }}</div>
        <div 
          style="
            display: inline-block;
            border-radius: 50%;
            background: #ccc;
            width: 6px; height: 6px;
            margin: 2px;"
          v-if="status.draft" 
          ></div>
        <div style="display: inline-block" class="span-offline" v-if="!online">已离线</div>
        <a-button
          @click="revision"
          :loading="status.step==2"
          :disabled="status.step!=0"
          class="nav-btn"
          >存档</a-button
        >
        <a-button
          type="primary"
          @click="save_and_compile"
          :loading="status.step==3"
          :disabled="status.step!=0"
          class="nav-btn"
          >发布</a-button
        >
      </div>
    </div>
    <div class="editor">
      <div id="vditor"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { message, notification } from "ant-design-vue";
import { computed, defineComponent, onBeforeUnmount, onMounted, onUpdated, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { parseTime } from "../utils/format";
import { parseTemplates, praseText, Item } from "../utils/newpage";
import { useClipboard, useOnline  } from "@vueuse/core";
import { usePermission } from '@vueuse/core'
import { useStore } from "vuex"

import request from "../utils/request";
import PasteImage from "../utils/PasteImage"
import Vditor from 'vditor';

import {
  SaveOutlined,
  LeftOutlined,
  FolderAddOutlined,
  RestOutlined,
  MenuOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  ExportOutlined,
  AlignRightOutlined,
  EllipsisOutlined,
} from '@ant-design/icons-vue';
import { customHash } from "../utils/func";

export default defineComponent({
  name: "server",
  components: {
    SaveOutlined,
    LeftOutlined,
    FolderAddOutlined,
    RestOutlined,
    MenuOutlined,
    FileTextOutlined,
    CloudUploadOutlined,
    ExportOutlined,
    AlignRightOutlined,
    EllipsisOutlined,
  },
  setup() {
    
    const route = useRoute();
    const router = useRouter();
    const store = useStore();

    let localTimer1:NodeJS.Timeout;
    let localTimer2:NodeJS.Timeout;
    let routerJump = (path: string): void => {
      router.push(path);
    };

    let routerBack = () => {
      // 修改返回逻辑，返回之后将不会删除书签，只能手动关闭
      // store.commit("delBookmark", route.params.path)
      router.go(-1);
    }

    let saveAsMark = () => {
      store.commit("addBookmark", {
        title: data.md.title,
        path: route.params.path
      })
      // console.log(store.state.marks);
      router.go(-1);
    }

    let hideSlides = () => {
      store.commit("toggleSlides");
    }

    let activeToolbarItem = (item:string, i:number|null):void => {
      // 对于存在下来菜单的还不知道怎么实现
      const elem = vditor.io.vditor.toolbar.elements[item];
      // elem.firstElementChild.dispatchEvent(new CustomEvent('click'))

      if (item=='fullscreen') {
        toggleToolbar(true);
      }

      if (i != null) {
        elem.firstElementChild.dispatchEvent(new CustomEvent('click'))
        elem.querySelectorAll('button')[i].dispatchEvent(new CustomEvent("click"))
      } else{
        elem.firstElementChild.dispatchEvent(new CustomEvent('click'))
      }
    }

    let toggleToolbar = (s:boolean) => {
      console.log("hidden")
      var ele = document.getElementsByClassName("vditor-toolbar")[0];
      if (s && data.toolbar==false) {
        ele.classList.remove('hidden')
        data.toolbar = true;
      } else {
        ele.classList.add('hidden');
        data.toolbar = false;
      }
    }


    const data = reactive({
      url: "",
      templates: parseTemplates(),
      toolbar: false,
      md: {} as Item,
      path: route.params.path,
    })

    const online = useOnline();

    const status = reactive({
      step_text: ["", "保存中", "修订中", "编译中", "上传中", "加载中", "服务端错误"] as String[],
      step: 0 as Number,
      hash: 0 as Number,
      draft: false,
    })

    const vditor = reactive({
      io: null as null | Vditor,
      updateTime: "",
      setValue: (value:string) => {
        if (vditor.io) {
          vditor.io.setValue(value);
        }
      },
      getValue: ():string => {
        if (vditor.io) {
          return vditor.io.getValue();
        } else {
          return "";
        }
      },
      handleChange: (text: string) => {
        if (vditor.io) {
          status.draft = customHash(vditor.io.getValue()) != status.hash;
        }
      },
      handleUploadImage: () => {},
      handleReset: () => {},
      handleSave: save_draft,
    })

    const initVditor = (path:string|string[]) => {
      vditor.io = new Vditor("vditor", {
        value: data.templates["default"],
        upload: {
          accept: 'image/*',
          filename (name) {
            return name.replace(/\?|\\|\/|:|\||<|>|\*|\[|\]|\s+/g, '-');
          },
          handler: (files:File[]):string => {
            status.step = 4;
            console.log(files);
            upLoadImage(files[0]);
            return String(files[0].name);
          }
        },
        toolbarConfig: {
          pin: true,
        },
        cache: {
          enable: false,
        },
        outline: {
          enable: false,
          position: 'right',
        },
        preview: {
          hljs: {
            lineNumber: true,
          }
        },
        input: vditor.handleChange,
        after: () => {
          toggleToolbar(false);
          loadData(path).then(() => {
            status.step = 0;
            vditor.io && vditor.io.enable();
            localTimer1 = setInterval(() => { save_draft(true) }, 1000);
            localTimer2 = setInterval( test_connection, 20000);
          })
        }
      });
    }

    // 从服务器加载数据
    const loadData = (path:string|string[]) => {
      status.step = 5;
      vditor.io?.disabled();
      vditor.updateTime = parseTime(new Date(), '{h}:{i}:{s}')
      return new Promise((resolve, reject) => {
        request({
          url: "/api/admin/articles/md_source",
          method: "get",
          params: {
            path: path,
          },
        })
          .then((res) => {
            if (res.data.data) {
              vditor.setValue(res.data.data + "\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n");
              data.md = res.data.md;
            } else {
              vditor.setValue(data.templates["default"])
              message.success({ content: "从本地新建~" })
            }
            status.hash = customHash(res.data.data);
            resolve(res);
          })
          .catch((err) => {
            message.error({ content: "所访问的资源不存在" });
            router.push("/edit/draft");
            reject(err);
          });
      });
    }

    
    // 发布到其他平台
    const transmit = reactive({
      show: false,
      target: '',
      text: '',
      handleClick: (e) => {
        transmit.target = e.key;
        transmit.text = praseText(vditor.getValue());

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

    function upLoadImage(image:File, paste:boolean=false):void {
      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/post-image",
          method: "post",
          data: image,
          params: {
            filename: image.name.replace(/\W/g, ''),
            rename_format: '%Y%m%d%H%M%S'
          },
          headers: {
            "Content-Type": "multipart/form-data",
          }
        })
        .then(res => {
          const url = "![图片](" + res.data.data + ")";
          // console.log(res);
          if (vditor.io && !paste) {
            vditor.io.insertValue(url);
          }
          if (paste) {
            data.url = url;
          }
          status.step = 0;
          resolve(url)
        })
        .catch(err => {
          status.step = 0;
          reject(err)
        })
      });
    }

    function praseUploadRes(data:any, revision:boolean, compile:boolean, autosave:boolean=false) {
      if (data.code && data.code == "403") {
        message.error(data.message);
        status.step = 0;
      } else {
        if (revision && route.params.path == 'draft' && data.data) {
          router.push('/edit/' + data.data)
          message.success(data.message);
        } else if (!autosave){
          message.success("文章已自动保存~")
        }

        if (compile) {
          compile_md();
        } else {
          status.step = 0;
        }
      }
    }

    // 上传
    function upload(revision:boolean, compile: boolean, need: boolean=false, autosave:boolean=false) {

      // 保存源文件
      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/articles/md_source",
          method: "post",
          data: vditor.getValue(),
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
            praseUploadRes(res.data, revision, compile, autosave);
            vditor.updateTime = parseTime(new Date(), '{h}:{i}:{s}')
            status.hash = customHash(vditor.getValue());
            status.draft = false;
            resolve(res);
          })
          .catch((err) => {
            message.error("there is something wrong")
            status.step = 0;
            reject(err);
          });
      });
    }

    function compile_md() {
      vditor.io?.disabled();
      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/deploy-vuepress",
          method: "get",
        })
          .then((res) => {
            notification.success({
              message: res.data.message, duration: 0,
            });
            status.step = 0;
            vditor.io && vditor.io.enable();
            resolve(res);
          })
          .catch((err) => {
            notification.error({
              message: "there is something wrong", duration: 0,
            });
            status.step = 0;
            vditor.io && vditor.io.enable();
            reject(err);
          });
      });
    }


    function save_draft(autosave:boolean=false) {
      if (status.step != 0) {
        return
      }
      if (status.step != 6 && online) {
        vditor.updateTime = parseTime(new Date(), '{h}:{i}:{s}')
      }
      if ((status.draft || vditor.io && customHash(vditor.io.getValue()) != status.hash) && online) {
        status.step = 1
        upload(false, false, false, autosave);
      }
    }

    function test_connection() {
      new Promise((resolve, reject) => {
        request({
          url: "/api/admin/test-connect",
          method: "get",
        })
        .then((res) => {
          if (status.step == 6) {
            status.step = 0;
          }
          resolve(res);
        })
        .catch((err) => {
          status.step = 6;
          reject(err)
        })
      })
    }

    function revision() {
      status.step = 2
      upload(true, false)
    }

    function save_and_compile() {
      status.step = 3
      upload(true, true)
    }

    onMounted(() => {
      // 默认关闭侧边栏
      // store.commit("setSlidesState", false);
      initVditor(route.params.path);

      var pasteImage = new PasteImage(document.getElementById('pasteInput'));

      pasteImage.on('paste-image-file', function (image:File) {
        upLoadImage(image, true)
      });
    })


    onBeforeUnmount(() => {
      clearInt();
    })

    const selectText = (e:Event) => {
      e.currentTarget.select();
    }

    const clearInt = () => {
      clearInterval(localTimer1);
      clearInterval(localTimer2);
    }

    return {
      data,
      vditor,
      routerJump,
      status,
      online,
      transmit,
      save_draft,
      revision,
      save_and_compile,
      routerBack,
      saveAsMark,
      selectText,
      activeToolbarItem,
      toggleToolbar,
      initVditor,
      clearInt,
      store,
      router,
      hideSlides,
    };
  },
  beforeRouteUpdate(to,from,next){
    this.clearInt();
    if (this.store.state.marks.length == 0) {
      next("/pages")
    }
    else {
      this.initVditor(to.params.path);
      next()
    }
  },
  beforeRouteLeave (to, from, next) {
    this.clearInt();
    this.save_draft(true);
    next();
  }
});
</script>

<style lang="scss" scoped>
.edit .nav-actions-left {
  & > * {
    margin-right: 10px;
  }
}


.edit {
  .url-input {
    background: rgba(255, 255, 255, 1);
    height: 40px;
  }

  .navbar {
    position: sticky;
    top: 0;
    background: #fafafa;
    z-index: 2;
  }

  .nav-btn, .url-input {
    box-shadow: 2px 2px 14px 2px rgba(168, 168, 168, 0.05);
    border-radius: 4px;
  }

  .nav-btn:not(.ant-btn-primary), .url-input {
      color: var(--heading-color);
      border: 1px solid #f2f2f2;

      &:focus, &:hover {
        background: white;
        box-shadow: 2px 2px 14px 2px rgba(0, 0, 0, 0.05);
      }
  }

  .nav-btn {
    padding: 6px 12px;
    // border: 2px solid white;

    &:not(.ant-btn-primary):hover{
      background: rgba(255, 255, 255, 0.8);
      box-shadow: 2px 2px 14px 2px rgba(0, 0, 0, 0.05);
    }
  }
}

.edit {
  --navbar-height: 60px;
}

.nav-actions-right {
  margin-right: 0;
  margin-left: auto;
  & > * {
    margin-left: 10px;
  }

  .ant-btn.ant-btn-primary {
    padding: 6px 12px;
    height: auto;
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

.vditor {
  border-radius: 4px;
  // border: 2px solid white;
  border: none;
  // box-shadow: 0 2px 12px 0 rgb(0 0 0 / 5%);
  box-shadow: 1px 1px 14px 4px rgb(166 166 166 / 5%);
  // overflow: hidden;
  // height: calc(100vh - var(--navbar-height) - var(--footer-height));
}
</style>


<style lang="scss">
@import url(vditor/dist/index.css);
.vditor-toolbar {
  top: var(--navbar-height);
  padding: 4px 6px;
  backdrop-filter: blur(8px);
}


.edit {
  .vditor-toolbar.hidden {
    display: none;
  }
}

// 样式重新优化
.vditor {
  --toolbar-background-color: #fafafaba;
  --ir-bracket-color: #222;
  --border-color: #f2f3f4;
  --second-color: rgb(147 164 182 / 20%);

  &--fullscreen {
    --toolbar-background-color: rgb(255,255,255);
  }

  .vditor-ir {
    --textarea-background-color: white;

    &__link {
      margin-left: 1px;
      margin-right: 1px;
      text-decoration: none;
      border-bottom: 1px dashed;

      &:hover {
        border-bottom: 1px solid var(--ir-bracket-color);
      }
    }
  }

  .vditor-content {
    background: white;
  }
  

  div.vditor-outline {
    position: sticky;
    top: var(--navbar-height);
    max-height: calc(100vh - var(--navbar-height));;
    padding: 14px 0 0 16px;
    z-index: 2;

    li>span>svg {
      display: none;
    }
  }

  .vditor-reset {
    color: #2d3339;
    font-size: 12pt;
    line-height: 1.7;
    &::-webkit-scrollbar {
      height: 6px !important;
      width: 6px !important;
      cursor: pointer;
      padding: 3px 0;
      &:hover {
        cursor: pointer;
      }
    }
    &::-webkit-scrollbar-button:vertical:end:increment{
      display: block;
      height: 20px;
      background-color: transparent;
    }
    &::-webkit-scrollbar-button:vertical:start:increment{
      display: block;
      height: 20px;
      background-color: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: #eaebec;
      border-radius: 2px;
    }

    h1, h2, h3, h4, h5, h6, p, blockquote {
      color: #2d3339;
      font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji;
    }

    strong {
      margin-right: 1px;
      margin-left: 1px;
    }
  }

  h1, h2, h3, h4, h5, h6 {
    margin-top: 32px;
  }

  .vditor-reset code:not(.hljs).language-yaml:not(.highlight-chroma) {
    padding: 16px;
    background: #f7f7f7;
  }

  .vditor-reset pre>code {
    padding: 1em;
  }

  .hljs {
    background: #f6f8fa;
    
    &::-webkit-scrollbar {
      height: 6px !important;
      width: 6px !important;
      cursor: pointer;
      &:hover {
        cursor: pointer;
      }
    }
    &::-webkit-scrollbar-thumb {
      background: #eaebec;
      border-radius: 2px;
    }
  }
}

.vditor-toolbar__item .vditor-tooltipped {
  width: 24px;
}

.vditor-ir pre.vditor-reset[contenteditable="false"] {
  opacity: 1;
  user-select: none;
  cursor: not-allowed;
  pointer-events:none;
  filter: blur(4px);
}

.vditor-ir .vditor-reset>h1:before, .vditor-ir .vditor-reset>h2:before, .vditor-ir .vditor-reset>h3:before, .vditor-ir .vditor-reset>h4:before, .vditor-ir .vditor-reset>h5:before, .vditor-ir .vditor-reset>h6:before, .vditor-ir div[data-type="link-ref-defs-block"]:before, .vditor-ir div[data-type="footnotes-block"]:before, .vditor-ir .vditor-toc:before {
  margin-left: -24px;
}
</style>