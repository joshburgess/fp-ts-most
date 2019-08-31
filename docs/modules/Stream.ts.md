---
title: Stream.ts
nav_order: 2
parent: Modules
---

---

<h2 class="text-delta">Table of contents</h2>

- [URI (type alias)](#uri-type-alias)
- [URI (constant)](#uri-constant)
- [stream (constant)](#stream-constant)
- [{](#)
- [getMonoid (function)](#getmonoid-function)
- [of (function)](#of-function)

---

# URI (type alias)

**Signature**

```ts
export type URI = typeof URI
```

# URI (constant)

**Signature**

```ts
export const URI = ...
```

# stream (constant)

**Signature**

```ts
export const stream: Monad1<URI> & Alternative1<URI> = ...
```

# {

alt,
ap,
apFirst,
apSecond,
chain,
chainFirst,
flatten,
map,
} (constant)

**Signature**

```ts
export const {
  alt,
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  flatten,
  map,
} = ...
```

# getMonoid (function)

**Signature**

```ts
export const getMonoid = <A = never>(): Monoid<Stream<A>> => ...
```

# of (function)

**Signature**

```ts
export const of = <A>(a: A): Stream<A> => ...
```
