---
toc: content
nav:
  path: /zh-CN/lab/zim
---

# 快速开始


## 运行环境准备

* 执行 `./prepare.sh` 脚本, 然后修改 `src/main/resources/application.conf` 中相关数据库的信息
* 在本地MySQL中创建数据库`zim`，注意驱动的版本
* 启动本地的Redis，使用默认用户和密码即可
* 使用`resources/sql/schema.sql`初始化表结构
* 使用`resources/sql/data.sql`初始化数据（可选）
* 启动Main方法`ZimServer.scala#run`

## 如何上手

- swagger-ui 接口文档： `http://localhost:9000/api/v1.0/docs`
- 最简单的心跳接口：`http://localhost:9000/api/v1.0/health`
- websocket接口：`ws://127.0.0.1:9000/websocket?uid=1` （不含需要鉴权的接口）
- 单元测试

## 如何参与贡献

1. fork一份 zim 到自己仓库，拉下代码后，在`zim/`目录里面执行`sbt compile` 编译。（第一次构建不要使用IDE的build）
2. 查看[issue](https://github.com/bitlap/zim/issues)列表，选择一些自己能解决的issue，编写代码和单元测试
3. 调试代码，参考 `运行环境准备`
4. 使用`sbt compile` 自动格式化代码
5. 使用`sbt scalafmtCheckAll` 检查格式化 
6. 使用`sbt coverage test coverageReport` 执行测试
7. 创建 pull request
