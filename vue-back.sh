#!/bin/bash
WORK_PATH='/root/projects/vue-back'
cd $WORK_PATH
echo "清理代码"
git reset --hard origin/master
git clean -f
echo "拉取最新代码"
git pull origin main
echo "开始构建镜像"
docker build -t vue-back:1.0 .
echo "删除旧容器"
docker stop vue-back-container
docker rm vue-back-container
echo "启动新容器"
docker container run -p 3000:3000 -d --name vue-back-container vue-back:1.0
