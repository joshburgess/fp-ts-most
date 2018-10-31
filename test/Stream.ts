import * as assert from 'assert'
import { stream } from '../src/Stream'
import { at, continueWith, mergeArray, runEffects, tap } from '@most/core'
import { Scheduler, Stream } from '@most/types'
import { newDefaultScheduler } from '@most/scheduler'
import { array, cons, range, zip } from 'fp-ts/lib/Array'
import { NonEmptyArray } from 'fp-ts/lib/NonEmptyArray'

const mapIndexed = <A, B>(xs: A[], f: (x: A, i: number) => B): B[] => {
  const upperBound = xs.length
  const indices = range(0, upperBound)
  const zipped = zip(xs, indices)
  return array.map(zipped, ([val, i]) => f(val, i))
}

const scheduler = newDefaultScheduler()

const from = <A>(xs: NonEmptyArray<A>) => {
  const { head, tail } = xs

  const headStream = at(scheduler.currentTime() + 5, head)
  const tailStreams = mapIndexed(tail, (x, i) =>
    at(scheduler.currentTime() + (i + 1) * 10, x),
  )

  const resultsStream = cons(headStream, tailStreams)

  return mergeArray(resultsStream)
}

const collectEventValues = <A>(stream: Stream<A>, scheduler: Scheduler) => {
  const eventValues: A[] = []
  const s = tap(x => eventValues.push(x), stream)
  return runEffects(s, scheduler).then(() => eventValues)
}

const testArray = new NonEmptyArray(1, [2, 3])

const double = (n: number): number => n * 2
const triple = (n: number): number => n * 3

describe('@most/core:Stream', () => {
  it('of', () => {
    const resultStream = stream.of(1)

    return collectEventValues(resultStream, scheduler).then(events => {
      assert.deepEqual(events, [1])
    })
  })

  it('map', () => {
    const numbersStream = from(testArray)
    const resultStream = stream.map(numbersStream, double)

    return collectEventValues(resultStream, scheduler).then(events => {
      assert.deepEqual(events, [2, 4, 6])
    })
  })

  it('ap', () => {
    const numbersStream = from(testArray)
    const functionsStream = continueWith(
      () => stream.of(triple),
      stream.of(double),
    )
    const resultStream = stream.ap(functionsStream, numbersStream)

    return collectEventValues(resultStream, scheduler).then(events => {
      assert.deepEqual(events, [3, 6, 9])
    })
  })

  it('chain', () => {
    const numbersStream = from(testArray)
    const resultStream = stream.chain(numbersStream, a =>
      from(new NonEmptyArray(a, [a + 1])),
    )

    return collectEventValues(resultStream, scheduler).then(events => {
      assert.deepEqual(events, [1, 2, 2, 3, 3, 4])
    })
  })
})
