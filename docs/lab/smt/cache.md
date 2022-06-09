---
toc: content
nav:
  path: /lab/smt
---

# cache

- 内存缓存。
- 零依赖，类型安全。
- API与实现完全独立。

## 基本使用

0. 想缓存的`case class`
```scala
case class TestEntity(
  name: String,
  id: String,
  key: String
)

// 准备数据
val data = Map(
  "btc" -> TestEntity("btc", "hello1", "world1"),
  "etc" -> TestEntity("eth", "hello2", "world2")
)
```

1. 配置缓存
```scala
object CacheImplicits {

  implicit lazy val testEntityCache: GenericCache.Aux[String, TestEntity] = // String缓存key，TestEntity缓存值
    GenericCache[String, TestEntity](CacheType.Lru()) // 缓存类型 lru
}
```

2. 初始化-获取缓存
```scala
import CacheImplicits._

val cache: CacheRef[String, TestEntity] = Cache.getCache[TestEntity]
cache.init(data)
```

3. 从缓存中取数据
```scala
val result: Option[TestEntity] = cache.getT("etc") // 特殊key需要传CacheKeyBuilder
```

4. 从缓存中只取数据的一个`key`字段
```scala
case object key extends CaseClassField {
  override def stringify: String = "key" //字段名称
  override type Field = String // 字段类型
}

val keyOpt: Option[String] = cache.getTField("etc", key)
```
