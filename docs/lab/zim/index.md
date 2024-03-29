---
order: -1
title: zim
toc: content
---

[![Build](https://github.com/bitlap/zim/actions/workflows/ScalaCI.yml/badge.svg?branch=master)](https://github.com/bitlap/zim/actions/workflows/ScalaCI.yml)
[![codecov](https://codecov.io/gh/bitlap/zim/branch/master/graph/badge.svg?token=V95ZMWUUCE)](https://codecov.io/gh/bitlap/zim)

<img align="right" width="20%" height="10%" src="/images/group.JPG" alt="https://bitlap.org">

> 感兴趣的可关注一下，也可以一起开发。本项目旨在学习。 交流群 =====>

# zim

zim 名字取自 zio 和 IM 的结合体。

> [zio](https://github.com/zio/zio) 是一个 scala 中用于异步和并发编程的类型安全、可组合（模块化）的库

> IM 为即时通信系统

简单来说，zim 是一个主体基于 zio 的 web 应用，zim 会尽可能使用 zio 所提供的功能和相关库。目前已经使用的 zio 依赖包，括如下：

- zio
- zio-streams
- zio-interop-reactivestreams
- zio-logging
- zio-test
- interop-cats
- zio-crypto 实验性
- zio-redis 实验性
- zio-actors 实验性
- zio-actors-akka-interop 实验性
- zio-schema-derivation 实验性
- zio-schema 实验性
- zio-schema-json 实验性

zim 同时会选用简单易用的 scala 框架或库，尽可能不使用任何 java 库和类型系统来构建程序。

zim 初衷是学习从零开发一个纯 scala 式的应用程序，为何选择 zio 全家桶？这是因为 zio 相对其他的来说较容易也较完善。

目前使用的是 Scala2，其中多数组件暂不支持 Scala3，所以 zim 暂无计划升级到 Scala3。

基于学习考虑，zim 目前直接使用了一些实验性库。

> 现已升级到 zio2

## 模块

- `zim-auth` 登录鉴权，目前由 cookie 实现并对外提供“鉴权缓存”函数，具体实现由`zim-server`完成。
- `zim-cache-api` 缓存接口定义（tagless final）。
- `zim-cache-redis4cats` 基于 redis4cats 实现缓存。
- `zim-cache-redis4zio` 基于 zio-redis 实现缓存。
- `zim-domain` 所有领域模型定义。
- `zim-server` Server 端的主要实现，包括 zio 依赖管理、基于 akka-http 的 route 实现、基于 tapir 的 API 具体实现。
- `zim-infra` 配置和基础设施，包括系统基础配置、工具类、部分领域对象及核心 CRUD 实现。
- `zim-api` tapir API 描述定义和 service、repository 接口定义（tagless final），repository 具体实现在`zim-infra`，service 具体实现在`zim-server`。

## 环境

- scala 2.13
- java 11/17
- redis 4/5/6
- mysql 8
- docker-compose

## 技术栈

- 开发语言：scala2
- 平台：jvm
- 前端：layim 3.0
- 主体框架：zio 2
- API server：akka-http
- API 文档化工具：tapir 1
- 数据库：redis、mysql
- 数据操作：scalikejdbc-streams
- 定时任务：zio-actors
- 序列化：circe
- 加密工具 zio-crypto
- 日志：zio-logging
- 细化类型：refined
- WebSocket：akka-http、akka-actor-typed
- 邮件：simple-java-mail
- 配置：config
- 构建工具：sbt
