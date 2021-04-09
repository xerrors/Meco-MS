<template>
  <div>
    <div class="navbar">
      <h1>测试页面</h1>
    </div>
    <div>
      <h1>点赞评论测试页面</h1>
      <input type="text" v-model="path" />
      <div class="comment-box">
        <div :class="{ 'edit-area': true, 'hidden-comment': commenter.hidden }">
          <div class="input-area">
            <a-textarea
              maxlength="1024"
              placeholder="Comment text."
              :autoSize="{ minRows: 2 }"
              spellcheck="false"
              v-model:value="commenter.content"
            ></a-textarea>
            <div class="info-inputs">
              <input
                class="info-name"
                placeholder="Name"
                spellcheck="false"
                v-model="commenter.params.reviewer"
              />
              <input
                class="info-email"
                placeholder="Mail"
                spellcheck="false"
                v-model="commenter.params.reviewer_mail"
              />
            </div>
          </div>
          <div class="action-btns">
            <button class="btn-like" @click="commenter.addLike">
              鼓励一下
            </button>
            <button class="btn-close" @click="commenter.hiddenPanel">
              收起
            </button>
            <a-button
              class="btn-comment"
              @click="commenter.showCommentBox"
              :loading="commenter.loading && !commenter.hidden"
            >
              评论一下
            </a-button>
          </div>
        </div>
      </div>
      <div class="comments">
        <div
          v-for="msg in commentResult.comments"
          :key="msg.id"
          class="comment-card"
        >
          <div class="msg-card">
            <div class="comment-header">
              <span class="comment-header-name">{{ msg.reviewer }}</span>
              <!-- <span class="comment-header-mail">{{ msg.reviewer_mail }}</span> -->
              <span class="comment-header-date">{{ msg.date }}</span>
              <a-button
                type="link"
                class="comment-header-reply"
                @click="commenter.reply(msg.id, msg.reviewer)"
                >回复</a-button
              >
            </div>
            <div
              class="content"
              style="text-align: justify; text-justify: inter-ideograph"
            >
              {{ msg.content }}
            </div>
          </div>
          <!-- 跟评 -->
          <div
            v-for="follow_msg in msg.follows"
            :key="follow_msg.id"
            class="follow-comment msg-card"
          >
            <div class="comment-header">
              <span class="comment-header-name">{{ follow_msg.reviewer }}</span>
              <span class="comment-header-mail"> 回复 </span>
              <span class="comment-header-name">{{
                follow_msg.follow_name
              }}</span>
              <span class="comment-header-date">{{ follow_msg.date }}</span>
              <a-button
                type="link"
                class="comment-header-reply"
                @click="commenter.reply(msg.id, follow_msg.reviewer)"
                >回复</a-button
              >
            </div>
            <div
              class="content"
              style="text-align: justify; text-justify: inter-ideograph"
            >
              {{ follow_msg.content }}
            </div>
          </div>
          <div class="edit-area" v-if="commenter.params.follow_id == msg.id">
            <div class="input-area">
              <a-textarea
                maxlength="1024"
                placeholder="Comment text."
                :autoSize="{ minRows: 2 }"
                spellcheck="false"
                v-model:value="commenter.content"
              ></a-textarea>
              <div class="info-inputs">
                <input
                  class="info-name"
                  placeholder="Name"
                  spellcheck="false"
                  v-model="commenter.params.reviewer"
                />
                <input
                  class="info-email"
                  placeholder="Mail"
                  spellcheck="false"
                  v-model="commenter.params.reviewer_mail"
                />
              </div>
            </div>
            <div class="action-btns">
              <button class="btn-close" @click="commenter.cancelReply">
                取消
              </button>
              <a-button
                class="btn-comment"
                @click="commenter.handelComment"
                :loading="commenter.loading"
              >
                发表
              </a-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { message } from "ant-design-vue";
import { defineComponent, onMounted, reactive, ref } from "vue";
import { formatTime, parseTime } from "../utils/format";

import request from "../utils/request";

export default defineComponent({
  name: "server",
  setup() {
    let path = ref("Ve-007");
    let commenter = reactive({
      hidden: true,
      loading: false,
      params: {
        path: path.value,
        reviewer: "",
        reviewer_mail: "",
        follow_id: "",
        follow_name: "",
      },
      content: "",
      showPanel: () => (commenter.hidden = false),
      hiddenPanel: () => (commenter.hidden = true),
      showCommentBox: () => {
        if (commenter.hidden) {
          commenter.hidden = false;
          // 判断之前是否是追评
          if (commenter.params.follow_id) {
            commenter.params.follow_id = "";
            commenter.params.follow_name = "";
            commenter.content = "";
          }
        } else {
          commenter.handelComment();
        }
      },
      handelComment: () => {
        if (commenter.content.length == 0) {
          message.error("请填写内容");
        } else if (!commenter.params.reviewer) {
          message.info("请问怎么称呼呢？");
        } else {
          commitComment();
        }
      },
      addLike: () => {
        new Promise((resolve, reject) => {
          request({
            url: "/api/blog/articles/like",
            method: "post",
            params: {
              path: commenter.params.path,
            },
          })
            .then((res) => {
              message.success(res.data.message)
              resolve(res);
            })
            .catch((err) => {
              reject(err);
            });
        });
      },
      reply: (id: string, name: string): void => {
        commenter.hidden = true;
        if (id != commenter.params.follow_id) {
          commenter.content = "";
          commenter.params.follow_id = id;
          commenter.params.follow_name = name;
        }
      },
      cancelReply: () => {
        commenter.params.follow_id = "";
      },
    });

    let commentResult = reactive({
      comments: [],
      getComments: () => {
        new Promise((resolve, reject) => {
          request({
            url: "/api/blog/articles/comment",
            method: "get",
            params: {
              path: path.value,
            },
          })
            .then((res) => {
              console.log(res);
              commentResult.comments = praseComments(res.data.data);
            })
            .catch((err) => {
              console.log(err);
            });
        });
      },
    });

    const praseComments = (comments: any): any => {
      let comment_groups = [];
      comments.sort((a, b) => Number(a.id) - Number(b.id));
      for (var i in comments) {
        comments[i].date = formatTime(new Date(comments[i].date));
        if (!comments[i].follow_id) {
          comments[i].follows = [];
          comment_groups.push(comments[i]);
        } else {
          for (var cmgs in comment_groups) {
            if (comment_groups[cmgs].id == comments[i].follow_id) {
              comment_groups[cmgs].follows.push(comments[i]);
              break;
            }
          }
        }
      }
      comment_groups.sort((a, b) => Number(b.id) - Number(a.id));
      return comment_groups;
    };

    const commitComment = (): void => {
      // 将用户输入的用户名以及邮箱保存在 localstorage 里面
      localStorage.setItem("reviewer", commenter.params.reviewer);
      localStorage.setItem("reviewer_mail", commenter.params.reviewer_mail);
      commenter.loading = true;
      new Promise((resolve, reject) => {
        request({
          url: "/api/blog/articles/comment",
          method: "post",
          params: commenter.params,
          data: commenter.content,
          headers: {
            "Content-Type": "text/plain",
          },
        })
          .then((res) => {
            console.log(res);
            commentResult.getComments();
            commenter.content = "";
            commenter.loading = false;
            commenter.params.follow_id = "";
            resolve(res);
          })
          .catch((err) => {
            console.log(err);
            commenter.loading = false;
            reject(err);
          });
      });
    };

    commentResult.getComments();

    onMounted(() => {
      // 从 localstorage 获取信息
      if (localStorage.getItem("reviewer")) {
        commenter.params.reviewer = localStorage.getItem("reviewer");
      }
      if (localStorage.getItem("reviewer_mail")) {
        commenter.params.reviewer_mail = localStorage.getItem("reviewer_mail");
      }
    });

    return {
      path,
      commenter,
      commentResult,
    };
  },
});
</script>

<style lang="scss" scoped>
.comment-box .edit-area {
  margin-top: 50px;
}

.edit-area {
  // border: 1px dashed black; // for test
  // background: white;
  .input-area {
    padding: 20px;
    background: white;
    border-radius: 8px;
  }

  textarea {
    width: 100%;
    border: none;
    padding: 0;
    padding-bottom: 20px;
    resize: none;
    height: auto;
    vertical-align: bottom;
    box-shadow: none;
    // line-height:10px;

    &:focus {
      outline: none;
    }
  }
  .info-inputs {
    width: 100%;
    display: flex;
    border-top: 1px dashed #aaa;
    height: 50px;
    input {
      // padding-left: 20px;
      border: none;
      flex-grow: 1;

      &:focus {
        border: none;
        outline: none;
      }
    }
  }
  .action-btns {
    display: flex;
    justify-content: space-between;

    button {
      background: rgba(255, 255, 255, 0.7);
      padding: 4px 12px;
      margin-top: 20px;
      border: 1px solid white;
      margin-right: 16px;
      border-radius: 4px;
    }

    button.btn-comment {
      margin-right: 0;
      background: #3fbb82;
      color: white;
    }

    // button:not()
    button.btn-like {
      background: #eb3941;
      color: white;
    }

    button.btn-close {
      background: none;
      justify-self: flex-end;
      margin-left: auto;
      border: none;
    }
  }
}

.edit-area.hidden-comment .btn-close {
  display: none;
}

.hidden-comment {
  .input-area {
    display: none;
  }
  .action-btns {
    justify-content: flex-start;

    .btn-comment {
      background: rgba(255, 255, 255, 0.7);
    }
  }
}

.comment-card {
  background: white;
  width: 100%;
  padding: 16px 20px;
  margin: 16px 0;
  border-radius: 8px;

  .comment-header {
    height: 30px;
    &-name {
      color: black;
      font-weight: 500;
      border-bottom: 1px dashed red;
    }
    &-date {
      color: #666;
      font-size: 12px;
      margin-left: 10px;
      display: none;
    }
    &-reply {
      float: right;
      display: none;
      transition: all 0.3s ease-in-out;
    }
  }

  &:hover {
    .comment-header-date {
      display: inline-block;
    }
  }

  .msg-card:hover {
    .comment-header-reply {
      display: inline-block;
      padding: 0;
      height: auto;
    }
  }
  .input-area {
    padding: 0;
    padding-top: 20px;
  }

  .follow-comment {
    margin-top: 20px;
  }
}
</style>