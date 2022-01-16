---
toc: menu
nav:
  path: /lab/zim
  order: 1
---

<img align="right" width="20%" height="10%" src="/images/group.JPG" alt="https://bitlap.org">

> 感兴趣的可关注一下，也可以一起开发。本项目旨在学习。  交流群 =====>


# zim

zim 名字取自 zio 和 IM 的结合体。

> [zio](https://github.com/zio/zio) 是一个 scala 中用于异步和并发编程的类型安全、可组合的库


> IM 为即时通信系统

简单来说，zim 是一个主体基于 zio 的 web 应用，zim 会尽可能使用 zio 所提供的功能和相关库。目前已经使用的 zio 库包括如下：

- zio
- zio-streams
- zio-interop-reactivestreams
- zio-logging
- zio-test
- zio-crypto 实验性
- zio-redis 实验性
- zio-actors 实验性

zim 同时会选用简单易用的 scala 框架或库，尽可能不使用任何 java 库和类型系统来构建程序。

zim 初衷是学习从零开发一个纯 scala 式的应用程序，为何选择 zio 全家桶？这是因为 zio 相对其他的来说较容易也较完善。

基于学习考虑，zim 目前直接使用了一些实验性库。


## 环境

- scala 2.12.x/2.13.x
- java 8/11
- redis
- mysql 8.x

## 技术栈

- 开发语言：scala
- 平台：jvm
- 前端：layim 3.0
- 主体框架：zio 1.x
- API：akka-http
- API文档化工具：tapir
- 数据库：redis、mysql
- 数据操作：scalikejdbc-stream
- 序列化：circe
- WebSocket：akka-http、akka-actor-typed
- 邮件：simple-java-mail
- 配置：config
- 构建工具：sbt

## 快速开始


### 运行环境准备

* 执行 `./prepare.sh` 脚本, 然后修改 `src/main/resources/application.conf` 中相关数据库的信息
* 在本地MySQL中创建数据库`zim`，注意驱动的版本
* 启动本地的Redis，使用默认用户和密码即可
* 使用`resources/sql/schema.sql`初始化表结构
* 使用`resources/sql/data.sql`初始化数据（可选）
* 启动Main方法`ZimServer.scala#run`

### 如何上手

- swagger-ui 接口文档： `http://localhost:9000/api/v1.0/docs`
- 最简单的心跳接口：`http://localhost:9000/api/v1.0/health`
- websocket接口：`ws://127.0.0.1:9000/websocket?uid=1`
- 单元测试

## 如何参与贡献

1. fork一份 zim 到自己仓库，拉下代码后，在`zim/`目录里面执行`sbt compile` 编译。（第一次构建不要使用IDE的build）
2. 查看[issue](https://github.com/bitlap/zim/issues)列表，选择一些自己能解决的issue，编写代码和单元测试
3. 调试代码，参考 `运行环境准备`
4. 使用`sbt compile` 自动格式化代码
5. 使用`sbt scalafmtCheckAll` 检查格式化 
6. 使用`sbt coverage test coverageReport` 执行测试
7. 创建 pull request

