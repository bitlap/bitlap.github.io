---
toc: content
nav:
  path: /en-US/lab/smt
---

## @log

The `@log` annotation does not use mixed or wrapper, but directly uses macro to generate default log object and operate log. (Log dependency needs to be introduced)

**Note**

- `logType` Specifies the type of `log` that needs to be generated, default is `io.github.dreamylost.logs.LogType.JLog`.
  - `LogType.JLog` use `java.util.logging.Logger`
  - `LogType.Log4j2` use `org.apache.logging.log4j.Logger`
  - `LogType.Slf4j` use `org.slf4j.Logger`
  - `LogType.ScalaLoggingLazy` implement by `scalalogging.LazyLogging` but field was renamed to `log`
  - `LogType.ScalaLoggingStrict` implement by `scalalogging.StrictLogging` but field was renamed to `log`
- Support `class` and `object`.

**Example**

```scala
@log class TestClass1(val i: Int = 0, var j: Int) {
  log.info("hello")
}

@log(logType=LogType.Slf4j)
class TestClass6(val i: Int = 0, var j: Int) {
  log.info("hello world")
}
```
