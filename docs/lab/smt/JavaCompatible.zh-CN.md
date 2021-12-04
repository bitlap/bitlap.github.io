---
toc: content
nav:
  path: /lab/smt
---

## @JavaCompatible

注解`@JavaCompatible` 用于为样例类生成无参构造函数和get/set方法。这在同时使用Scala 样例类和Java库（如myabtis和springboot）时非常有用。

**说明**

- verbose 指定是否开启详细编译日志。可选，默认false。

- 仅支持在样例类（case class）上使用。

**示例**

```scala
// 有继承父类的
class B(@BeanProperty val name: String, @BeanProperty val id: Int) //如果子类有重写父类的字段，必须为父类的字段添加 `@BeanProperty`
@JavaCompatible case class A(a: Int, b: Short, override val name: String, override val id: Int) extends B(name, id)

// 没有继承
@JavaCompatible case class A(a: Int, b: Short, c: Byte, d: Double, e: Float, f: Long, g: Char, h: Boolean, i: String)
```
