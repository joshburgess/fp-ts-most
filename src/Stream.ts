import { Alternative1 } from 'fp-ts/lib/Alternative'
import { Monad1 } from 'fp-ts/lib/Monad'
import { Monoid } from 'fp-ts/lib/Monoid'
import { pipeable } from 'fp-ts/lib/pipeable'
import { Stream } from '@most/types'
import {
  ap as mostAp,
  chain as mostChain,
  empty,
  map as mostMap,
  merge,
  now,
} from '@most/core'

export const URI = '@most/core:Stream'

export type URI = typeof URI

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly '@most/core:Stream': Stream<A>
  }
}

const EMPTY = empty()

export const getMonoid = <A = never>(): Monoid<Stream<A>> => {
  return {
    concat: merge,
    empty: EMPTY,
  }
}

export const of = <A>(a: A): Stream<A> => now(a)

export const stream: Monad1<URI> & Alternative1<URI> = {
  URI,
  map: (fa, f) => mostMap(f, fa),
  of,
  ap: mostAp,
  chain: (fa, f) => mostChain(f, fa),
  zero: () => EMPTY,
  alt: (fx, f) => merge(fx, f()),
}

export const {
  alt,
  ap,
  apFirst,
  apSecond,
  chain,
  chainFirst,
  flatten,
  map,
} = pipeable(stream)
