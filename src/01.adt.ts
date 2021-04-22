// Based on
// **[Fantas, Eel, and Specification 1: Daggy](http://www.tomharding.me/2017/03/03/fantas-eel-and-specification/)**.

// const Coord = daggy.tagged('Coord', ['x', 'y', 'z'])

import {pipe} from 'fp-ts/function'

type Coord = {
  x: number
  y: number
  z: number
}

const Coord = (x: number) => (y: number) => (z: number): Coord => ({x, y, z})

const translateCoord = (x: number) => (y: number) => (z: number) => (coord: Coord): Coord => ({
  x: x + coord.x,
  y: y + coord.y,
  z: z + coord.z,
})

type Line = {
  from: Coord
  to: Coord
}

const Line = (from: Coord) => (to: Coord): Line => ({from, to})

const origin = Coord(0)(0)(0)

const dest = pipe(origin, translateCoord(1)(2)(3))

const line = Line(origin)(dest)

console.log(line)

// Sum types

type Bool = true | false

export const True: Bool = true
export const False: Bool = false

type Shape = {tag: 'Square'; topleft: Coord; bottomright: Coord} | {tag: 'Circle'; center: Coord; radius: number}

const Square = (topleft: Coord) => (bottomright: Coord): Shape => ({tag: 'Square', topleft, bottomright})

const Circle = (center: Coord) => (radius: number): Shape => ({tag: 'Circle', center, radius})

const matchShape = <R = unknown>(matchers: {
  Square: (topleft: Coord, bottomright: Coord) => R
  Circle: (center: Coord, radius: number) => R
}) => (shape: Shape): R => {
  if (shape.tag === 'Square') {
    return matchers.Square(shape.topleft, shape.bottomright)
  }

  return matchers.Circle(shape.center, shape.radius)
}

const translateShape = (x: number) => (y: number) => (z: number) => (shape: Shape): Shape => {
  const t = translateCoord(x)(y)(z)

  return matchShape({
    Square: (topleft, bottomright) => Square(t(topleft))(t(bottomright)),
    Circle: (center, radius) => Circle(t(center))(radius),
  })(shape)
}

console.log(translateShape(3)(3)(3)(Square(Coord(2)(2)(0))(Coord(3)(3)(0))))

console.log(translateShape(1)(2)(3)(Circle(Coord(2)(2)(0))(5)))

type List<A> = {tag: 'Cons'; head: A; tail: List<A>} | {tag: 'Nil'}

const Cons = <A>(head: A) => (tail: List<A>): List<A> => ({tag: 'Cons', head, tail})

const Nil = <A>(): List<A> => ({tag: 'Nil'})

const matchList = <A = unknown, R = unknown>(matchers: {Cons: (head: A, tail: List<A>) => R; Nil: () => R}) => (
  list: List<A>,
): R => {
  if (list.tag === 'Cons') {
    return matchers.Cons(list.head, list.tail)
  }

  return matchers.Nil()
}

const map = <A, B>(f: (a: A) => B) => (list: List<A>): List<B> =>
  matchList<A, List<B>>({
    Cons: (head, tail) => Cons(f(head))(map(f)(tail)),
    Nil,
  })(list)

const fromArray = <A>(as: A[]): List<A> => as.reduceRight((tail, head) => Cons(head)(tail), Nil<A>())

const toArrray = <A>(as: List<A>): A[] =>
  matchList<A, A[]>({
    Nil: () => [],
    Cons: (head, tail) => [head, ...toArrray(tail)],
  })(as)

const ns = fromArray([1, 2, 3]) // == Cons(1)(Cons(2)(Cons(3)(Nil())))

console.dir(
  pipe(
    ns,
    map(n => n.toString()),
  ),
  {depth: 5},
)

console.log(toArrray(fromArray([1, 2, 3, 4, 5, 6, 7])))
