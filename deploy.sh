#!/usr/bin/env sh
# 用于服务器的自动化部署

# 进入到项目目录
cd `dirname $0`

# git pull

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
yarn build

cp -r dist/* /www/wwwroot/ms.xerrors.fun/

# 停止之前已经在运行的 docker
# docker stop mecoms || echo 'skip...'

# # build & run
# docker build --tag vite-deploy .

# docker run -d -p 5001:80 --rm --name mecoms vite-deploy

# echo "访问：http://ms.xerrors.fun"