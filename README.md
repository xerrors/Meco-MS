## Meco MS

Meco Manage System

一个用于博客网站的后台管理系统，是从项目 [Gourd](https://github.com/xerrors/gourd) 的后台部分拆分而来。

### 安装 node

默认安装的版本太低了，想要安装高版本的还是需要其他的办法的。

参考 [从 NodeSource 中安装 Node.js 和 npm](https://developer.aliyun.com/article/760687)

```sh
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
```

安装 nodejs 和 [yarn](https://classic.yarnpkg.com/en/docs/install)

```sh
sudo apt-get install -y nodejs

npm install --global yarn
```

## TODO

- 编辑完文章之后切换到其他页面需要判断是否要保存
- build 之后无法跨域的问题
- 发布完成之后可以发布到别的网站的支持
- 添加保存草稿功能，保存之后不会编译
- 主页显示内容优化
- logout 优化，无提示
