// Eq == Setoid
//
// equals :: Eq a => a -> a -> Boolean

import {pipe} from 'fp-ts/lib/function'
import * as fc from 'fast-check'

import {Coord, Line, List, matchList, isNil, fromArray} from './01.adt'

export type Eq<A> = {
  equals: (x: A) => (y: A) => boolean
}

export const eqCoord: Eq<Coord> = {
  equals: a => b => a.x === b.x && a.y === b.y && a.z === a.z,
}

const eqLine: Eq<Line> = {
  equals: a => b => eqCoord.equals(a.from)(b.from) && eqCoord.equals(a.to)(b.to),
}

export const eqNumber: Eq<number> = {
  equals: a => b => a === b,
}

// listEquals :: Eq a => [a] -> [a] -> Boolean

const getEqList = <A>(eqElem: Eq<A>): Eq<List<A>> => ({
  equals: a => b =>
    pipe(
      a,
      matchList({
        Nil: () => isNil(b),
        Cons: (headA, tailA) =>
          pipe(
            b,
            matchList({
              Nil: () => false,
              Cons: (headB, tailB) => eqElem.equals(headA)(headB) && getEqList(eqElem).equals(tailA)(tailB),
            }),
          ),
      }),
    ),
})

const xs = fromArray([1, 2, 3])
const ys = fromArray([1, 2, 3])

// Cons 1 (Cons 2 (Cons 3 Nil))
//
// Cons 1 (Cons 2 Nil)

const logLists = () => {
  console.log(getEqList(eqNumber).equals(xs)(ys))

  console.log(getEqList(eqNumber).equals(fromArray([1, 2]))(fromArray([1, 2, 3])))
}

type User = {
  id: string
  name: string
  // ....
}

const eqUser: Eq<User> = {
  equals: a => b => a.id === b.id,
}

// Laws

const testEqNumber = () => {
  // reflexivity:  Eq.equals(a)(a) === true
  fc.assert(fc.property(fc.integer(), a => eqNumber.equals(a)(a)))

  // symmetry: Eq.equals(a)(b) === Eq.equals(b)(a)
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => eqNumber.equals(a)(b) === eqNumber.equals(b)(a)))

  // transitivity: Eq.equals(a)(b) && Eq.equals(b)(c) then Eq.equals(a)(c)
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) =>
      eqNumber.equals(a)(b) && eqNumber.equals(b)(c) ? eqNumber.equals(a)(c) : true,
    ),
  )
}
