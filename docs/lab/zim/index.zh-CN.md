---
order: -1
toc: content
nav:
  path: /zh-CN/lab/zim
---

[![Build](https://github.com/bitlap/zim/actions/workflows/ScalaCI.yml/badge.svg?branch=master)](https://github.com/bitlap/zim/actions/workflows/ScalaCI.yml)
[![codecov](https://codecov.io/gh/bitlap/zim/branch/master/graph/badge.svg?token=V95ZMWUUCE)](https://codecov.io/gh/bitlap/zim)

<img align="right" width="20%" height="10%" src="/images/group.JPG" alt="https://bitlap.org">

> 感兴趣的可关注一下，也可以一起开发。本项目旨在学习。 交流群 =====>

# zim

zim 名字取自 zio 和 IM 的结合体。

> [zio](https://github.com/zio/zio) 是一个 scala 中用于异步和并发编程的类型安全、可组合的库

> IM 为即时通信系统

简单来说，zim 是一个主体基于 zio 的 web 应用，zim 会尽可能使用 zio 所提供的功能和相关库。目前已经使用的 zio 依赖包，括如下：

- zio
- zio-streams
- zio-interop-reactivestreams
- zio-logging
- zio-test
- zio-crypto 实验性
- zio-redis 实验性
- zio-actors 实验性
- zio-actors-akka-interop 实验性
- zio-schema-derivation 实验性
- zio-schema 实验性

zim 同时会选用简单易用的 scala 框架或库，尽可能不使用任何 java 库和类型系统来构建程序。

zim 初衷是学习从零开发一个纯 scala 式的应用程序，为何选择 zio 全家桶？这是因为 zio 相对其他的来说较容易也较完善。

基于学习考虑，zim 目前直接使用了一些实验性库。

## 模块

- `zim-auth` zim 的登录鉴权，目前由 cookie 实现并对外提供“鉴权缓存”函数，具体实现由`zim-server`完成。
- `zim-cache` zim 的缓存，目前由 zio-redis 实现。
- `zim-domain` 所有领域对象，包括数据库、http、websocket 等，还包括 circe 和 scalikejdbc 所需的隐式对象。
- `zim-server` zim 服务端的主要实现，包括 zio 依赖管理、领域对象的 crud 实现、基于 akka-http 的 api 实现、基于 tapir 的 api 具体实现。
- `zim-tapir` zim api 的端点描述定义，具体实现由`zim-server`完成。

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
- API 文档化工具：tapir
- 数据库：redis、mysql
- 数据操作：scalikejdbc-stream
- 序列化：circe
- WebSocket：akka-http、akka-actor-typed
- 邮件：simple-java-mail
- 配置：config
- 构建工具：sbt

## 详细目录

- [x] 如何快速开始
- [x] zio 基本介绍
- [x] zio1.x 依赖注入 1
- [ ] zio1.x 依赖注入 2
- [ ] zio 流处理介绍
- [ ] zio 如何与 scalikejdc-stream 集成
- [ ] zio 如何与 akka-stream 集成
- [ ] zio-actors 如何与 akka-actor 通信
- [ ] zio 如何构建一个可重用模块
- [ ] zio 应用如何测试
- [ ] zio-scheam 的巧妙用途
- [ ] 什么是 tapir
- [ ] 如何编写 tapir 应用
- [ ] 什么是 akka-http
- [ ] 如何编写 akka-http 接口
