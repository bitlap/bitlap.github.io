---
title: 快速开始
toc: content
order: 0
---

# 快速开始

## Docker 环境准备

> 已经安装了 docker 的可以使用，镜像所使用的配置文件：`application-docker.conf`

- 下载镜像 `docker pull liguobin/zim:0.3.0-SNAPSHOT`，版本号用最新的
- 运行镜像 `docker run liguobin/zim:0.3.0-SNAPSHOT`
- 查看容器 IP `docker inspect container_id`
  - 尝试 `ping` 容器的 IP，Mac 电脑如果 `ping` 不通可能是因为需要加路由，参考`https://www.haoyizebo.com/posts/fd0b9bd8`，记得同时关闭 Mac 的 VPN。
- 访问 `http://container_ip:9000/`

## 本机环境准备

- 执行 `./prepare.sh` 脚本, 然后修改 `modules/zim-server/src/main/resources/application.conf` 中相关数据库的信息
- 在本地 MySQL 中创建数据库`zim`，注意驱动的版本
- 启动本地的 Redis，使用默认用户和密码即可
- 使用`resources/sql/schema.sql`初始化表结构
- 使用`resources/sql/data.sql`初始化数据（可选）
- 启动 Main 方法`ZimServer.scala#run`

## 如何上手

- swagger-ui 接口文档： `http://localhost:9000/api/v1.0/docs`（不含需要鉴权的接口）
- websocket 接口文档 `http://localhost:9000/api/v1.0/wsDocs` (非类型化，其实用处不大)
- 最简单的心跳接口：`http://localhost:9000/api/v1.0/health`
- websocket 接口：`ws://127.0.0.1:9000/websocket?uid=1`
- 单元测试

## 如何参与贡献

1. fork 一份 zim 到自己仓库，拉下代码后，在`zim/`目录里面执行`sbt compile` 编译。（第一次构建不要使用 IDE 的 build）
2. 查看[issue](https://github.com/bitlap/zim/issues)列表，选择一些自己能解决的 issue，编写代码和单元测试
3. 调试代码，参考 `运行环境准备`
4. 使用`sbt compile` 自动格式化代码
5. 使用`sbt scalafmtCheckAll` 检查格式化
6. 使用`sbt headerCheckAll` 检查文件头
7. 使用`sbt coverage test coverageReport` 执行测试
8. 创建 pull request


## 详细文章

我的博客 https://blog.dreamylost.cn/

- [x] 如何快速开始
- [x] zio 基本介绍
- [x] zio1.x 模块模式之 1.0
- [x] zio1.x 模块模式之 2.0
- [x] zio-streams、与 scalikejdbc-streams 的集成
- [x] zio 中的依赖注入
- [x] zio-streams 与 akka-stream 的集成
- [x] zio-actors 与 akka-actor-typed 通信的集成
- [x] zio1 升级到 zio2 踩坑和总结
- [ ] zio 如何构建一个可重用模块
- [ ] zio 应用如何测试
- [ ] zio-schema 应用
- [ ] 如何编写 tapir 应用
- [ ] 如何编写 akka-http 接口
