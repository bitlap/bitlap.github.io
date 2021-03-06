---
toc: content
nav:
  path: /lab/zim
---

# zio1.x 模块模式之 1.0

> 即 Module Pattern 1.0

## 基本介绍

让我们通过编写一个`Logging`服务开始学习这种模式：

1. **Bundling** 捆绑 —— 定义一个为模块提供名称的对象，这可以（不一定）是一个包对象。我们创建一个`logging`对象，所有的定义和实现都将包含在这个对象中。
2. **Service Definition** 服务定义 —— 然后我们创建`Logging`伴生对象。在伴生对象中，我们使用名为`Service`的`trait`来编写服务的定义。特质是我们编写服务的方式。服务可以是与具有单一责任的一个概念相关的所有东西。
3. **Service Implementation** 服务实现 —— 之后，我们通过创建一个新服务（匿名对象）来实现我们的服务，然后使用`ZLayer.succeed`构造函数将整个实现提升为`ZLayer`数据类型。
4. **Defining Dependencies** 定义依赖关系 —— 如果我们的服务依赖于其他服务，我们应该使用`ZLayer.fromService`和`ZLayer.fromServices`这样的构造函数。
5. **Accessor Methods** 访问器方法 —— 最后，为了创建更符合人体工程学的 API，最好为我们所有的服务方法编写访问器方法。

> 效果 = effect = 副作用
> 访问器方法允许我们通过 ZIO 环境利用服务中的所有功能。这意味着，如果我们调用`log`，我们不需要从 ZIO 环境中取出`log`函数。 `serviceWith`方法帮助我们每次访问效果环境并减少冗余操作。

```scala
type Logging = Has[Logging.Service]

// 伴生对象的存在是为了保存服务定义和实时实现
object Logging {
  trait Service {
    def log(line: String): UIO[Unit]
  }

  val live: ULayer[Logging] = ZLayer.succeed {
    new Service {
      override def log(line: String): UIO[Unit] =
        ZIO.succeed(println(line))
    }
  }
}

// Accessor Methods
def log(line: => String): URIO[Logging, Unit] =
  ZIO.serviceWith(_.log(line))
```

我们可能需要控制台和时钟服务来实现日志服务。在这种情况下，我们使用`ZLayer.fromServices`构造函数：

```scala
object logging {
  type Logging = Has[Logging.Service]

  // 伴生对象的存在是为了保存服务定义和实时实现
  object Logging {
    trait Service {
      def log(line: String): UIO[Unit]
    }

    val live: URLayer[Clock with Console, Logging] =
      ZLayer.fromServices[Clock, Console, Logging.Service] {
        (clock: Clock, console: Console) =>
          new Logging.Service {
            override def log(line: String): UIO[Unit] =
              for {
                current <- clock.currentDateTime
                _ <- console.printLine(s"$current--$line").orDie
              } yield ()
          }
      }
  }

  def log(line: => String): URIO[Logging, Unit] =
    ZIO.serviceWith(_.log(line))
}
```

这就是 ZIO 服务的创建方式。当我们使用`log`方法时就会被要求必须提供`Logging` layer。

在编写应用程序时，我们并不关心将哪个实现版本的`Logging`服务注入到我们的应用程序中，最终，它将通过诸如`provide`之类的方法提供。

## 在 zim 中的应用

介绍了官网基本例子来自己实现一个真实需求。现在需要实现一个 redis 服务，使用[zio-redis](https://github.com/zio/zio-redis)
作为客户端为我们的[zim](https://github.com/bitlap/zim) 定义一个`redisCacheService`：

```scala
/**
 * Redis缓存服务
 *
 * @author 梦境迷离
 * @version 1.0,2022/1/10
 */
object redisCacheService extends ZimServiceConfiguration {
    //ZimServiceConfiguration只是提供了redisLayer，为了外部省略provideLayer，方便使用。

  // trait Has[A]与ZIO环境一起用于表示效果对类型A的服务的依赖性。
  // 例如，RIO[Has[Console.service]，Unit]是一种需要控制台的效果的服务。
  // 在ZIO库中，提供类型别名作为常用服务的简写，例如：`type Console = Has[ConsoleService]`
  type ZRedisCacheService = Has[RedisCacheService.Service]

  object RedisCacheService {
    //服务声明定义
    trait Service {

      def getSets(k: String): IO[Nothing, Chunk[String]]

      def removeSetValue(k: String, v: String): IO[Nothing, Long]

      def setSet(k: String, v: String): IO[Nothing, Long]
    }

    // 服务实现定义
    lazy val live: ZLayer[RedisExecutor, Nothing, ZRedisCacheService] =
      // fromService对env的类型也多个Tag，功能与fromFunction相同
      ZLayer.fromFunction { env =>
        new Service {
          override def getSets(k: String): IO[Nothing, Chunk[String]] =
            redis.sMembers(k).returning[String].orDie.provide(env)

          override def removeSetValue(k: String, v: String): IO[Nothing, Long] =
            redis.sRem(k, v).orDie.provide(env)

          override def setSet(k: String, v: String): IO[Nothing, Long] =
            redis.sAdd(k, v).orDie.provide(env)
        }
      }
  }

  // 使用的时候直接用这些方法即可。
  def getSets(k: String): ZIO[Any, RedisError, Chunk[String]] =
    ZIO.serviceWith[RedisCacheService.Service](_.getSets(k)).provideLayer(redisLayer)

  def removeSetValue(k: String, v: String): ZIO[Any, RedisError, Long] =
    ZIO.serviceWith[RedisCacheService.Service](_.removeSetValue(k, v)).provideLayer(redisLayer)

  def setSet(k: String, v: String): ZIO[Any, RedisError, Long] =
    ZIO.serviceWith[RedisCacheService.Service](_.setSet(k, v)).provideLayer(redisLayer)
}
```

非最佳实践，为了在 tapir 处理时使用`unsafeRun`直接获取值，而该方法需要环境（此时存在依赖循环），所以这里直接调用`provideLayer`，后面使用`unsafeRun`的时候就不需要再提供环境了，官方给出的访问器方法并不使用`provideLayer`，而是在程序最外层将环境传递进去，个人认为这样导致环境类型混合的特质太过多了。

在 zim 中，最外层环境主要为 akka：

```scala
object ZimServer extends ZimServiceConfiguration with zio.App {

  private lazy val loggingLayer: URLayer[Console with Clock, Logging] =
    Logging.console(
      logLevel = LogLevel.Debug,
      format = LogFormat.ColoredLogFormat()
    ) >>> Logging.withRootLoggerName("ZimApplication")

  private val program: ZIO[Logging, Nothing, ExitCode] =
    (for {
      routes <- ApiConfiguration.routes
      _ <- AkkaHttpConfiguration.httpServer(routes)
    } yield ())
      .provideLayer(ZimEnv)
      .foldM(
        e => log.throwable("", e) as ExitCode.failure,
        _ => UIO.effectTotal(ExitCode.success)
      )

  override def run(args: List[String]): ZIO[zio.ZEnv, Nothing, ExitCode] =
    program.provideLayer(loggingLayer)

}
```

`ZimEnv`是 zim 程序的主要环境，但不包括 redis，因为 redis 的 API 中我们使用了`provideLayer`手动提供了其环境依赖。

`loggingLayer`是个日志服务，由于`ZimEnv`中没有包含日志，所以这里需要单独提供一个，才能构建出完整的服务依赖关系。

`redisLayer`是由`RedisCacheConfiguration`和`RedisCacheService`组成的。

```scala
  protected lazy val redisLayer: ZLayer[Any, RedisError.IOError, ZRedisCacheService] =
    RedisCacheConfiguration.live >>> RedisCacheService.live
```

这表示，我们将 redis 配置的 layer 传递给 redis 服务的 layer，以构建出新的 layer。由于配置不再依赖其他 layer，所以最终我们的 layer 是能构建出来的且不再需要其他依赖的。(单向的)
