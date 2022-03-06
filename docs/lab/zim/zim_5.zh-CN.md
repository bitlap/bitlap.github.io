---
toc: content
nav:
  path: /zh-CN/lab/zim
---

# ZIO中的依赖注入

`ZLayer`结合ZIO环境，让我们可以使用ZIO进行依赖注入。依赖注入有两个部分：
1. __构建依赖图__
2. __依赖传播__

> 环境即environment

ZIO对依赖注入问题有完整的解决方案。它通过使用`ZLayer`的组合属性解决了第一个问题，并通过使用`ZIO#provide`等ZIO环境工具解决了第二个问题。

ZIO管理应用程序组件之间依赖关系的方式为我们提供了组合性方面的强大功能，并提供了轻松更改不同实现的能力。这在测试和mock期间特别有用。

通过使用ZLayer和ZIO，我们可以解决依赖注入中的传播和连接问题。但是没有必要使用它，我们仍然可以使用Guice和ZIO之类的东西，或者我们可能喜欢使用[izumi distage](https://izumi.7mind.io/distage/index.html) 解决方案进行依赖注入。

## 构建依赖图

假设我们有几个服务及其依赖项，我们需要一种方法来组合和连接这些依赖项并创建应用程序的依赖关系图。`ZLayer`是针对这个问题的ZIO解决方案，它允许我们通过水平和垂直组合 __层__ 来构建整个应用程序依赖关系图。有关如何组合图层的更多信息，请参见 [ZLayer](https://zio.dev/next/datatypes/contextual/zlayer) 页面。

## 依赖传播

当我们编写应用程序时，我们的应用程序有很多依赖项。我们需要一种方法来提供实现以及在整个应用程序中提供和传播所有依赖项。我们可以通过使用 __ZIO 环境__ 来解决传播问题。

在应用程序的开发过程中，我们不关心实现。逐渐地，当我们使用对环境有不同要求的各种效果时，我们应用程序的所有部分组合在一起，最终我们有一个ZIO效果，需要一些服务作为环境。在通过`unsafeRun`运行此效果之前，我们应该将这些服务的实现提供到该效果的ZIO环境中。

ZIO有一些设施可以做到这一点。`ZIO#provide`是核心函数，它允许我们将`R`提供给需要`R`的效果。

注意：一旦使用`provide`行为消除了结果效果类型中的环境依赖，则将由`Any`类型表示结果环境。如`URIO[Logging, Unit]`，对这个效果使用`provide`提供了Logging依赖后，则结果类型变成`URIO[Any, Unit]`，表示不再需要任何依赖了。

## 使用`provide`方法

`ZIO#provide`采用`R`环境并将其提供给`ZIO`效果，从而消除其对`R`的依赖：
```scala
trait ZIO[-R, +E, +A] {
  def provideEnvironment(r: R)(implicit ev: NeedsEnv[R]): IO[E, A]
}
```

这类似于依赖注入，`provide`函数可以认为是`inject`。

假设我们有以下服务：
```scala
trait Logging {
  def log(str: String): UIO[Unit]
}

object Logging {
  def log(line: String) = ZIO.serviceWith[Logging](_.log(line))
}
```

让我们使用`Logging`服务编写一个简单的程序：
```scala
val app: ZIO[Logging, Nothing, Unit] = Logging.log("Application Started!")
```

我们可以在`app`效果中`provide`一下`Logging`服务的实现：
```scala
val loggingImpl = new Logging {
  override def log(line: String): UIO[Unit] =
    UIO.succeed(println(line))
}

val effect = app.provideEnvironment(ZEnvironment(loggingImpl))
```

大多数时候，我们不直接使用`Has`来实现我们的服务，而是使用`ZLayer`构建应用程序的依赖关系图，然后使用`ZIO#provide`之类的方法将依赖关系传播到`ZIO`效果的环境中：
```scala
import zio.Clock._
import zio.Console._
import zio.Random._

val myApp: ZIO[Random with Console with Clock, Nothing, Unit] = for {
  random  <- nextInt 
  _       <- printLine(s"A random number: $random").orDie
  current <- currentDateTime
  _       <- printLine(s"Current Data Time: $current").orDie
} yield ()
```
注入依赖项：
```scala
val mainEffect: ZIO[Any, Nothing, Unit] = 
  myApp.provide(Random.live, Console.live, Clock.live)
```
