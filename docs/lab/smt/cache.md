---
toc: content
nav:
  path: /lab/smt
---

# cache

- 内存缓存。
- 零依赖，类型安全。
- API与实现完全独立。
- API统一。

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

  implicit lazy val testEntityAsyncCache: GenericCache.Aux[String, TestEntity] = // String：缓存key，TestEntity：缓存值
    GenericCache[String, TestEntity](CacheType.Lru(), ExecutionContext.Implicits.global) // Future cache
}
```

2. 初始化-获取缓存
```scala
import CacheImplicits._

val asyncCache = Cache[String, TestEntity]
cache.init(data)
```

3. 从缓存中取数据
```scala
val result: Future[Option[TestEntity]] = cache.getT("etc") // 特殊key需要传CacheKeyBuilder
```
