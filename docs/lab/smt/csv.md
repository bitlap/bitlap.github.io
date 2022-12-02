---
toc: content
nav:
  path: /lab/smt
---

# CSV

## 1、smt-csv使用

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
- `T`，集合：`List[T]`、`Seq[T]`、`Set[T]`、`Vector[T]`，`T` 只能是 `case class`

如果`case class`的字段不是`Option`，但是CSV的该列为空（或解析失败），则解析CSV时，`case class`对象的对应字段有相应的零值。
- `Int` = `0`
- `Long` = `0L`
- `String` = `""`
- `Char` = `'?'`
- `Short` = `0`
- `Double` = `0D`
- `Float` = `0F`
- `Boolean` = `false`
- `T` = `null`
- 集合 = `Nil`

对于`Option[_]`类型，为空的列始终有默认值`None`

## 2、使用builder构造器

**依赖**
```
"org.bitlap" %% "smt-csv" % "<VERSION>" // 使用最新的
```

给定下面这种复杂的CSV测试数据，其中第三列是个JSON。
```
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

> 这里的级联调用不能分开

### CSV字符串转Scala

```scala
val metrics: List[Option[Metric]] = ReaderBuilder[Metric]
      // setField用于设置dimensions字段应该怎样从CSV行的该列中被解析出来
      // dims值为字符串：{"city":"北京","os":"Mac"}
      // StringUtils.extraJsonValues 是默认提供的解析方法，当然也可以使用JSON，但是为了不依赖任何第三方库，我选择由用户指定如何解析，也更加灵活
  .setField[List[Dimension]](
    _.dimensions,
    dims => StringUtils.extractJsonValues[Dimension](dims)((k, v) => Dimension(k, v))
  )
  .convert(csvData.split("\n").toList)
```

### Scala转CSV字符串

> 将上面的`metrics`转换为CSV行数据

```scala
val csv: String = WriterBuilder[Metric]
  .setField(
    _.dimensions,
    (ds: List[Dimension]) =>  StringUtils.asJsonString(ds.map(f => f.key -> f.value)
  )
  .convert(metrics.filter(_.isDefined).map(_.get))
```

> 暂时没有考虑特殊情况：CSV中JSON结构必须是这种形式：`"{""city"":""北京"",""os"":""Mac""}"`，整个JSON在双引号中且JSON里面的引号是2个。

### 快速解析CSV文件

```scala
val metrics =
  ReaderBuilder[Metric]
    .setField[Seq[Dimension]](
      _.dimensions,
      dims => StringUtils.extractJsonValues[Dimension](dims)((k, v) => Dimension(k, v))
    )
    .convertFrom(ClassLoader.getSystemResourceAsStream("simple_data.csv"))
```


## 3、使用converter自动派生器

> 简化代码，自动派生`implicit val csvConverter: Converter[T]`，支持类型与smt-csv-core相同。

**依赖**
```
"org.bitlap" %% "smt-csv-derive" % "<VERSION>" // 使用最新的
```

```scala
case class Dimension2(key: String, value: Option[String])

object Dimension2 {
  implicit val csvConverter: Converter[Dimension2] = DeriveCsvConverter.gen[Dimension2]
}

val line =
  """1 22
    |2 0.1""".stripMargin

val dimension = Converter[List[Dimension2]].toScala(line)
val csv = Converter[List[Dimension2]].toCsvString(dimension.orNull)
```

### 自定义处理复杂结构

> 同样使用上面的`csvData`数据
  
```scala
case class CsvLine4(time: Long, entity: Int, dimensions: List[Dimension], metricName: String, metricValue: Int)
case class Dimension(key: String, value: String)

object Dimension {
  implicit val fieldCsvConverter: Converter[List[Dimension]] = new Converter[List[Dimension]] {
    override def toScala(line: String): Option[List[Dimension]] =
      Option(StringUtils.extractJsonValues[Dimension](line)((k, v) => Dimension(k, v)))

    override def toCsvString(t: List[Dimension]): String =  StringUtils.asJsonString(t.map(f => f.key -> f.value)
  }
}
object CsvLine4 {
  implicit val lineCsvConverter: Converter[CsvLine4] = DeriveCsvConverter.gen[CsvLine4]
}


val csvLines: Option[List[CsvLine4]] = Converter[List[CsvLine4]].toScala(csvData) // 构造器的方式返回的是`List[Option[Metric]]`
val csvString :Strng = Converter[List[CsvLine4]].toCsvString(csvs.orNull)
```

## 4、使用CsvFormat解析TSV

```scala
implicit val format = new TsvFormat {
  override val delimiter: Char             = ' '  // 列分隔符
  override val ignoreEmptyLines: Boolean   = true // 读文件时忽略空行，写入文件时忽略空字符串
  override val ignoreHeader: Boolean       = true // 读的时候忽略头
  override val prependHeader: List[String] = List("time", "entity", "dimensions", "metricName", "metricValue") // 写的时候增加头
}
// 使用format隐藏参数
// 这个例子没有使用setField，因为这里的Metric是case class Metric(time: Long, entity: Int, dimensions: String, metricName: String, metricValue: Int)
val metrics = ReaderBuilder[Metric].convertFrom(ClassLoader.getSystemResourceAsStream("simple_data_header.tsv"))
val file = new File("./simple_data_header.tsv")
// 使用format隐藏参数
WriterBuilder[Metric].convertTo(metrics.filter(_.isDefined).map(_.get), file)
```

> 实际上CSV中也使用了默认的format隐式参数`implicit val defaultCsvFormat: CsvFormat = new DefaultCsvFormat {}`，如果像TSV这样自己定义一个，那么就会覆盖默认的隐式。
