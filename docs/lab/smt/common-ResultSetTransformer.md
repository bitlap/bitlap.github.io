---
toc: content
nav:
  path: /lab/smt
---

# common - ResultSetTransformer

- `ResultSetTransformer` 迭代`ResultSet`并封装为样例类的集合。
- 提供22个`GenericRowN`实例，即支持22个列的select。
- 支持继续拓展，允许自定义类型映射：`toResults(rowSet, typeMapping)`

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
    val rows = ResultSetTransformer[GenericRow4[Int, String, String, String]].toResults(rowSet) 
    // 再也不用到处写 `while(rowSet.next) { }` 了
```
