---
title: bitlap - A table schema-less OLAP Analytics Engine for Big Data.
order: 10
hero:
  title: bitlap
  description: A table schema-less OLAP Analytics Engine for Big Data.
  actions:
    - text: Getting Started
      link: /components/foo
features:
  - emoji: 🚀
    title: 飞速查询
    description: bitlap是一个开源的、并行的、低延时的分布式行为数据分析引擎。
  - emoji: 👻
    title: 无表结构约束
    description: bitlap所创建的表是没有表结构约束的，这就意味着你可以随意的添加指标和维度，而不需要关心表太宽的问题。
  - emoji: 🎉
    title: 简单易用
    description: 支持SQL查询接口，所查即所得。支持任意指标维度的查询，无需构建cube，避免烟囱式开发，一套模型解决所有场景。
---

## Getting Started

```bash
// 创建一个表
$ bitlap> create table user_events;

// 导入测试数据
$ bitlap> load data 'simple_data.csv' into table user_events;

// 查询
$ bitlap> select sum(vv) vv, sum(pv) pv, count(distinct pv) uv from user_events where _time >= 100;
```
