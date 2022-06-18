---
toc: content
nav:
  path: /lab/smt
---

# common 

- `Transformer` 将样例类`From`的对象转变为样例类`To`的对象。
- `Transformable` 自动生成`Transformer`的实例。
- 有两种方式可以映射字段：
    - 1.使用`Transformer`，并在样例类的伴生对象中定义`Transformer`隐式值。
    - 2.直接使用`Transformable`的`mapField`方法。

## 数据结构

下面是一个完整的例子，会将from中的类的对象，转化为to中的类的对象。

> from对象中多的字段会被在创建to被忽略，但少了则不行，无法转换到to，编译失败。
```scala
  object from {

    import org.bitlap.common.models.to._

    sealed trait Model
    final case class FQueryResult(tableSchema: FTableSchema, rows: FRowSet) extends Model
    final case class FRowSet(rows: List[FRow] = Nil, startOffset: Long = 0) extends Model
    final case class FRow(values: List[String] = Nil) extends Model
    final case class FTableSchema(columns: List[FColumnDesc] = Nil) extends Model
    final case class FColumnDesc(columnName: String) extends Model

    object FQueryResult {
      //  定义隐式转换器，并将FQueryResult的字段rows 映射到TQueryResult的trows
      implicit val queryResultTransform: Transformer[FQueryResult, TQueryResult] =
        Transformable[FQueryResult, TQueryResult]
          .mapField(_.rows, _.trows)
          .mapField(_.tableSchema, _.ttableSchema)
          .instance
    }

    object FRowSet {
      // 字段名字和类型相同，即使顺序不同也不要紧，不需要mapFIeld，简单定义一个即可
      implicit val rowSetTransform: Transformer[FRowSet, TRowSet] = Transformable[FRowSet, TRowSet].instance
    }

    object FRow {
      implicit val rowTransform: Transformer[FRow, TRow] = Transformable[FRow, TRow].instance // not need mapping
    }

    object FTableSchema {
      implicit val tableSchemaTransform: Transformer[FTableSchema, TTableSchema] =
        Transformable[FTableSchema, TTableSchema].instance
    }

    object FColumnDesc {
      implicit val columnDescTransform: Transformer[FColumnDesc, TColumnDesc] = Transformable[FColumnDesc, TColumnDesc]
        .mapField(_.columnName, _.tcolumnName) // mapping name
        .instance
    }
  }

  object to {

    sealed trait TModel
    final case class TQueryResult(trows: TRowSet, ttableSchema: TTableSchema) extends TModel
    final case class TRowSet(startOffset: Long = 0, rows: List[TRow]) extends TModel
    final case class TRow(values: List[String] = Nil) extends TModel
    final case class TTableSchema(columns: List[TColumnDesc] = Nil) extends TModel
    final case class TColumnDesc(tcolumnName: String) extends TModel
  }
```

## 使用
```scala
    import org.bitlap.common.models.from._
    import org.bitlap.common.models.to._
    val fromRow =
      List(FRow(List("this is row data1", "this is row data2")))
    val fromRowSet      = FRowSet.apply(fromRow, 100000)
    val fromColumnDesc  = List(FColumnDesc("this is column name1"), FColumnDesc("this is column name2"))
    val fromTableSchema = FTableSchema(fromColumnDesc)
    val fromQueryResult = FQueryResult(tableSchema = fromTableSchema, rows = fromRowSet)

    val toRow =
      List(TRow(List("this is row data1", "this is row data2")))
    val toRowSet            = TRowSet(100000, toRow)
    val toColumnDesc        = List(TColumnDesc("this is column name1"), TColumnDesc("this is column name2"))
    val toTableSchema       = TTableSchema(toColumnDesc)
    val expectToQueryResult = TQueryResult(ttableSchema = toTableSchema, trows = toRowSet)

    val actualToQueryResult = Transformer[FQueryResult, TQueryResult].transform(fromQueryResult)

    // transform出来的与自己new出来的完全一样
    actualToQueryResult shouldBe expectToQueryResult
```
