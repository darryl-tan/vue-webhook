#!/bin/bash
WORK_PATH='/root/projects/vue-back'
cd $WORK_PATH
echo "清理后台代码"
git reset --hard origin/master
git clean -f
echo "拉取后台最新代码"
git pull origin master


WORK_PATH='/root/projects/vue-front'
cd $WORK_PATH
echo "清理前台代码"
git reset --hard origin/master
git clean -f
echo "拉取前台最新代码"
git pull origin master
echo "打包前台最新代码"
npm run build

cd /root/projects
echo "删除老资源"
docker-compose down
echo "重启所有服务"
docker-compose up -d
