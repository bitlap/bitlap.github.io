---
toc: content
nav:
  path: /lab/smt
---

# common - Extractor

- `Extractor` 迭代`ResultSet`并封装为样例类的集合。
- 默认提供22个`GenericRowN`实例，即支持22个列的select，允许拓展。
- 支持自定义类型映射函数。

## 使用
```scala

    val statement = DriverManager
      .getConnection(
        "jdbc:h2:mem:zim?caseSensitive=false;MODE=MYSQL;TRACE_LEVEL_FILE=2;INIT=RUNSCRIPT FROM 'classpath:test.sql'"
      )
      .createStatement()
    statement.execute(s"""select * from T_USER""".stripMargin)

    val rowSet: ResultSet = statement.getResultSet

    // default type mapping
    val rows = Extractor[GenericRow4[Int, String, String, String]].from(rowSet) 
    // 再也不用到处写 `while(rowSet.next) { }` 了
```

## 优化
```scala
  import org.bitlap.common.jdbc._
  
  implicit lazy val conn = DriverManager.getConnection(
    "jdbc:h2:mem:zim?caseSensitive=false;MODE=MYSQL;TRACE_LEVEL_FILE=2;INIT=RUNSCRIPT FROM 'classpath:test.sql'"
  )
  val ret1 = Extractor[GenericRow4[Int, String, String, String]].from(sql"select * from T_USER")
```
