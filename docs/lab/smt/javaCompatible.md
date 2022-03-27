---
toc: content
nav:
  path: /lab/smt
---

## @javaCompatible

注解`@javaCompatible` 用于为样例类生成无参构造函数和 get/set 方法。这在同时使用 Scala 样例类和 Java 库（如 mybatis 和 springboot）时非常有用。

**说明**

- 仅支持在样例类（case class）上使用。

**示例**

```scala
// 有继承父类的
class B(@BeanProperty val name: String, @BeanProperty val id: Int) //如果子类有重写父类的字段，必须为父类的字段添加 `@BeanProperty`
@javaCompatible case class A(a: Int, b: Short, override val name: String, override val id: Int) extends B(name, id)

// 没有继承
@javaCompatible case class A(a: Int, b: Short, c: Byte, d: Double, e: Float, f: Long, g: Char, h: Boolean, i: String)
```
