---
title: bitlap - A table schema-less OLAP Analytics Engine for Big Data.
order: 10
hero:
  title: bitlap
  desc: A table schema-less OLAP Analytics Engine for Big Data.
  actions:
    - text: 快速上手
      link: /zh-CN/components/foo
features:
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/f093e060-726e-471c-a53e-e988ed3f560c/kj9t9sk7_w144_h144.png
    title: 飞速查询
    desc: bitlap是一个开源的、并行的、低延时的分布式行为数据分析引擎。
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/881dc458-f20b-407b-947a-95104b5ec82b/k79dm8ih_w144_h144.png
    title: 无表结构约束
    desc: bitlap所创建的表是没有表结构约束的，这就意味着你可以随意的添加指标和维度，而不需要关心表太宽的问题。
  - icon: https://gw.alipayobjects.com/zos/bmw-prod/b3e102cd-5dad-4046-a02a-be33241d1cc7/kj9t8oji_w144_h144.png
    title: 简单易用
    desc: 支持SQL查询接口，所查即所得。支持任意指标维度的查询，无需构建cube，避免烟囱式开发，一套模型解决所有场景。
footer: Open-source MIT Licensed | Copyright © 2022-present<br />Powered by bitlap.org
---

## 轻松上手

```bash
// 创建一个表
$ bitlap> create table user_events;

// 导入测试数据
$ bitlap> load data 'simple_data.csv' into table user_events;

// 查询
$ bitlap> select sum(vv) vv, sum(pv) pv, count(distinct pv) uv from user_events where _time >= 100;
```
