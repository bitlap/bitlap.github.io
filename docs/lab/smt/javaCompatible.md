---
toc: content
nav:
  path: /lab/smt
---

## @javaCompatible

The `@javaCompatible` annotation to generate non-parameter constructor and get/set method for case classes. 
This is useful when using Scala case class and Java libraries (such as myabtis and springboot) at the same time.

**Note**

- Only support `case class`.

**Example**

```scala
// inherit
class B(@BeanProperty val name: String, @BeanProperty val id: Int) //must add `@BeanProperty`
@JavaCompatible case class A(a: Int, b: Short, override val name: String, override val id: Int) extends B(name, id)

// not inherit
@javaCompatible case class A(a: Int, b: Short, c: Byte, d: Double, e: Float, f: Long, g: Char, h: Boolean, i: String)
```
