---
toc: content
nav:
  path: /lab/zim
---

# zio-streams 与 akka-stream 的集成

总的来说，我在 zim 中集成 akka-stream，其实只是为了集成 akka-http，众所周知，akka-http 是构建在 akka-stream 上的，而 akka-stream 依赖 akka-actor。

对于任意 zio 应用，无外乎就是返回`ZIO`或`ZStream`类型的数据。zim 中为了省事，所有接口都使用了`ZStream`，这点其实很不好，因为`ZStream`比`ZIO`操作更多，更复杂。
所以 zim 代码中到处都是`runHead`，甚至不少`runCollect`，这都是因为过度使用`ZStream`导致的。一般而言，仅当数据返回（长）列表时，使用`ZStream`才有意义。

受限于第一次写 zio 应用，目前也只能把东西搞出来，至于搞得好不好目前看来还不行，所以请忽悠以下代码的丑陋，仅供学习和参考。

zim 第二个问题是，需要兼容旧的前端接口，旧返回结构`ResultSet`如下：
```json
{
    "code": 0,
    "msg": "",
    "data":[]
}

{
    "code": 0,
    "msg": "",
    "data":{}
}
```


由于最终在外层包裹了一层JSON，所以实际上是把`ZStream`作为一个普通集合来使用的，并没有使用流的特性。
个人认为，因为最终返回的是一个大对象而不是`List`生成的 stream，这意味即使使用流了，也是一次性传输的。

> 鉴于上面的大前提，下面仅是解决思路，不是最佳实践。

**依赖**

```
zio-interop-reactivestreams
zio-streams
akka-http
akka-stream
```

核心代码如下：

```scala
  /**
   * @tparam T 支持的多元素的类型
   * @return
   */
  def buildFlowResponse[T <: Product]
    : stream.Stream[Throwable, T] => Future[Either[ZimError, Source[ByteString, Any]]] = respStream => {
    val resp = for {
      list <- respStream.runCollect
      resp = ResultSet[List[T]](data = list.toList).asJson.noSpaces
      r <- ZStream(resp).map(body => ByteString(body)).toPublisher
    } yield r
    Future.successful(
      Right(Source.fromPublisher(unsafeRun(resp)))
    )
  }
```

上面代码的一些注意事项：
1. 该函数需要输入一个`Stream[Throwable, T]`（`ZStream`的别名）
2. 该函数需要泛型`T`，以便支持所有`T`的序列化，这里`asJson`来自`Circe`库。
3. 该函数输出一个akka stream类型`Future[Either[ZimError, Source[ByteString, Any]]]`，最外层加`Future`是为了给tapir使用。
    - 这里是从`Publisher`创建`Source`的
    - 该函数直接在内存进行`runCollect`，以便生成`ResultSet`对象所需要的`data`数据，创建出完整的`ResultSet`结构
    - 使用 zio-interop-reactivestreams 提供的`toPublisher`函数将`ZStream`转换为 reactive Streams，也就是 akka stream

如果不需要包装一层`ResultSet`就更方便了。

**使用**

这里是使用了tapir，暂时忽略。
```scala
  lazy val getOffLineMessageRoute: Route =
    AkkaHttpServerInterpreter().toRoute(ZimUserEndpoint.getOffLineMessageEndpoint.serverLogic { user => _ =>
      // getOffLineMessage返回一个ZStream
      val resultStream = apiApplication.getOffLineMessage(user.id)
      buildFlowResponse(resultStream)
    })
```

这样就创建了一个 akka-stream 的`Route`对象了。tapir 的好处是能使用 DSL 来描述请求和响应，并具备文档化的能力，同时兼容各大 Scala web平台。
需要注意的是，这里的`Route`和akka http自己的`Route`对使用者来说是没有任何区别。
