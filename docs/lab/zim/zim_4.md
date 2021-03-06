---
toc: content
nav:
  path: /lab/zim
---

# zio 流处理介绍

> 摘自官网

流式库的主要目标是引入一个高级 API，该 API 抽象了使用数据源和目标进行读写操作的机制。在 zio 中 需要添`zio-streams`为依赖才能使用流。流式库帮助我们专注于业务逻辑，并将我们与低级实现细节分开。

有很多人们可能不认识的流式库的示例，这是一个常见问题，尤其是对于初学者而言。初学者可能会说“我不需要流式库。我为什么要使用它？”。这是因为他们看不到流。一旦我们使用流式库，我们就会开始到处看到流，但在那之前我们不知道它们在哪里。

在深入了解 ZIO Streams 之前，让我们列出一些流解决方案的用例，看看我们为什么要以流的方式进行编程：

- 文件 —— 每次与文件交互的老式 API 都有非常低级的操作符，比如“打开一个文件，给我一个 `InputStream`，以及从该 `InputStream` 读取下一个块的方法，以及关闭文件的另一种方法”。虽然这是一个非常低级的命令式 API，但有一种方法可以将文件视为字节流。
- 套接字 —— 我们可以使用流来提供基于流的服务器套接字实现，而不是使用低级 API，它隐藏了套接字的低级实现细节。我们可以将套接字通信建模为从字节流到字节流的函数。我们可以将该套接字的输入视为一个流，并将其输出视为另一个流。
- 事件溯源 —— 在当今时代，通常希望构建事件溯源应用程序，这些应用程序在 Kafka 或 AMQP 系统等队列系统中处理事件或消息。这种架构的基础是流式传输。此外，当我们想要进行大量数据分析等时，它们也很有用。
- UI 应用程序 —— 流是几乎每一个现代 UI 应用程序的基础。每次我们点击某个东西时，这就是一个事件。我们可以使用低级 API，例如订阅用户事件的回调，但我们也可以将它们视为事件流。因此，我们可以将订阅建模为 UI 应用程序中的事件流。
- HTTP Server —— HTTP Server 可以被视为一个流。我们有一个请求流正在被转换为一个响应流；从字节流到字节流的函数。

所以流无处不在。我们可以将所有这些不同的事物视为流。我们到处都能找到流。基本上，几乎所有数据驱动的应用程序都可以从流中受益。

## 使用 Streams 的动机

假设，我们想获取一个数字列表并获取所有素数，然后对这些素数中的每一个进行更艰苦的工作。我们可以使用 `ZIO.foreachParN` 和 `ZIO.filterPar` 运算符来做到这一点，如下所示：

```scala
def isPrime(number: Int): Task[Boolean] = Task.succeed(???)
def moreHardWork(i: Int): Task[Boolean] = Task.succeed(???)

val numbers = 1 to 1000

for {
  primes <- ZIO.filterPar(numbers)(isPrime)
  _      <- ZIO.foreachParN(20)(primes)(moreHardWork)
} yield ()
```

这将并行处理列表并过滤所有素数，然后获取所有素数并对其进行更艰苦的工作。

这个例子有两个问题：

- 高延迟 —— 我们没有得到任何管道，我们正在做批处理。我们需要等待第一步处理完整个列表，然后才能继续下一步。这可能会导致相当严重的性能损失。
- 有限的内存 —— 我们需要在处理它时将整个列表保存在内存中，如果我们正在处理无限的数据流，这将不能工作。

使用 ZIO 流，我们可以将此程序更改为以下代码：

```scala
def prime(number: Int): Task[(Boolean, Int)] = Task.succeed(???)

ZStream.fromIterable(numbers)
  .mapMParUnordered(20)(prime(_))
  .filter(_._1).map(_._2)
  .mapMParUnordered(20)(moreHardWork(_))
```

我们使用 `ZStream.fromIterable` 将数字列表转换为 `ZStream`，然后我们并行映射它，一次 20 个项目（items），然后我们执行艰苦的工作问题。这是一个管道，这很容易适用于无限列表。

有人可能会问，“好吧，我可以通过使用 fibers 和 queues 来实现管道。那么为什么要使用 ZIO 流呢？”。把 fibers 写成这样是非常诱人的。我们可以创建一堆 queues 和 fibers，然后我们有 fibers 在 queues 之间复制信息并同时执行处理。它最终是这样的：

```scala
def writeToInput(q: Queue[Int]): Task[Unit]                            = Task.succeed(???)
def processBetweenQueues(from: Queue[Int], to: Queue[Int]): Task[Unit] = Task.succeed(???)
def printElements(q: Queue[Int]): Task[Unit]                           = Task.succeed(???)

for {
  input  <- Queue.bounded[Int](16)
  middle <- Queue.bounded[Int](16)
  output <- Queue.bounded[Int](16)
  _      <- writeToInput(input).fork
  _      <- processBetweenQueues(input, middle).fork
  _      <- processBetweenQueues(middle, output).fork
  _      <- printElements(output).fork
} yield ()
```

我们创建了一堆 queues 来缓冲源、目标元素和中间结果。

此解决方案存在一些问题。由于 fibers 是低级并发工具，使用它们来创建数据管道并不简单。我们需要正确处理中断。我们应该关心资源并防止它们泄漏。我们需要通过等待 queues 耗尽并以正确的方式关闭管道。

## 核心抽象

要定义流工作流程，在 ZIO 流中有三个核心抽象；`Streams`、`Sinks` 和 `Transducers`：

- `ZStream` —— `ZStream` 作为数据的来源。我们从他们那里得到元素。他们产生数据。
- `ZSink` —— `ZSink` 充当数据的容器或接收器。他们消耗数据。
- `Transducer` —— `Transducer` 充当数据的转换器。他们获取个体数据，并对其进行转换或解码。

### Stream

类似于 `ZIO`，`ZStream` 数据类型有`R`、`E`、`A`。它们分别表示环境、错误和元素类型。 `ZIO` 和 `ZStream` 的区别在于：

- `ZIO` 效果总是会成功或失败。如果成功，它将通过单个元素成功。
- `ZStream` 可以成功使用零个或多个元素。所以我们可以有一个空流。 `ZStream[R, E, A]` 不一定会产生任何 `A`s，它会产生零个或多个 `A`s。

这是一个很大的区别。没有非空 `ZStream` 这样的东西。所有的 `ZStream` 都是空的，它们可以产生任意数量的 `A`s，也可以是无限数量的 `A`s。

无法检查流是否为空，因为该计算尚未开始。流是超级懒惰的，所以没有办法说“哦！这个流包含任何东西吗？”不！我们无法弄清楚。我们必须使用它并尝试用它做一些事情，然后我们能弄清楚它是否有什么东西。

### ZSink

TODO

### Transducer

TODO

## 与 scalikejdbc-streams 集成

需要的所有依赖：

- zio-streams
- zio-interop-reactivestreams
- scalikejdbc-streams

以一个查询为例：

```scala
  private[repository] def _findUsersByFriendGroupIds(fgid: Int): StreamReadySQL[User] =
    sql"select ${u.result.*} from ${User as u} where id in (select ${af.uid} from ${AddFriend as af} where fgid = ${fgid});"
      .map(User(_))
      .list()
      .iterator()
```

准备个隐式转换将 scalikejdbc 流转换为 zio 流：

```scala
  implicit class executeStreamOperation[T](streamReadySQL: StreamReadySQL[T]) {
    def toStreamOperation(implicit databaseName: String): stream.Stream[Throwable, T] =
      (NamedDB(Symbol(databaseName)) readOnlyStream streamReadySQL).toStream()
  }
```

在 repository 中使用：

```scala
  override def findUsersByFriendGroupIds(fgid: Int): stream.Stream[Throwable, model.User] =
    _findUsersByFriendGroupIds(fgid).toStreamOperation
```

在 service 中使用：

```scala
  override def findFriendGroupsById(uid: Int): stream.Stream[Throwable, FriendList] = {
    val groupListStream = friendGroupRepository.findFriendGroupsById(uid).map { friendGroup =>
      FriendList(id = friendGroup.id, groupname = friendGroup.groupname, Nil)
    }
    for {
      groupList <- groupListStream
      // 嵌套数据结构，必须从流中获取所有元素，此时要先计算，最后再从效果构建新的流。其实没有使用到流的特性 个人认为是API设计本身不太合理。
      users <- ZStream.fromEffect(userRepository.findUsersByFriendGroupIds(groupList.id).runCollect)
      _ <- LogUtil.infoS(s"findFriendGroupsById uid=>$uid, groupList=>$groupList, users=>$users")
    } yield groupList.copy(list = users.toList)
  }
```

`ZStream` 与 `ZIO` 一样 允许使用 for 推断简化 `flatmap` 操作。

## 为什么选择 ZIO Streams

[zio 官方文档](https://zio.dev/version-1.x/datatypes/stream/)
