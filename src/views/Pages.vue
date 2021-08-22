<template>
  <div>
    <Navbar>
      <a-button
        type="primary"
        class="nav-btn"
        @click="routerJump('/edit/draft')"
        ><EditOutlined /> 写文章
      </a-button>
    </Navbar>
    <a-list
      class="demo-loadmore-list pages"
      :loading="data.loading"
      item-layout="horizontal"
      :data-source="data.filted_articles"
    >
      <template #header>
        <h2 class="header-title">
          共 {{ data.filted_articles.length }} 篇文章
        </h2>
        <a-date-picker :value="data.endDate" @change="data.onDateChange" />
        <!-- 搜索框 -->
        <a-input-search
          v-model:value="data.searchKeyword"
          placeholder="搜索"
          style="width: 200px;"
          @search="data.onSearch"
        />
        <a-select
          :value="data.source"
          style="width: 100px"
          ref="select"
          @change="data.getData"
          :loading="data.loading"
        >
          <a-select-option value="db"> 本站 </a-select-option>
          <a-select-option value="csdn"> CSDN </a-select-option>
          <a-select-option value="juejin"> 掘金 </a-select-option>
        </a-select>
      </template>
      <template #renderItem="{ item }">
        <a-list-item>
          <span class="list-date">{{ item.date }}</span>
          <a-list-item-meta>
            <template #title>
              <a v-if="data.source=='db'" @click="routerJump('/edit/' + item.permalink)">{{ item.title }}</a>
              <a v-else :href="item.link" target="_blank">{{ item.title }}</a>
            </template>
            <template #description>
              <EyeOutlined />
              <span class="page-des-icon">{{ item.read_count }}</span>
              <LikeOutlined />
              <span class="page-des-icon">{{ item.like_count }}</span>
              <MessageOutlined />
              <span class="page-des-icon">{{ item.comment_count }}</span>
            </template>
          </a-list-item-meta>
          <template #actions>
            <a v-if="data.source=='db'" @click="routerJump('/edit/' + item.permalink)">编辑</a>
            <a-popconfirm
              v-else
              placement="left"
              title="编辑文章需要在对应平台登录，是否跳转？"
              ok-text="是的"
              cancel-text="取消"
              @confirm="onOpenNewPage(item.edit_link)"
              @cancel="onCancel"
            >
              <a :href="item.edit_link" target="_blank">编辑</a>
            </a-popconfirm>
            <a :href="item.link" target="_blank">查看</a>
            <a-popconfirm
              v-if="data.source=='db'" 
              placement="left"
              title="确定要删除吗？"
              ok-text="删了"
              cancel-text="手滑了"
              @confirm="data.deleteDBFile(item.permalink)"
              @cancel="onCancel"
            >
              <a style="color: var(--error-color)">删除</a>
            </a-popconfirm>
            <a v-else style="color: var(--error-color)">删除</a>
          </template>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, reactive, computed } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import { EyeOutlined, MessageOutlined, LikeOutlined, EditOutlined } from '@ant-design/icons-vue';
import { parseTime, joinPath } from "../utils/format";
import request from "../utils/request";
import Navbar from '../components/Navbar.vue';

export default defineComponent({
  name: "Pages",
  components: {
    EyeOutlined,
    MessageOutlined,
    LikeOutlined,
    EditOutlined,
    Navbar,
  },
  setup() {
    let router = useRouter();

    let data = reactive({
      source: "db",
      articles: [],
      filted_articles: [],
      loading: false,
      endDate: "",
      searchKeyword: "",

      filters: {
        byDate: (item: any): boolean => {
          return true;
        },

        bySearch: (item: any): boolean => {
          return true;
        },
      },

      filterArticles: () => {
        data.filted_articles = data.articles.filter(data.filters.byDate);
        data.filted_articles = data.filted_articles.filter(data.filters.bySearch);
      },

      onSearch: (searchValue: string) => {
        if (searchValue) {
          const keys = searchValue.split(' ');
          data.filters.bySearch = (item) => {
            var info_text = item.title;
            if (data.source === 'db') {
              info_text += item.tags.join(' ') + item.categories;
            }
            for (var i=0;i<keys.length;i++) {
              if (info_text.toLowerCase().search(keys[i].toLowerCase()) == -1) {
                return false;
              }
            }
            return true;
          };
        } else {
          data.filters.bySearch = (): boolean => {
            return true;
          };
        }
        data.filterArticles();
      },

      onDateChange: (selectDate: Date, dateString: string) => {
        data.endDate = dateString;
        if (dateString) {
          data.filters.byDate = (item) => {
            return new Date(item.date) < new Date(dateString);
          };
        } else {
          data.filters.byDate = (): boolean => {
            return true;
          };
        }
        data.filterArticles();
      },

      praseArticles: (articles, source="db"):void => {
        articles = articles.map((item: any) => {
          item.date = parseTime(new Date(item.date));
          if (source == "csdn") {
            item.link = "https://blog.csdn.net/jaykm/article/details/" + item.article_id;
            item.edit_link = "https://editor.csdn.net/md/?articleId=" + item.article_id;
          } else if (source == "juejin") {
            item.link = "https://juejin.cn/post/" + item.article_id;
            item.edit_link = "https://juejin.cn/editor/drafts/" + item.draft_id;
          } else if (source == "db") {
            item.link = joinPath("https://xerrors.fun/", item.permalink);
          }
          return item;
        });
        
        
        articles.sort((a: any, b: any) => {
          return Number(new Date(b.date)) - Number(new Date(a.date));
        });

        data.articles = articles;
        data.filterArticles();
      },

      getData: (source: string) => {
        data.loading = true;
        data.source = source;
        new Promise((resolve, reject): void => {
          request({
            url: "/api/admin/articles",
            method: "get",
            params: { source: source },
          }).then((res) => {
            data.praseArticles(res.data.data, data.source);              
            data.loading = false;
            // message.success("加载完成");
            resolve(res);
          }).catch((err) => {
            reject(err);
          });
        });
      },

      deleteDBFile: (path:string) => {
        new Promise((resolve, reject): void => {
          request({
            url: "/api/admin/articles/remove",
            method: "post",
            params: { path: path }
          }).then(res => {
            message.success(res.data.message);
            data.praseArticles(res.data.data);
            resolve(res);
          }).catch(err => {
            reject(err);
          })
        })
      }
    });

    // data.articles = context.getData(data.source);
    data.getData(data.source);

    let routerJump = (path: string): void => {
      router.push(path);
    };

    return {
      data,
      routerJump,
    };
  },
  methods: {
    onOpenNewPage(link: string): void {
      window.open(link);
    },

    onCancel() {
      message.error("操作取消");
    },
  },
});
</script>

<style lang="scss">
.ant-list .header-title {
  display: inline-block;
}

.ant-list-item,.ant-list-header, .ant-list-footer {
  padding: 12px 16px;
}

.ant-list-item:hover {
  background: white;
}

.list-date {
  width: 150px;
}

.ant-list-item-meta-content {
  display: flex;
}

.ant-list-item-meta-description {
  margin-left: auto;
  display: flex;
  align-items: center;

  & > .page-des-icon {
    width: 25px;
    margin: 0 20px 0 5px;
  }
}

.ant-list-item-meta-title {
  margin: 4px;

  & > a {
    color: rgba(0, 0, 0, 0.8);
  }
}
// 未生效
.ant-popover-inner {
  // backdrop-filter: blur(16px);
  // background: rgba(255, 255, 255, 0.5);
  border: 1px solid white;
  border-radius: 8px;
  box-shadow: 1px 1px 12px 2px rgba(0, 0, 0, 0.05);
}

.ant-select,
.ant-calendar-picker,
.ant-input-search {
  margin-left: 20px;
  float: right;
}
</style>

<style lang="scss" scoped>
.pages {
  padding: 8px 8px;
  background: white;
  border-radius: 8px;
  min-height: 300px;
  // border: 2px solid white;
  box-shadow: 0px 0px 10px 4px rgb(130 130 130 / 5%);
}
</style>