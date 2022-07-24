import {pipe} from 'fp-ts/function'
import {Apply1, sequenceS, sequenceT} from 'fp-ts/Apply'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/Array'
import * as TE from 'fp-ts/TaskEither'

import {Identity, identity as identityFunctorInstance} from './07.functor'

// lift2 :: Apply f
//       =>  (a ->   b ->   c)
//       -> f a -> f b -> f c
//
// lift2 ::       (a ->          b ->     c)
//       -> Option a -> Option b -> Option c
const lift2Option = <A, B, C>(f: (a: A) => (b: B) => C) => (a: O.Option<A>) => (b: O.Option<B>): O.Option<C> =>
  pipe(a, O.map(f), O.ap(b))

const lift3Option = <A, B, C, D>(f: (a: A) => (b: B) => (c: C) => D) => (a: O.Option<A>) => (b: O.Option<B>) => (
  c: O.Option<C>,
): O.Option<D> => pipe(a, O.map(f), O.ap(b), O.ap(c))

// Functor "lifts" a function into a context
//
// Lets you apply *unary* functions in a context
//
// map :: Functor f => (a -> b) -> (f a -> f b)
//
// Apply lets you apply *n-ary* functions in a context

const add = (x: number) => (y: number) => x + y

add(1)(2)

const mb2 = O.some(2)
const mb4 = O.some(4)

lift2Option(add)(mb2)(mb4)

pipe(mb2, O.map(add), O.ap(mb4))

// Laws
//
// Composition

// compose :: (b -> c) -> (a -> b) -> a -> c
const compose = <A, B, C>(f: (b: B) => C) => (g: (a: A) => B) => (x: A): C => f(g(x))

// x.ap(g.ap(f.map(compose))) === x.ap(g).ap(f)

const f = (n: number) => n > 5
const g = (s: string) => s.length

// (.) <$> f <*> g <*> x
const right = pipe(
  O.some(f), // Option<number => bool>
  O.map(compose), // Option<(string => number) => string => bool>
  // @ts-expect-error type inference isn't working =/
  O.ap(O.some(g)), // Option<string => bool>
  O.ap(O.some('hello')), // Option<bool>
)

// f <*> (g <*> x)
const left = pipe(
  O.some(f), // Option<number => bool>
  O.ap(
    pipe(
      O.some(g), // Option<string => number>
      O.ap(O.some('hello')), // Option<number>
    ),
  ),
)

console.log({right, left})

// ---

// Only using `map` wouldn't get us the desired result

const lift2FOption = <A, B, C>(f: (a: A) => (b: B) => C) => (fa: O.Option<A>) => (
  fb: O.Option<B>,
): O.Option<O.Option<C>> =>
  pipe(
    fa,
    O.map(a =>
      pipe(
        fb,
        O.map(b => f(a)(b)),
      ),
    ),
  )

// --- Instances

const identity: Apply1<'Identity'> = {
  ...identityFunctorInstance,
  ap: (fab, fa) => ({val: fab.val(fa.val)}),
}

const identityG: Identity<(s: string) => number> = {val: g}
const identityA: Identity<string> = {val: 'hello'}

identity.ap(identityG, identityA)

// Array<A>
//
// Array<A => B>

pipe(
  [g],
  A.ap(['hello', 'chau', 'John Doe']), // Array<number>
  v => console.log(v),
)

pipe(
  [(x: string) => x.toUpperCase(), (x: string) => `${x}!!!`], // Array<string => string>
  A.ap(['hello', 'chau', 'John Doe']), // Array<string>
  v => console.log(v),
)

pipe(
  O.some((x: string) => `${x}!!!`),
  O.ap(O.some('hello')), // O.some('hello!!!')
)

pipe(
  O.none,
  O.ap(O.some('hello')), // O.none
)

pipe(
  O.some((x: string) => `${x}!!!`),
  O.ap(O.none), // O.none
)

pipe(
  sequenceS(O.option)({id: O.some(1), name: O.some('Jane')}),
  O.map(({id, name}) => `${id}: ${name}`),
)

pipe(
  sequenceS(O.option)({id: O.none as O.Option<number>, name: O.some('Jane')}),
  O.map(({id, name}) => `${id}: ${name}`),
)

pipe(
  sequenceT(O.option)(O.some(1), O.some('Jane')),
  O.map(([id, name]) => `${id}: ${name}`),
)

const getJSON = (url: string): TE.TaskEither<string, unknown> =>
  TE.tryCatch(
    () => fetch(url).then(res => res.json()),
    _error => 'Failed to fetch',
  )

interface User {
  name: string
}

interface Weather {
  teperature: number
}

const decodeUsers = (_input: unknown): User[] => []
const decodeWeather = (_input: unknown): Weather => ({teperature: 10})

const renderPage = (_props: {users: User[]; weather: Weather}) => `<div>...</div>`

pipe(
  sequenceS(TE.taskEither)({
    users: pipe(getJSON('/users'), TE.map(decodeUsers)),
    weather: pipe(getJSON('/weather'), TE.map(decodeWeather)),
  }),
  TE.map(renderPage),
  TE.map(v => v),
)
