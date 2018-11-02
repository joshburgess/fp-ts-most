import { Alternative1 } from 'fp-ts/lib/Alternative'
import { Monad1 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { Sink, Disposable, Stream } from '@most/types'
import {
  ap as _ap,
  chain as _chain,
  empty,
  map as _map,
  merge,
  now,
} from '@most/core'

const EMPTY = empty()

export const URI = '@most/core:Stream'

export type URI = typeof URI

declare module '@most/types' {
  interface Stream<A> {
    readonly _URI: URI
    readonly _A: A
  }
}

declare module '@most/core/type-definitions/combinator/multicast' {
  interface MulticastSource<A> extends Stream<A>, Sink<A>, Disposable {
    readonly _URI: URI
    readonly _A: A
  }
}

declare module 'fp-ts/lib/HKT' {
  interface URI2HKT<A> {
    readonly '@most/core:Stream': Stream<A>
  }
}

export const getMonoid = <A = never>(): Monoid<Stream<A>> => {
  return {
    concat: merge,
    empty: EMPTY,
  }
}

const map = <A, B>(fa: Stream<A>, f: (a: A) => B): Stream<B> =>
  _map<A, B>(f, fa)

const of = <A>(a: A): Stream<A> => now(a)

const chain = <A, B>(fa: Stream<A>, f: (a: A) => Stream<B>): Stream<B> =>
  _chain(f, fa)

const zero = <A>(): Stream<A> => EMPTY

export const stream: Monad1<URI> & Alternative1<URI> = {
  URI,
  map,
  of,
  ap: _ap,
  chain,
  zero,
  alt: merge,
}
