---
toc: content
nav:
  path: /lab/smt
---

## Processable 过期的

该实现仅 0.3.3 可用

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

- `Req` protobuf 定义的类型，用于 request 的消息类型，必须是`com.google.protobuf.Message`的子类。
- `Service` 用户自定义的服务接口，用于处理业务逻辑，可以为任意类型。
- `Executor` 用于传递给`RpcRequestProcessor`的构造函数，必须是`java.util.concurrent.Executor`的子类。

参数说明：

- `processRequest: (Service, RpcRequestClosure, Req) ⇒ Message` 一个处理请求的函数，可以实现任意业务逻辑，最重要的参数。
- `processException: (Service, RpcContext, Exception) ⇒ Message` 一个处理异常的函数。
- `service: Service` 操作业务所需要的实例对象。
- `defaultResp: Message` protobuf 定义的类型的默认实例，用于传递给`RpcRequestProcessor`的构造函数。
- `executor: Executor` 用于传递给`RpcRequestProcessor`的构造函数，必须是`java.util.concurrent.Executor`的子类。

> 返回的`Message`通常是自己定义的用于响应的 protobuf 对象的子类

**示例**

对于现有 protobuf 文件：

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

## Processable 改进

简化分两种，第一种：

- `executor`参数 直接使用`null`，不支持传入自定义参数。
- `defaultResp`参数 直接使用`Resp.getDefaultInstance`创建默认对象 ，不支持传入自定义参数。

```scala
    val openSession = Processable[NetService, BOpenSessionReq, BOpenSessionResp](new NetService)(
      (service, _, req) => {
        import scala.jdk.CollectionConverters.MapHasAsScala
        val username = req.getUsername
        val password = req.getPassword
        val configurationMap = req.getConfigurationMap
        val ret = service.openSession(username, password, configurationMap.asScala.toMap)
        BOpenSessionResp.newBuilder().setSessionHandle(ret).build()
      },
      (_, _, exception) => {
        BOpenSessionResp.newBuilder().setStatus(exception.getLocalizedMessage).build()
      }
    )
```

简化的第二种：

- `service`参数 为`Service`泛型反射出对象，不支持传入自定义参数。
- 仅支持非抽象类且必须含有默认无参构造函数。

```scala
    val openSession = Processable[BOpenSessionReq, BOpenSessionResp, NetService](
      (service, rpc, req) => {
        import scala.jdk.CollectionConverters.MapHasAsScala
        val username = req.getUsername
        val password = req.getPassword
        val configurationMap = req.getConfigurationMap
        val ret = service.openSession(username, password, configurationMap.asScala.toMap)
        BOpenSessionResp.newBuilder().setSessionHandle(ret).build()
      },
      (service, rpc, exception) => {
        BOpenSessionResp.newBuilder().setStatus(exception.getLocalizedMessage).build()
      }
    )
```
