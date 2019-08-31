import * as assert from 'assert'
import { stream as S } from '../src'
import { at, continueWith, mergeArray, runEffects, tap } from '@most/core'
import { Scheduler, Stream } from '@most/types'
import { newDefaultScheduler } from '@most/scheduler'
import { array, cons } from 'fp-ts/lib/Array'
import { pipe } from 'fp-ts/lib/pipeable'
import { map as mapTask } from 'fp-ts/lib/Task'
import {
  NonEmptyArray,
  head as neaHead,
  tail as neaTail,
} from 'fp-ts/lib/NonEmptyArray'

const scheduler = newDefaultScheduler()

const from = <A>(xs: NonEmptyArray<A>): Stream<A> => {
  const head = neaHead(xs)
  const tail = neaTail(xs)

  const headStream = at(scheduler.currentTime() + 5, head)
  const tailStreams = array.mapWithIndex(tail, (i, x) =>
    at(scheduler.currentTime() + (i + 1) * 10, x),
  )

  const resultsStream = cons(headStream, tailStreams)

  return mergeArray(resultsStream)
}

const mkCollectEventsTask = <A>(stream: Stream<A>, scheduler: Scheduler) => {
  const eventValues: A[] = []
  const s = tap(x => eventValues.push(x), stream)

  return pipe(
    () => runEffects(s, scheduler),
    mapTask(() => eventValues),
  )
}

const testArray: NonEmptyArray<number> = [1, 2, 3]

const double = (n: number): number => n * 2
const triple = (n: number): number => n * 3

describe('@most/core:Stream', () => {
  it('of', () => {
    const resultStream = S.stream.of(1)

    const testTask = pipe(
      mkCollectEventsTask(resultStream, scheduler),
      mapTask(events => {
        assert.deepEqual(events, [1])
      }),
    )

    return testTask()
  })

  it('map', () => {
    const numbersStream = from(testArray)
    const resultStream = S.stream.map(numbersStream, double)

    const testTask = pipe(
      mkCollectEventsTask(resultStream, scheduler),
      mapTask(events => {
        assert.deepEqual(events, [2, 4, 6])
      }),
    )

    return testTask()
  })

  it('ap', () => {
    const numbersStream = from(testArray)
    const functionsStream = continueWith(
      () => S.stream.of(triple),
      S.stream.of(double),
    )
    const resultStream = S.stream.ap(functionsStream, numbersStream)

    const testTask = pipe(
      mkCollectEventsTask(resultStream, scheduler),
      mapTask(events => {
        assert.deepEqual(events, [3, 6, 9])
      }),
    )

    return testTask()
  })

  it('chain', () => {
    const numbersStream = from(testArray)
    const resultStream = S.stream.chain(numbersStream, a => from([a, a + 1]))

    const testTask = pipe(
      mkCollectEventsTask(resultStream, scheduler),
      mapTask(events => {
        assert.deepEqual(events, [1, 2, 2, 3, 3, 4])
      }),
    )

    return testTask()
  })

  it('zero', async () => {
    const resultStream = S.stream.zero()

    const testTask = pipe(
      mkCollectEventsTask(resultStream, scheduler),
      mapTask(events => {
        assert.deepEqual(events, [])
      }),
    )

    return testTask()
  })

  it('alt', async () => {
    const resultStream = S.stream.alt(S.stream.of(1), () => S.stream.of(2))

    const testTask = pipe(
      mkCollectEventsTask(resultStream, scheduler),
      mapTask(events => {
        assert.deepEqual(events, [1, 2])
      }),
    )

    return testTask()
  })

  it('getMonoid', async () => {
    const M = S.getMonoid<number>()
    const resultStream = M.concat(S.stream.of(1), S.stream.of(2))

    const testTask = pipe(
      mkCollectEventsTask(resultStream, scheduler),
      mapTask(events => {
        assert.deepEqual(events, [1, 2])
      }),
    )

    return testTask()
  })
})
