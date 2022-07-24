// lte :: Ord a => a -> a -> Boolean

import * as fc from 'fast-check'

import {Eq, eqNumber, eqCoord} from './03.eq'
import {Coord} from './01.adt'

interface Ord<A> extends Eq<A> {
  lte: (a: A) => (b: A) => boolean
}

const ordNumber: Ord<number> = {
  ...eqNumber,
  lte: a => b => a <= b,
}

const lte = <A>(ord: Ord<A>) => (x: A, y: A) => ord.lte(x)(y)

const gt = <A>(ord: Ord<A>) => (x: A, y: A) => !ord.lte(x)(y)

const gte = <A>(ord: Ord<A>) => (x: A, y: A) => gt(ord)(x, y) || ord.equals(x)(y)

const lt = <A>(ord: Ord<A>) => (x: A, y: A) => !gte(ord)(x, y)

ordNumber.lte(1)(2) // true
ordNumber.lte(2)(2) // true
ordNumber.lte(4)(2) // false

const ordCoord: Ord<Coord> = {
  ...eqCoord,
  lte: a => b => a.x <= b.x && a.y <= b.y && a.z <= b.z,
}

// Laws

const testOrdNumber = () => {
  // Totality: Ord.lte(a)(b) || Ord.lte(b)(a) === true
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => ordNumber.lte(a)(b) || ordNumber.lte(b)(a)))

  // Antisymmetry: Ord.lte(a)(b) && Ord.lte(b)(a) === Eq.equals(a)(b)
  fc.assert(
    fc.property(fc.integer(), fc.integer(), (a, b) =>
      ordNumber.lte(a)(b) && ordNumber.lte(b)(a) ? ordNumber.equals(a)(b) : true,
    ),
  )

  // Transitivity: Ord.lte(a)(b) && Ord.lte(b)(c) === Ord.lte(a)(c)
  fc.assert(
    fc.property(fc.integer(), fc.integer(), fc.integer(), (a, b, c) =>
      ordNumber.lte(a)(b) && ordNumber.lte(b)(c) ? ordNumber.lte(a)(c) : true,
    ),
  )
}

testOrdNumber()

type User = {
  id: string
  age: number
}

const ordUserByAge: Ord<User> = {
  equals: a => b => a.age === b.age,
  lte: a => b => a.age <= b.age,
}

const sort = <A>(ord: Ord<A>) => (xs: A[]): A[] => [...xs].sort((a, b) => (ord.lte(a)(b) ? -1 : 1))

const logSort = () => {
  console.log(sort(ordNumber)([3, 1, 2, 5, 2, 0]))

  console.log(
    sort(ordUserByAge)([
      {id: '123', age: 30},
      {id: 'abc', age: 18},
    ]),
  )
}

// logSort()
