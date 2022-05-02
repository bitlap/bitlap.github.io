---
toc: content
nav:
  path: /lab/smt
---

# CSV

## smt-csv-core使用

> 处理一般情况的CSV转换

### 支持类型

- `Int`、`Option[Int]`
- `Long`、`Option[Long]`
- `String`、`Option[String]`
- `Char`、`Option[Char]`
- `Short`、`Option[Short]`
- `Double`、`Option[Double]`
- `Float`、`Option[Float]`
- `Boolean` 、`Option[Boolean]`
- `T`、`List[T]`，`T` 是 `case class`

如果`case class`的字段不是`Option`，但是CSV的该列为空，则解析CSV时，`case class`对象的对应字段有相应的零值。
- `Int` = `0`
- `Long` = `0L`
- `String` = `""`
- `Char` = `'?'`
- `Short` = `0`
- `Double` = `0D`
- `Float` = `0F`
- `Boolean` = `false`
- `T` = `null`

对于`Option[_]`类型，为空的列始终有默认值`None`

### 编写`CsvConverter`
```scala
case class Dimension(key: String, value: Option[String], d: Char, c: Long, e: Short, f: Boolean, g: Float, h: Double)

object Dimension {
  // 定义隐式转换值
  import org.bitlap.csv.core.macros.{ DeriveToCaseClass, DeriveToString }
  implicit val csvConverter: CsvConverter[Dimension] = new CsvConverter[Dimension] {
    override def toScala(line: String): Option[Dimension] = DeriveToCaseClass[Dimension](line, ",")
    override def toCsvString(t: Dimension): String = DeriveToString[Dimension](t)
  }
}

val line =
  """1,cdf,d,12,2,false,0.1,0.2
    |2,cdf,d,12,2,false,0.1,0.1""".stripMargin

// 转case class
val dimensions: Option[List[Dimension]] = Converter[List[Dimension]].toScala(line)
// val dimension: Option[Dimension] = CsvConverter[Dimension]].toScala(line) // 不会使用 \n 分割行，仅单行能用
assert(
  dimensions.toString == "Some(List(Dimension(1,Some(cdf),d,12,2,false,0.1,0.2), Dimension(2,Some(cdf),d,12,2,false,0.1,0.1)))"
)
// 转CSV字符串
val csv = Converter[List[Dimension]].toCsvString(dimensions.orNull)
assert(csv == line)
```

## smt-csv-derive

> 简化代码，自动派生`implicit val csvConverter: CsvConverter[T]`，支持类型与smt-csv-core相同。
```scala
case class Dimension2(key: String, value: Option[String])

object Dimension2 {
  // 还能自定义分隔符：空格
  implicit val csvConverter: Converter[Dimension2] = DeriveCsvConverter.gen[Dimension2](' ')
}

val line =
  """1 22
    |2 0.1""".stripMargin

val dimension = Converter[List[Dimension2]].toScala(line)
assert(dimension.toString == "Some(List(Dimension2(1,Some(22)), Dimension2(2,Some(0.1))))")
val csv = Converter[List[Dimension2]].toCsvString(dimension.orNull)
assert(csv == line)
```

## 进阶使用

> 自定义每列格式

给定下面这种复杂的CSV数据，其中第三列是个JSON。
```csv
val csvData =
  """100,1,"{""city"":""北京"",""os"":""Mac""}",vv,1
    |100,1,"{""city"":""北京"",""os"":""Mac""}",pv,2
    |100,1,"{""city"":""北京"",""os"":""Windows""}",vv,1
    |100,1,"{""city"":""北京"",""os"":""Windows""}",pv,3
    |100,2,"{""city"":""北京"",""os"":""Mac""}",vv,1
    |100,2,"{""city"":""北京"",""os"":""Mac""}",pv,5
    |100,3,"{""city"":""北京"",""os"":""Mac""}",vv,1
    |100,3,"{""city"":""北京"",""os"":""Mac""}",pv,2
    |200,1,"{""city"":""北京"",""os"":""Mac""}",vv,1
    |200,1,"{""city"":""北京"",""os"":""Mac""}",pv,2
    |200,1,"{""city"":""北京"",""os"":""Windows""}",vv,1
    |200,1,"{""city"":""北京"",""os"":""Windows""}",pv,3
    |200,2,"{""city"":""北京"",""os"":""Mac""}",vv,1
    |200,2,"{""city"":""北京"",""os"":""Mac""}",pv,5
    |200,3,"{""city"":""北京"",""os"":""Mac""}",vv,1
    |200,3,"{""city"":""北京"",""os"":""Mac""}",pv,2""".stripMargin
```

需要将其转换到下面的`case class`中，目前CSV列需要与`case class`的字段顺序一一对应
```scala
case class Metric(time: Long, entity: Int, dimensions: List[Dimension], metricName: String, metricValue: Int)
case class Dimension(key: String, value: String)
```

### 使用`ScalableBuilder`解析CSV

```scala
val metrics: Array[Option[Metric]] = csvData
  .split("\n") // 1.按行分列
  .map(csv => // 2. 对每行csv进行解析
    ScalableBuilder[Metric] // 解析的目标结果类型，Metric是case class
      // setField用于设置dimensions字段应该怎样从CSV行的该列中被解析出来
      // dims值为字符串：{"city":"北京","os":"Mac"}
      // StringUtils.extraJsonValues 是默认提供的解析方法，当然也可以使用JSON，但是为了不依赖任何第三方库，我选择由用户指定如何解析，也更加灵活
      .setField[List[Dimension]](_.dimensions, dims => StringUtils.extraJsonValues[Dimension](dims)((k, v) => Dimension(k, v)))
      .build(csv) // 这里没有传，采用默认列分隔符 ','
      .toScala)  // 执行转换操作
```

### 使用`CsvableBuilder`写入CSV

> 将上面的`metrics`转换为CSV行数据

```scala
val csv = metrics.map(metric =>
  CsvableBuilder[Metric]
    .setField(
      _.dimensions,
      (ds: List[Dimension]) => s"""\"{${ds.map(kv => s"""\"\"${kv.key}\"\":\"\"${kv.value}\"\"""").mkString(",")}\\}\""""
    )
    .build(metric.get)
    .toCsvString
)

assert(csv.toString() == """List(100,1,"{""city"":""北京"",""os"":""Mac""\}",vv,1, 100,1,"{""city"":""北京"",""os"":""Mac""\}",pv,2, 100,1,"{""city"":""北京"",""os"":""Windows""\}",vv,1, 100,1,"{""city"":""北京"",""os"":""Windows""\}",pv,3, 100,2,"{""city"":""北京"",""os"":""Mac""\}",vv,1, 100,2,"{""city"":""北京"",""os"":""Mac""\}",pv,5, 100,3,"{""city"":""北京"",""os"":""Mac""\}",vv,1, 100,3,"{""city"":""北京"",""os"":""Mac""\}",pv,2, 200,1,"{""city"":""北京"",""os"":""Mac""\}",vv,1, 200,1,"{""city"":""北京"",""os"":""Mac""\}",pv,2, 200,1,"{""city"":""北京"",""os"":""Windows""\}",vv,1, 200,1,"{""city"":""北京"",""os"":""Windows""\}",pv,3, 200,2,"{""city"":""北京"",""os"":""Mac""\}",vv,1, 200,2,"{""city"":""北京"",""os"":""Mac""\}",pv,5, 200,3,"{""city"":""北京"",""os"":""Mac""\}",vv,1, 200,3,"{""city"":""北京"",""os"":""Mac""\}",pv,2)""")
```

> 暂时没有考虑特殊情况：CSV中JSON结构必须是：`"{""city"":""北京"",""os"":""Mac""}"`

### 快速从文件中解析

**scala 2.13.x 可用**

> `org.bitlap.csv.core.ScalableHelper`中提供了封装方法 

```scala
// 文件路径：src/test/resources/simple_data.csv
val metrics = ScalableHelper.readCsvFromClassPath[Metric2]("simple_data.csv") { line =>
  ScalableBuilder[Metric2]
    .setField[Seq[Dimension3]](_.dimensions, dims => StringUtils.extractJsonValues[Dimension3](dims)((k, v) => Dimension3(k, v))
    .build(line)
    .toScala
}
```
