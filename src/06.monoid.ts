import {pipe} from 'fp-ts/lib/function'
import {
  Semigroup,
  semigroupString,
  getSemigroupArray,
  semigroupSum,
  semigroupProduct,
  getSemigroupFirst,
  semigroupAny,
  semigroupAll,
  Tuple,
  getSemigroupTuple,
} from './05.semigroup'

type Monoid<A> = Semigroup<A> & {empty: A}

// Right identity law

// a <> emty == a

// Left identity law

// empty <> a == a

// String

const monoidString: Monoid<string> = {
  ...semigroupString,
  empty: '',
}

// Array

const getMonoidArray = <A>(): Monoid<Array<A>> => ({
  ...getSemigroupArray<A>(),
  empty: [],
})

// Monoid<number>

const monoidSum: Monoid<number> = {
  ...semigroupSum,
  empty: 0,
}

const monoidProduct: Monoid<number> = {
  ...semigroupProduct,
  empty: 1,
}

// Monoid<boolean>

const monoidAny: Monoid<boolean> = {
  ...semigroupAny,
  empty: false,
}

const monoidAll: Monoid<boolean> = {
  ...semigroupAll,
  empty: true,
}

// First

const getMonoidFirst = <A>(): Monoid<A> => ({
  ...getSemigroupFirst<A>(),
  empty: undefined as any, // Not possible to have empty for First
})

const getMonoidTuple = <A, B>(monoidA: Monoid<A>, monoidB: Monoid<B>): Monoid<Tuple<A, B>> => ({
  ...getSemigroupTuple(monoidA, monoidB),
  empty: [monoidA.empty, monoidB.empty],
})

// reduce-ing with Monoids

// fold :: Monoid m => (a -> m) -> [a] -> m

const fold = <A>(monoid: Monoid<A>) => (xs: Array<A>): A => xs.reduce(monoid.concat, monoid.empty)

fold(monoidProduct)([1, 2, 3, 4]) // 24
fold(monoidSum)([1, 2, 3, 4]) // 10

fold(monoidSum)([]) // 0 - empty !!!

fold(monoidAny)([true, false, false, false]) // true
fold(monoidAll)([false, true, true, true]) // false

// Monoid<(a: A) => B>

type Function<A, B> = (a: A) => B

const getMonoidFunc = <A, B>(monoidB: Monoid<B>): Monoid<Function<A, B>> => ({
  concat: (funcX, funcY) => (a: A) => monoidB.concat(funcX(a), funcY(a)),
  empty: (a: A) => monoidB.empty,
})

const isOdd = (x: number) => x % 2 === 1

const isDivBy3 = (x: number) => x % 3 === 0

const gt100 = (x: number) => x > 100

const lt500 = (x: number) => x < 500

const validate = pipe(
  [isOdd, gt100, isDivBy3, lt500],
  fold(getMonoidFunc(monoidAll))
)

const validate_ = (x: number) =>pipe(
  [isOdd(x), gt100(x), isDivBy3(x), lt500(x)],
  fold(monoidAll)
)

const validate__ = (x: number) =>
  isOdd(x) && gt100(x) && isDivBy3(x) && lt500(x)

const logValidation = () => {
  console.log('validate(10)', validate(10))
  console.log('validate(225)', validate(225))
}

// logValidation()
