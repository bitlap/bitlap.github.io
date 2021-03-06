---
toc: content
nav:
  path: /lab/zim
---

# zio 基本介绍

zio 是一个基于纯函数式编程的异步和并发编程库。

zio 中最常见的类型是`ZIO[R, E, A]`，第一次见到这些类型估计就会让人头大，好在个数不多，而且仔细观察它们是有规律的。

- `R` 表示效果所需的环境类型。
- `E` 表示效果可能抛出的异常类型，`Nothing`表示不会有异常。
- `A` 表示效果的结果类型，如果此类型参数为`Unit`，则表示效果不产生有用的信息，如果为`Nothing`，则表示效果永远运行（或直到失败）。

例如，`ZIO[Any, IOException, Byte]`类型的效果没有任何环境要求，可能会失败并返回`IOException`类型的异常，或者可能会成功并返回类型`Byte`的值。

> 这里的环境可以理解为运行该效果所需要的运行时依赖。

## zio 类型别名

通常在 zio 应用中 由于 `R`, `E`, `A` 有一些是固定的，所以有一些预置的类型别名可供使用。这将有助于简化代码。

类型别名在 zio 应用中非常常见和通用，个人认为我们应尽可能使用这些别名。

常见的别名如下：

- `UIO[A]` — 这是`ZIO[Any, Nothing, A]`的类型别名，表示没有环境依赖要求并且不会失败，同时成功返回`A`。
- `URIO[R, A]` — 这是`ZIO[R, Nothing, A]`的类型别名，表示需要`R`类型的环境依赖且不会失败，同时成功返回`A`。
- `Task[A]` - 这是`ZIO[Any, Throwable, A]`的类型别名，表示没有环境依赖要求，可能会因`Throwable`类型的异常失败，或成功返回`A`。
- `RIO[R, A]` — 这是`ZIO[R, Throwable, A]`的类型别名，表示需要`R`类型的环境依赖，并且可能因`Throwable`值而失败，或成功返回`A`。
- `IO[E, A]` — 这是`ZIO[Any, E, A]`的类型别名，表示没有环境依赖要求，可能会因`E`类型的异常失败，或成功返回`A`。

由上可见，`Task[A]`是一个最简单的类型，其在数据结构上类似于 Scala 的`Future`。

创建自己的副作用很简单，只需要使用`ZIO`或以上类型别名的伴生对象即可。如下：

> succeed 通常表示不可能失败的效果值。如果不确定会失败应该使用 effectTotal

```scala
// 成功的效果值
val s1 = ZIO.succeed(42)
val s2: Task[Int] = Task.succeed(42)
val now = ZIO.effectTotal(System.currentTimeMillis())

// 失败的值
val f1 = ZIO.fail("Uh oh!")
```

## Hello World

```scala
import zio.{ ExitCode, URIO, ZIO }
import zio.console._

import java.io.IOException

object MyApp extends zio.App {

  // 继承zio.app重写了run方法，不需要自己提供Console依赖这个环境，因为zio默认提供了。
  def run(args: List[String]): URIO[Console, ExitCode] = {
    myAppLogic.exitCode
  }

  // 表示需要Console作为依赖，可能抛出IOException异常，并返回Unit值
  val myAppLogic: ZIO[Console, IOException, Unit] = {
        putStrLn("Hello World")
  }

}
```

## 其他

一个稍微复杂的 main 函数如下：

```scala
object ZimServer extends ZimServiceConfiguration with zio.App {

  // zio支持for推断，这样简化了flatmap套娃
  // URIO表示依赖Logging类型，返回ExitCode，不能失败
  private val program: URIO[Logging, ExitCode] =
    (for {
      routes <- ApiConfiguration.routes
      _ <- AkkaHttpConfiguration.httpServer(routes)
    } yield ())
      .provideLayer(ZimEnv) //提供业务所需环境给httpServer
      .foldM(
        e => log.throwable("", e) as ExitCode.failure,
        _ => UIO.effectTotal(ExitCode.success)
      )

  override def run(args: List[String]): URIO[zio.ZEnv, ExitCode] =
    program.provideLayer(LogUtil.loggingLayer) // 默认提供了一个日志环境

}
```

Layer 可以理解为是一个模块，模块内部维护自己的逻辑，对外提供 Layer，多个 Layer 可以组合和传递，上面的`ZimEnv`实际为如：

```scala
// 这表示 ZimEnv这个Layer表示不会失败，没有依赖环境，返回混合类型 ZApiConfiguration with ZAkkaActorSystemConfiguration with ZAkkaHttpConfiguration
 val ZimEnv: TaskLayer[ZApiConfiguration with ZAkkaActorSystemConfiguration with ZAkkaHttpConfiguration] =
    apiConfigurationLayer ++ akkaActorSystemLayer ++ akkaHttpConfigurationLayer
```

其中`TaskLayer[A]`和`Task[A]`是同样的道理，只不过`TaskLayer`是`Layer`类型，而`Task`是`IO`类型。

> 甚至可以把 Layer 当做一个拼图的一部分。最终拼完的就是 ZimEnv。通常，定义多个可组合可重复的 Layer，可以方便的去构建一个更加复杂的环境（Layer），供系统运行使用。同时，环境声明对使用者而言是类型安全的。

## zio 常见函数介绍

TODO

## zio 错误处理介绍

TODO
