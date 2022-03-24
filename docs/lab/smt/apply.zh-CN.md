---
toc: content
nav:
  path: /zh-CN/lab/smt
---

## @apply

`@apply`注解用于为普通类的主构造函数生成`apply`方法。

**说明**

- 仅支持在`class`上使用且仅支持主构造函数。

**示例**

```scala
@apply @toString class B2(int: Int, val j: Int, var k: Option[String] = None, t: Option[Long] = Some(1L))
println(B2(1, 2, None, None)) //不携带字段的默认值到apply参数中，所以参数都是必传
```
