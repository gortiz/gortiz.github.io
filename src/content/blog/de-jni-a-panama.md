---
title: De JNI a Panama en una función
description: Llamamos a una función de Rust desde Java dos veces, primero con JNI y después con la Foreign Function & Memory API, y comparamos lo que pide cada una.
pubDate: 2026-10-22
draft: true
lang: es
translationKey: jni-to-panama
tags: [java, rust, panama]
talk: panama-rust
---

Este post llama desde Java a la función nativa más pequeña posible, `add(a, b)`, de dos formas.
Primero con la Java Native Interface (JNI) y después con la Foreign Function & Memory (FFM) API de Project Panama.

## El lado nativo

Con Panama, la librería de Rust exporta una función C normal:

```rust title="src/lib.rs"
#[unsafe(no_mangle)]
pub extern "C" fn add(a: i32, b: i32) -> i32 {
    a + b
}
```

## El lado Java

```java title="PanamaAdd.java" {2-5}
public class PanamaAdd {
    private static final MethodHandle ADD = Linker.nativeLinker().downcallHandle(
            SymbolLookup.libraryLookup("libadd.so", Arena.global())
                    .find("add").orElseThrow(),
            FunctionDescriptor.of(JAVA_INT, JAVA_INT, JAVA_INT));

    public static int add(int a, int b) {
        try {
            return (int) ADD.invokeExact(a, b);
        } catch (Throwable t) {
            throw new AssertionError(t);
        }
    }
}
```

```mermaid
flowchart LR
    J[Código Java] -->|invokeExact| V[JVM]
    V -->|ABI de C| R[Librería Rust]
```

La versión completa, con JNI, está en inglés.
