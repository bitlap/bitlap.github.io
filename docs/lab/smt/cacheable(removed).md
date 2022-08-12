---
toc: content
nav:
  path: /lab/smt
---

# cacheable

> 基于 scala+zio 的分布式缓存工具，功能类似 Spring 缓存注解`@Cacheable`、`@CacheEvict`。支持使用 caffeine 和 zio-redis 作为存储介质。

**缓存的语义**

- cacheable --- 查缓存，有则返回，无则查库并设置缓存
  - local 指定是用内存作为缓存存储，默认为`true`
- cacheEvict --- 删除缓存中的某个方法的所有记录
  - local 指定是用内存作为缓存存储，默认为`true`
  - values 指定需要清除的查询方法名 编译期检查，必须与注解所在类是同一个密闭类中成员；未指定 values 或者为`Nil`，则清除该密闭类中的所有方法的缓存

## 添加依赖

- 参阅[README_CN#如何使用](../README_CN.md)如何添加依赖。

```scala
// 如果需要使用cacheable module，则引入下面模块 (不支持 Scala2.11.x)
// 内部包含的依赖: zio, zio-streams, zio-logging
"org.bitlap" %% "smt-cacheable-core" % "<VERSION>"
// 根据需要导入下面的具体实现
// 1.本地缓存, 内部包含的依赖: config, caffeine
"org.bitlap" %% "smt-cacheable-caffeine" % "<VERSION>"
// 2.分布式缓存, 内部包含的依赖: zio-redis, config, zio-schema, 可选的 (zio-schema-protobuf,zio-schema-derivation用于样例类序列化)
"org.bitlap" %% "smt-cacheable-redis" % "<VERSION>"
```

## 配置缓存

使用 redis 作为缓存向`application.conf`中添加 redis 配置，默认配置如下：

```
redis  {
  host = "0.0.0.0"
  port = 6379
}
```

使用 caffeine 作为缓存向`application.conf`中添加 caffeine 配置，默认配置如下：

```
caffeine {
  maximumSize = 100
  expireAfterWriteSeconds = 60
}
```

> resources 下没有`application.conf`则使用默认配置，否则使用`application.conf`中的配置

## 如何使用 `@cacheable`

### 直接使用 cacheable 模块的`Cache`

> 支持`ZIO`和`ZStream`

```scala
// 注意： 方法的参数用于持久化存储的field，故参数必须都已经重写了`toString`方法
// 导入caffeine的实现则表示使用caffeine
// 导入redis的实现·import _root_.org.bitlap.cacheable.redis.Implicits._·
import _root_.org.bitlap.cacheable.caffeine.Implicits._
def readStreamFunction(id: Int, key: String): ZStream[Any, Throwable, String] = {
  val $result = ZStream.fromEffect(ZIO.effect("hello world" + Random.nextInt()))
  Cache($result)("UseCaseExample-readStreamFunction", List(id, key)) // "UseCaseExample-readStreamFunction" is hash key
}

def readFunction(id: Int, key: String): ZIO[Any, Throwable, String] = {
  val $result = ZIO.effect("hello world" + Random.nextInt())
  Cache($result)("UseCaseExample-readFunction", List(id, key))
}
```

### 使用`@cacheable`注解自动生成

> 使用 hash 存储 key=className-methodName

```scala
@cacheable // 默认使用`import _root_.org.bitlap.cacheable.caffeine.Implicits._`
def readStreamFunction(id: Int, key: String): ZStream[Any, Throwable, String] = {
  ZStream.fromEffect(ZIO.effect(s"hello world--$id-$key-${Random.nextInt()}"))
}
```

## 如何使用 `@cacheEvict`

> 使用 hash 存储 key=className-methodName 对应`cacheable` key

### 直接使用 cacheable 模块的`Cache`

> 支持`ZIO`和`ZStream`

```scala
// 注意： 因为缓存的key是类名+方法名 filed是方法参数，所以该注解将删除所有key的数据，相当于spring的@CacheEvict注解设置allEntries=true
import _root_.org.bitlap.cacheable.caffeine.Implicits._
def updateStreamFunction(id: Int, key: String): ZStream[Any, Throwable, String] = {
   val $result = ZStream.fromEffect(ZIO.effect("hello world" + Random.nextInt()))
   // 指定要删除哪些查询方法的缓存？key=className-readFunction1,className-readFunction2
   Cache.evict($result)(List("readFunction1", "readFunction2"))
}

def updateFunction(id: Int, key: String): ZIO[Any, Throwable, String] = {
   val $result = ZIO.effect("hello world" + Random.nextInt())
   Cache.evict($result)(List("readFunction1", "readFunction2"))
}
```

### 使用`@cacheEvict`注解自动生成

```scala
// values的值必须是与updateStreamFunction1在一个密闭类中的方法，否则编译不过
// values值为空时，清除以当前类名为前缀的所有缓存：删除哪些缓存？key=className-xx,className-yy,以此类推
// @cacheEvict注解的参数顺序不能变
@cacheEvict(local = true, values = List("readStreamFunction1"))
def updateStreamFunction1(id: Int, key: String): ZStream[Any, Throwable, String] = {
   ZStream.fromEffect(ZIO.effect(s"hello world--$id-$key-${Random.nextInt()}"))
}
```

### 如何使用样例类

```scala
case class CacheValue(i: Int)
object CacheValue {
    // Redis需要（caffeine缓存不用）
    implicit val cacheValueSchema: Schema[CacheValue] = DeriveSchema.gen[CacheValue]
}
@cacheable
def readEntityFunction(id: Int, key: String): ZIO[Any, Throwable, CacheValue] = {
    ZIO.effect(CacheValue(Random.nextInt()))
}
@cacheEvict
def updateEntityFunction(id: Int, key: String): ZIO[Any, Throwable, CacheValue] = {
    ZIO.effect(CacheValue(Random.nextInt()))
}
```
