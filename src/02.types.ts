// Based on
// **[Fantas, Eel, and Specification 2: Type Signatures](http://www.tomharding.me/2017/03/08/fantas-eel-and-specification-2/)**.

// add :: Int -> Int -> Int

export type add = (x: number) => (y: number) => number

// zipWith :: (a -> b -> c) -> [a] -> [b] -> [c]

const zipWith = <A, B, C>(f: (a: A) => (b: B) => C) => (xs: A[]) => (ys: B[]): C[] => {
  const length = Math.min(xs.length, ys.length)

  const zs = Array(length)

  for (let i = 0; i < length; i++) {
    zs[i] = f(xs[i])(ys[i])
  }

  return zs
}

console.log(zipWith((x: number) => (y: string) => y.length > x)([3, 5])(['Good', 'Bad']))

// filter :: (a -> Bool) -> [a] -> [a]
export const filter = <A>(p: (a: A) => boolean) => (xs: A[]): A[] => xs.filter(p)

type Eq<A> = {
  equals: (a: A, b: A) => boolean
}

export const numberEq: Eq<number> = {
  equals: (a, b) => a === b
}

export const f = <A>(x: A, y: A) => (eq: Eq<A>) => {
  eq.equals(x, y) // boolean
}

// equals :: Eq a => a -> a -> Bool
export const equals = <A>(a: A) => (b: A): boolean => true // false
