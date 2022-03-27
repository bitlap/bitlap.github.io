---
toc: content
nav:
  path: /lab/smt
---

## @log

`@log`注解不使用混入和包装，而是直接使用宏生成默认的 log 对象来操作 log。日志库的依赖需要自己引入。

**说明**

- `logType` 指定需要生成的`log`的类型。可选，默认`org.bitlap.tools.logs.LogType.JLog`。
  - `LogType.JLog` 使用 `java.util.logging.Logger`
  - `LogType.Log4j2` 使用 `org.apache.logging.log4j.Logger`
  - `LogType.Slf4j` 使用 `org.slf4j.Logger`
  - `LogType.ScalaLoggingLazy` 基于 `scalalogging.LazyLogging` 实现，但字段被重命名为`log`
  - `LogType.ScalaLoggingStrict` 基于 `scalalogging.StrictLogging`实现， 但字段被重命名为`log`
- 支持普通类，单例对象。

**示例**

```scala
@log class TestClass1(val i: Int = 0, var j: Int) {
  log.info("hello")
}

@log(logType=LogType.Slf4j)
class TestClass6(val i: Int = 0, var j: Int) {
  log.info("hello world")
}
```
