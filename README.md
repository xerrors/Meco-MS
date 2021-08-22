## Meco MS

Meco Manage System

一个用于博客网站的后台管理系统，是从项目 [Gourd](https://github.com/xerrors/gourd) 的后台部分拆分而来。此项目依赖后端配置，参考[Meco-Server](https://github.com/xerrors/meco-server)；

控制台有页面：

![](https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/20210822131624.png)

文章列表：

![](https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/20210822131850.png)

消息列表：

![](https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/20210822131915.png)

服务器日志：

![](https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/20210822131948.png)

文章编辑：

![](https://xerrors.oss-cn-shanghai.aliyuncs.com/imgs/20210822132117.png)


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

