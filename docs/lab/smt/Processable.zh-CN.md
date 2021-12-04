---
toc: content
nav:
  path: /lab/smt
---

## Processable

`Processable`宏用于在不创建新的类文件的情况下创建`com.alipay.sofa.jraft.rpc.RpcRequestProcessor`的实例。

使用`RpcRequestProcessor`的构造函数派生子类。
```java
    public RpcRequestProcessor(Executor executor, Message defaultResp) {
        super();
        this.executor = executor;
        this.defaultResp = defaultResp;
    }
```

**说明**

泛型说明：
- `Req` protobuf定义的类型，用于request的消息类型，必须是`com.google.protobuf.Message`的子类。
- `Service` 用户自定义的服务接口，用于处理业务逻辑，可以为任意类型。
- `Executor` 用于传递给`RpcRequestProcessor`的构造函数，必须是`java.util.concurrent.Executor`的子类。

参数说明：
- `processRequest:   (Service, RpcRequestClosure, Req) ⇒ Message` 一个处理请求的函数，可以实现任意业务逻辑，最重要的参数。
- `processException: (Service, RpcContext, Exception) ⇒ Message` 一个处理异常的函数。
- `service:          Service` 操作业务所需要的实例对象。
- `defaultResp:      Message` protobuf定义的类型的默认实例，用于传递给`RpcRequestProcessor`的构造函数。
- `executor:         Executor` 用于传递给`RpcRequestProcessor`的构造函数，必须是`java.util.concurrent.Executor`的子类。

> 返回的`Message`通常是自己定义的用于响应的protobuf对象的子类

**示例**

对于现有protobuf文件：
```proto
message BOpenSession {
    message BOpenSessionReq {
        string username = 1;
        string password = 2;
        map<string, string> configuration = 3;
    }
    message BOpenSessionResp {
        string status = 1;
        map<string, string>  configuration = 2;
        string session_handle = 3;
    }
}
```

使用`Processable`宏:
```scala
    val openSession = Processable[BOpenSessionReq, NetService, Executor](
      (service, rpcRequestClosure, req) => {
        import scala.jdk.CollectionConverters.MapHasAsScala
        val username = req.getUsername
        val password = req.getPassword
        val configurationMap = req.getConfigurationMap
        val ret = service.openSession(username, password, configurationMap.asScala.toMap)
        BOpenSessionResp.newBuilder().setSessionHandle(ret).build()
      },
      (service, rpcContext, exception) => {
        BOpenSessionResp.newBuilder().setStatus(exception.getLocalizedMessage).build()
      },
      new NetService, BOpenSessionResp.getDefaultInstance, null
    )
```

**宏展开**

```scala
Expr[io.github.dreamylost.sofa.CustomRpcProcessor[org.bitlap.network.proto.driver.BOpenSession.BOpenSessionReq]]({
  class 83e5be1066da49d18b2f870e77656bf7 extends io.github.dreamylost.sofa.CustomRpcProcessor[org.bitlap.network.proto.driver.BOpenSession.BOpenSessionReq](executor, org.bitlap.network.proto.driver.BOpenSession.BOpenSessionResp.getDefaultInstance()) {
    <paramaccessor> private val service: io.github.dreamylost.sofa.NetService = _;
    <paramaccessor> private[this] val executor: java.util.concurrent.Executor = _;
    def <init>(service: io.github.dreamylost.sofa.NetService, executor: java.util.concurrent.Executor = null) = {
      super.<init>();
      ()
    };
    override def processRequest(request: org.bitlap.network.proto.driver.BOpenSession.BOpenSessionReq, done: com.alipay.sofa.jraft.rpc.RpcRequestClosure): com.google.protobuf.Message = ((service: io.github.dreamylost.sofa.NetService, rpcRequestClosure: com.alipay.sofa.jraft.rpc.RpcRequestClosure, req: org.bitlap.network.proto.driver.BOpenSession.BOpenSessionReq) => {
      import scala.jdk.CollectionConverters.MapHasAsScala;
      val username: String = req.getUsername();
      val password: String = req.getPassword();
      val configurationMap: java.util.Map[String,String] = req.getConfigurationMap();
      val ret: String = service.openSession(username, password, scala.jdk.CollectionConverters.MapHasAsScala[String, String](configurationMap).asScala.toMap[String, String](scala.this.<:<.refl[(String, String)]));
      org.bitlap.network.proto.driver.BOpenSession.BOpenSessionResp.newBuilder().setSessionHandle(ret).build()
    })(new NetService(), done, request);
    override def processError(rpcCtx: com.alipay.sofa.jraft.rpc.RpcContext, exception: Exception): com.google.protobuf.Message = ((service: io.github.dreamylost.sofa.NetService, rpcContext: com.alipay.sofa.jraft.rpc.RpcContext, exception: Exception) => org.bitlap.network.proto.driver.BOpenSession.BOpenSessionResp.newBuilder().setStatus(exception.getLocalizedMessage()).build())(new NetService(), rpcCtx, exception)
  };
  new 83e5be1066da49d18b2f870e77656bf7(new NetService(), null)
})
```
