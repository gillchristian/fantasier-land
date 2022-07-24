type ToString<A> = {
  stringify: (a: A) => string
}

const boolToString: ToString<boolean> = {
  stringify: (a) => a ? 'true' : 'false'
}

const boolToStringCapitalized: ToString<boolean> = {
  stringify: (a) => a ? 'TRUE' : 'FALSE'
}

boolToString.stringify(true)
boolToString.stringify(false)

type Foo = { tag: 'Bar' } | { tag: 'Baz' }

const fooToString: ToString<Foo> = {
  stringify: (a) => a.tag
}

fooToString.stringify({ tag: 'Bar' })

const greetings = <A>(toString: ToString<A>) => (x: A) =>
  `Hello ${toString.stringify(x)}!!!`

greetings(fooToString)({ tag: 'Bar' })

greetings(boolToString)(true)
greetings(boolToString)(false)

greetings(boolToStringCapitalized)(false)
