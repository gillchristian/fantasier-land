// Type Class
export type Semigroup<A> = {
  concat: (x: A, y: A) => A
}

// Associativity law

// a <> (b <> c) == (a <> b) <> c

// String

export const semigroupString: Semigroup<string> = {
  concat: (x, y) => x + y,
}

// Array

// concat :: [a] -> [a] -> [a]

export const getSemigroupArray = <A>(): Semigroup<Array<A>> => ({
  concat: (x, y) => x.concat(y),
})

const res = getSemigroupArray<number>().concat([1, 2, 3], [1, 2, 3])

// Semigroup<number>

export const semigroupSum: Semigroup<number> = {
  concat: (x, y) => x + y,
}

semigroupSum.concat(2, 3)

export const semigroupProduct: Semigroup<number> = {
  concat: (x, y) => x * y,
}

export const semigroupMax: Semigroup<number> = {
  concat: (x, y) => Math.max(x, y),
}

export const semigroupMin: Semigroup<number> = {
  concat: (x, y) => Math.min(x, y),
}

type Min = {val: number}

const Min = (val: number) => ({val})

const semigroupMin_: Semigroup<Min> = {
  concat: (x, y) => Min(Math.min(x.val, y.val)),
}

// Semigroup<boolean>

export const semigroupAny: Semigroup<boolean> = {
  concat: (x, y) => x || y,
}

export const semigroupAll: Semigroup<boolean> = {
  concat: (x, y) => x && y,
}

semigroupAny.concat(true, false)

// First / Last

export const getSemigroupFirst = <A>(): Semigroup<A> => ({
  concat: (x, _y) => x,
})

export const getSemigroupSecond = <A>(): Semigroup<A> => ({
  concat: (_x, y) => y,
})

// Tuple

export type Tuple<A, B> = [A, B]

// concat :: (Semigroup a, Semigroup b) => Tuple a b -> Tuple a b -> Tuple a b
// concat (x1, y1) (x2, y2) = (x1 <> x2, y1 <> y2)

export const getSemigroupTuple = <A, B>(semigroupA: Semigroup<A>, semigroupB: Semigroup<B>): Semigroup<Tuple<A, B>> => ({
  concat: ([x1, y1], [x2, y2]) => [semigroupA.concat(x1, x2), semigroupB.concat(y1, y2)],
})

getSemigroupTuple(semigroupSum, semigroupAll).concat([5, true], [3, false]) // [8, false]

type Tuple3<A, B, C> = [A, B, C]

const getSemigroupTuple3 = <A, B, C>(
  semigroupA: Semigroup<A>,
  semigroupB: Semigroup<B>,
  semigroupC: Semigroup<C>,
): Semigroup<Tuple3<A, B, C>> => ({
  concat: ([x1, y1, z1], [x2, y2, z2]) => [
    semigroupA.concat(x1, x2),
    semigroupB.concat(y1, y2),
    semigroupC.concat(z1, z2),
  ],
})

type Tuple4<A, B, C, D> = [A, B, C, D]

const getSemigroupTuple4 = <A, B, C, D>(
  semigroupA: Semigroup<A>,
  semigroupB: Semigroup<B>,
  semigroupC: Semigroup<C>,
  semigroupD: Semigroup<D>,
): Semigroup<Tuple4<A, B, C, D>> => ({
  concat: ([a1, b1, c1, d1], [a2, b2, c2, d2]) => [
    semigroupA.concat(a1, a2),
    semigroupB.concat(b1, b2),
    semigroupC.concat(c1, c2),
    semigroupD.concat(d1, d2),
  ],
})

// Customer

type Customer = {
  name: string
  favourites: string[]
  registrationDate: number
  hasMadePurchase: boolean
}

const Customer = (
  name: string,
  favourites: string[],
  registrationDate: number,
  hasMadePurchase: boolean,
): Customer => ({
  name,
  favourites,
  registrationDate,
  hasMadePurchase,
})

const semigroupCustomer: Semigroup<Customer> = {
  concat: (x, y) =>
    Customer(
      x.name,
      getSemigroupArray<string>().concat(x.favourites, y.favourites),
      semigroupMin.concat(x.registrationDate, y.registrationDate),
      semigroupAny.concat(x.hasMadePurchase, y.hasMadePurchase),
    ),
}

const myStrategy = {
  semigroup: getSemigroupTuple4(getSemigroupFirst<string>(), getSemigroupArray<string>(), semigroupMin, semigroupAny),
  to: (customer: Customer): Tuple4<string, string[], number, boolean> => [
    customer.name,
    customer.favourites,
    customer.registrationDate,
    customer.hasMadePurchase,
  ],
  from: ([name, favourites, registrationDate, hasMadePurchase]: Tuple4<string, string[], number, boolean>): Customer =>
    Customer(name, favourites, registrationDate, hasMadePurchase),
}

// merge :: Semigroup m => { to :: a -> m, from :: m -> a } -> a -> a -> a

type Strategy<A, M> = {
  semigroup: Semigroup<M>
  to: (a: A) => M
  from: (m: M) => A
}

const merge = <A, M>(strategy: Strategy<A, M>) => (x: A) => (y: A): A =>
  strategy.from(strategy.semigroup.concat(strategy.to(x), strategy.to(y)))
