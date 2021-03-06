---
toc: content
nav:
  path: /lab/zim
---

# zio1.x 模块模式之 2.0

> 即 Module Pattern 2.0

## 基本介绍

使用 **Module Pattern 2.0** 编写服务比上一章介绍的 1.0 模式容易得多。2.0 中删除了某种程度的间接性，与编写服务时的面向对象方法更为相似。

**Module Pattern 2.0** 与面向对象的服务定义方式有更多的相似之处。我们使用类来实现服务，我们使用构造函数来定义服务依赖；归根结底，我们将类构造函数提升到`ZLayer`。

1. **Service Definition** 服务定义 —— 在这个版本中定义服务与之前的版本相比略有变化。我们将获取服务定义并将其拉到顶层：

```scala
trait Logging {
  // 注意，此时服务不需要定义在伴生对象的Service中
  def log(line: String): UIO[Unit]
}
```

2. **Service Implementation** 服务实现 —— 这与我们在面向对象的方式中所做的相同。我们使用 Scala 类实现服务。按照惯例，我们将其实现的 live 版本命名为`LoggingLive`：

```scala
case class LoggingLive() extends Logging {
  override def log(line: String): UIO[Unit] =
    ZIO.succeed(print(line))
}
```

3. **Defining Dependencies** 定义依赖关系 —— 我们可能需要`Console`和`Clock`服务来实现`Logging`服务。在这种情况下，我们将其依赖项放入`LoggingLive`的构造函数中。所有的依赖都只是接口，而不是实现。就像我们在面向对象风格中所做的一样：

```scala
case class LoggingLive(console: Console, clock: Clock) extends Logging {
  override def log(line: String): UIO[Unit] =
    for {
      current <- clock.currentDateTime
      _       <- console.printLine(s"$current--$line").orDie
    } yield ()
}
```

4. **Defining ZLayer** 定义`ZLayer` —— 现在，我们为`LoggingLive`数据类型创建一个伴生对象，并将服务实现提升到`ZLayer`：

```scala
object LoggingLive {
  val layer: URLayer[Console with Clock, Logging] =
    (LoggingLive(_, _)).toLayer[Logging]
}
```

5. **Accessor Methods** 访问器方法 —— 最后，为了创建更符合人体工程学的 API，最好为我们所有的服务方法编写访问器方法。就像我们在 1.0 中所做的一样，但稍作更改：

```scala
object Logging {
  def log(line: String): URIO[Logging, Unit] = ZIO.serviceWith[Logging](_.log(line))
}
```

很简单！ ZIO 鼓励我们遵循面向对象编程的一些最佳实践。所以它不需要我们抛弃所有面向对象的知识。

## 在 zim 中的应用

介绍了官网基本例子来自己实现一个真实需求。现在需要实现一个`WsService`服务：

```scala
trait WsService {

  def sendMessage(message: domain.Message): Task[Unit]

  def agreeAddGroup(msg: domain.Message): Task[Unit]

  def refuseAddGroup(msg: domain.Message): Task[Unit]

  def refuseAddFriend(messageBoxId: Int, username: String, to: Int): Task[Boolean]

  def deleteGroup(master: User, groupname: String, gid: Int, uid: Int): Task[Unit]

  def removeFriend(uId: Int, friendId: Int): Task[Unit]

  def addGroup(uId: Int, message: domain.Message): Task[Unit]

  def addFriend(uId: Int, message: domain.Message): Task[Unit]

  def countUnHandMessage(uId: Int): Task[Map[String, String]]

  def checkOnline(message: domain.Message): Task[Map[String, String]]

  def sendMessage(message: String, actorRef: ActorRef): Task[Unit]

  def changeOnline(uId: Int, status: String): Task[Boolean]

  def readOfflineMessage(message: domain.Message): Task[Unit]

  def getConnections: Task[Int]
}

object WsService extends ZimServiceConfiguration {

  private lazy val live: URLayer[ZApplicationConfiguration, Has[WsService]] = (r => WsServiceLive(r)).toLayer

  // 非最佳实践
  private lazy val wsLayer: ULayer[Has[WsService]] = applicationConfigurationLayer >>> WsService.live

  final lazy val actorRefSessions: ConcurrentHashMap[Integer, ActorRef] = new ConcurrentHashMap[Integer, ActorRef]

  // 非最佳实践，为了使用unsafeRun，不能把environment传递到最外层，这里直接provideLayer
  def sendMessage(message: domain.Message): Task[Unit] =
    ZIO.serviceWith[WsService](_.sendMessage(message)).provideLayer(wsLayer)

  def agreeAddGroup(msg: domain.Message): Task[Unit] =
    ZIO.serviceWith[WsService](_.agreeAddGroup(msg)).provideLayer(wsLayer)

  def refuseAddGroup(msg: domain.Message): Task[Unit] =
    ZIO.serviceWith[WsService](_.refuseAddGroup(msg)).provideLayer(wsLayer)

  def refuseAddFriend(messageBoxId: Int, username: String, to: Int): Task[Boolean] =
    ZIO.serviceWith[WsService](_.refuseAddFriend(messageBoxId, username, to)).provideLayer(wsLayer)

  def deleteGroup(master: domain.model.User, groupname: String, gid: Int, uid: Int): Task[Unit] =
    ZIO.serviceWith[WsService](_.deleteGroup(master, groupname, gid, uid)).provideLayer(wsLayer)

  def removeFriend(uId: Int, friendId: Int): Task[Unit] =
    ZIO.serviceWith[WsService](_.removeFriend(uId, friendId)).provideLayer(wsLayer)

  def addGroup(uId: Int, message: domain.Message): Task[Unit] =
    ZIO.serviceWith[WsService](_.addGroup(uId, message)).provideLayer(wsLayer)

  def addFriend(uId: Int, message: domain.Message): Task[Unit] =
    ZIO.serviceWith[WsService](_.addFriend(uId, message)).provideLayer(wsLayer)

  def countUnHandMessage(uId: Int): Task[Map[String, String]] =
    ZIO.serviceWith[WsService](_.countUnHandMessage(uId)).provideLayer(wsLayer)

  def checkOnline(message: domain.Message): Task[Map[String, String]] =
    ZIO.serviceWith[WsService](_.checkOnline(message)).provideLayer(wsLayer)

  def sendMessage(message: String, actorRef: ActorRef): Task[Unit] =
    ZIO.serviceWith[WsService](_.sendMessage(message, actorRef)).provideLayer(wsLayer)

  def changeOnline(uId: Int, status: String): Task[Boolean] =
    ZIO.serviceWith[WsService](_.changeOnline(uId, status)).provideLayer(wsLayer)

  def readOfflineMessage(message: domain.Message): Task[Unit] =
    ZIO.serviceWith[WsService](_.readOfflineMessage(message)).provideLayer(wsLayer)

  def getConnections: Task[Int] =
    ZIO.serviceWith[WsService](_.getConnections).provideLayer(wsLayer)
}
```

`WsService`的实现，命名为`WsServiceLive`，并依赖一个`ApplicationConfiguration`：

```scala
case class WsServiceLive(private val app: ApplicationConfiguration) extends WsService {

  private val userService: UserApplication = app.userApplication

  override def sendMessage(message: domain.Message): Task[Unit] =
    message.synchronized {
      //看起来有点怪 是否有必要存在？
      //聊天类型，可能来自朋友或群组
      if (SystemConstant.FRIEND_TYPE == message.to.`type`) {
        friendMessageHandler(userService)(message)
      } else {
        groupMessageHandler(userService)(message)
      }
    }

  override def agreeAddGroup(msg: domain.Message): Task[Unit] = {
    val agree = decode[AddRefuseMessage](msg.msg).getOrElse(null)
    agree.messageBoxId.synchronized {
      agreeAddGroupHandler(userService)(agree)
    }.unless(agree == null)
  }

  override def refuseAddGroup(msg: domain.Message): Task[Unit] = {
    val refuse = decode[AddRefuseMessage](msg.msg).getOrElse(null)
    refuse.messageBoxId.synchronized {
      val actor = WsService.actorRefSessions.get(refuse.toUid)
      for {
        _ <- userService.updateAgree(refuse.messageBoxId, 2).runHead
        r <- {
          val result = Map("type" -> "refuseAddGroup", "username" -> refuse.mine.username)
          sendMessage(result.asJson.noSpaces, actor)
        }.unless(actor == null)
      } yield r
    }.unless(refuse == null)
  }

  override def refuseAddFriend(messageBoxId: Int, username: String, to: Int): Task[Boolean] =
    messageBoxId.synchronized {
      refuseAddFriendHandler(userService)(messageBoxId, username, to)
    }

  override def deleteGroup(master: User, groupname: String, gid: Int, uid: Int): Task[Unit] =
    gid.synchronized {
      val actor: ActorRef = WsService.actorRefSessions.get(uid);
      {
        val result = Map(
          "type" -> "deleteGroup",
          "username" -> master.username,
          "uid" -> s"${master.id}",
          "groupname" -> groupname,
          "gid" -> s"$gid"
        )
        sendMessage(result.asJson.noSpaces, actor)
      }.when(actor != null && uid != master.id)
    }

  override def removeFriend(uId: Int, friendId: Int): Task[Unit] =
    uId.synchronized {
      //对方是否在线，在线则处理，不在线则不处理
      val actor = WsService.actorRefSessions.get(friendId)
      app.userApplication.findUserById(uId).runHead.flatMap { u =>
        {
          val result = Map(
            "type" -> protocol.delFriend.stringify,
            "uId" -> s"$uId",
            "username" -> u.map(_.username).getOrElse("undefined")
          )
          sendMessage(result.asJson.noSpaces, actor)

        }.when(actor != null && u.isDefined)
      }
    }

  override def addGroup(uId: Int, message: domain.Message): Task[Unit] =
    uId.synchronized {
      val t = decode[Group](message.msg).getOrElse(null);
      {
        userService
          .saveAddMessage(
            AddMessage(
              fromUid = message.mine.id,
              toUid = message.to.id,
              groupId = t.groupId,
              remark = t.remark,
              `type` = 1,
              time = ZonedDateTime.now()
            )
          )
          .runHead
          .when(t != null)
      } *> {
        val actorRef = WsService.actorRefSessions.get(message.to.id);
        {
          val result = Map(
            "type" -> protocol.addGroup.stringify
          )
          sendMessage(result.asJson.noSpaces, actorRef)
        }.when(actorRef != null)
      }
    }

  override def addFriend(uId: Int, message: domain.Message): Task[Unit] =
    uId.synchronized {
      val mine = message.mine
      val actorRef = WsService.actorRefSessions.get(message.to.id)
      val add = decode[Add](message.msg).getOrElse(null);
      {
        val addMessageCopy = AddMessage(
          fromUid = mine.id,
          toUid = message.to.id,
          groupId = add.groupId,
          remark = add.remark,
          `type` = add.`type`,
          time = ZonedDateTime.now()
        )
        userService.saveAddMessage(addMessageCopy).runHead
      }.when(add != null) *>
        sendMessage(
          Map("type" -> protocol.addFriend.stringify).asJson.noSpaces,
          actorRef = actorRef
        ).when(actorRef != null)
    }

  override def countUnHandMessage(uId: Int): Task[Map[String, String]] =
    uId.synchronized {
      userService.countUnHandMessage(uId, Some(0)).runHead.map { count =>
        Map(
          "type" -> protocol.unHandMessage.stringify,
          "count" -> s"${count.getOrElse(0)}"
        )
      }
    }

  override def checkOnline(message: domain.Message): Task[Map[String, String]] =
    message.to.id.synchronized {
      val result = mutable.HashMap[String, String]()
      result.put("type", protocol.checkOnline.stringify)
      ZioRedisService.getSets(SystemConstant.ONLINE_USER).map { uids =>
        if (uids.contains(message.to.id.toString))
          result.put("status", SystemConstant.status.ONLINE_DESC)
        else result.put("status", SystemConstant.status.HIDE_DESC)
        result.toMap
      }
    }

  override def sendMessage(message: String, actorRef: ActorRef): Task[Unit] =
    this.synchronized {

      LogUtil
        .info(s"sendMessage message=>$message actorRef=>${actorRef.path}")
        .as(actorRef ! message)
        .when(actorRef != null)
    }

  override def changeOnline(uId: Int, status: String): Task[Boolean] =
    uId.synchronized {
      changeOnlineHandler(userService)(uId, status)
    }

  override def readOfflineMessage(message: domain.Message): Task[Unit] =
    message.mine.id.synchronized {
      readOfflineMessageHandler(userService)(message)
    }

  override def getConnections: Task[Int] = ZIO.effect(WsService.actorRefSessions.size())

}
```
