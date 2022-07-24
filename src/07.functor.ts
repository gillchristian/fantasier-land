import {Functor1} from 'fp-ts/Functor'
import * as A from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'

// map :: Functor f => (a -> b) -> f a -> f b

// Identity
// u.map(x => x) === u

// Composition:
// u.map(f).map(g) === u.map(x => g(f(x)))

type FunctorIdentity<A, B> = {
  map: (f: (a: A) => B) => (fa: Identity<A>) => Identity<B>
}

const getFunctorIdentity = <A, B>(): FunctorIdentity<A, B> => ({
  map: f => fa => ({val: f(fa.val)}),
})

console.log(getFunctorIdentity<string, number>().map(x => x.length)({val: 'hola'}))

export type Identity<A> = {val: A}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Identity: Identity<A>
  }
}

export const identity: Functor1<'Identity'> = {
  URI: 'Identity',
  map: (fa, f) => ({val: f(fa.val)}),
}

console.log(identity.map({val: 'hola'}, x => x.length))

export const mapIdentity = <A, B>(f: (a: A) => B) => (fa: Identity<A>): Identity<B> => identity.map(fa, f)

const length = (x: string) => x.length

pipe(
  {val: 'hola'},
  mapIdentity(length),
  mapIdentity(x => x + 1),
  mapIdentity(x => x.toString()),
  v => console.log(v),
)

length('hola')

const x: Identity<string> = {val: 'hola'}

// length(x)

// length(['hola', 'chau'])

//          A  =>          B
//    Array<A> =>    Array<B>
// Identity<A> => Identity<B>

pipe(x, mapIdentity(length))

pipe(['hola', 'chau'], A.map(length))

// -----------------------------------------------------------------------------

type Maybe<A> = {tag: 'Nothing'} | {tag: 'Just'; val: A}

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Maybe: Maybe<A>
  }
}

const maybe: Functor1<'Maybe'> = {
  URI: 'Maybe',
  map: (fa, f) => (fa.tag === 'Nothing' ? Nothing : Just(f(fa.val))),
}

const Nothing: Maybe<never> = {tag: 'Nothing'}

const Just = <A>(a: A): Maybe<A> => ({tag: 'Just', val: a})

export const mapMaybe = <A, B>(f: (a: A) => B) => (fa: Maybe<A>): Maybe<B> => maybe.map(fa, f)

const match = <A, R>(matchers: {Just: (a: A) => R; Nothing: () => R}) => (ma: Maybe<A>): R =>
  ma.tag === 'Nothing' ? matchers.Nothing() : matchers.Just(ma.val)

const y: Maybe<string> = Just('hola')

const z: Maybe<string> = Nothing

pipe(
  z,
  mapMaybe(length),
  mapMaybe(x => x + 1),
  match({Nothing: () => console.log('Got nothing'), Just: v => console.log(`Got ${v}`)}),
)

pipe(
  y,
  mapMaybe(length),
  mapMaybe(x => x + 1),
  match({Nothing: () => console.log('Got nothing'), Just: v => console.log(`Got ${v}`)}),
)
