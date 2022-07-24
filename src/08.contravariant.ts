import {Contravariant1} from 'fp-ts/Contravariant'
import * as Ord from 'fp-ts/Ord'
import * as Eq from 'fp-ts/Eq'
import * as A from 'fp-ts/Array'
import {pipe} from 'fp-ts/function'

// Contravariant
// contramap :: f a ~> (b -> a) -> f b

type Predicate<A> = (a: A) => boolean

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Predicate: Predicate<A>
  }
}

const predicate: Contravariant1<'Predicate'> = {
  URI: 'Predicate',
  contramap: (fa, f) => x => fa(f(x)),
}

// pipe friendly version
const contramap = <A, B>(f: (b: B) => A) => (fa: Predicate<A>): Predicate<B> => predicate.contramap(fa, f)

const isEven: Predicate<number> = n => n % 2 === 0

const lengthIsEven: Predicate<string> = contramap((n: string) => n.length)(isEven)

type User = {
  name: string
  age: number
}

const userAge = ({age}: User) => age

const userAgeIsEven: Predicate<User> = contramap(userAge)(isEven)

const jane = {name: 'Jane', age: 21}
const marco = {name: 'Marco', age: 90}

userAgeIsEven(jane) // false

userAgeIsEven(marco) // true

const ordUserByAge = Ord.contramap(userAge)(Ord.ordNumber)

console.log(A.sort(ordUserByAge)([marco, jane])) // [jane, marco]

// --- Laws ---

// Identity
// U.contramap(x => x) === U

const identityIsEven = contramap((x: number) => x)(isEven)

isEven(10) // true
identityIsEven(10) // true

// Composition
// U.contramap(f).contramap(g) === U.contramap(x => f(g(x)))

const length = (s: string) => s.length
const userName = ({name}: User) => name

const userNameLengthIsEven_notComposed = pipe(isEven, contramap(length), contramap(userName))

const userNameLengthIsEven_composed = pipe(
  isEven,
  contramap((user: User) => length(userName(user))),
)

console.log('notComposed', userNameLengthIsEven_notComposed(jane))
console.log('composed', userNameLengthIsEven_composed(jane))

console.log('notComposed', userNameLengthIsEven_notComposed(marco))
console.log('composed', userNameLengthIsEven_composed(marco))

// ---

type ToString<A> = (a: A) => string

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly ToString: ToString<A>
  }
}

const toString: Contravariant1<'ToString'> = {
  URI: 'ToString',
  contramap: (fa, f) => x => fa(f(x)),
}

const numberToString: ToString<number> = (x: number) => `int(${x})`

const stringArrayToString: ToString<string[]> = toString.contramap(
  (x: string) => `[ ${x} ]`,
  x => x.join(', '),
)

console.log(stringArrayToString(['a', 'b', 'c']))

const arrayToString = <A>(tsA: ToString<A>): ToString<Array<A>> =>
  toString.contramap(stringArrayToString, x => x.map(tsA))

const numbersToString = arrayToString(numberToString)

console.log(numbersToString([1, 2, 3]))

const matrixToString = arrayToString(numbersToString)

console.log(
  matrixToString([
    [1, 2, 3],
    [4, 5, 6],
  ]),
)

// ---

type Equivalence<A> = (a: A) => (a: A) => boolean

declare module 'fp-ts/lib/HKT' {
  interface URItoKind<A> {
    readonly Equivalence: Equivalence<A>
  }
}

const equivalence: Contravariant1<'Equivalence'> = {
  URI: 'Equivalence',
  contramap: (fa, f) => x => y => fa(f(x))(f(y)),
}

const equivalenceContramap = <A, B>(f: (b: B) => A) => (fa: Equivalence<A>): Equivalence<B> =>
  equivalence.contramap(fa, f)

const stringEquivalence: Equivalence<string> = x => y => x === y

const searchCheck = pipe(
  stringEquivalence,
  // Remove symbols
  equivalenceContramap((x: string) => x.replace(/\W+/, '')),
  // Lowercase alpha
  equivalenceContramap((x: string) => x.toLowerCase()),
)

searchCheck('Hello')('HELLO!') // true
searchCheck('World')('Werld') // false

const searchCheck_ = pipe(
  Eq.eqString,
  Eq.contramap((x: string) => x.replace(/\W+/, '')),
  Eq.contramap((x: string) => x.toLowerCase()),
)

searchCheck_.equals('Hello', 'HELLO!') // true
searchCheck_.equals('World', 'Werld') // false
