-- TypeClasses

class ToString a where
  stringify :: a -> String

instance ToString Bool where
  stringify x =
    if x
      then "True"
      else "False"

data Foo = Bar | Baz

instance ToString Foo where
  stringify x =
    case x of
      Bar -> "Bar"
      Baz -> "Baz"

greetings :: ToString a => a -> String
greetings x = "Hello " ++ stringify x ++ "!!!"

main = do
  putStrLn (stringify True)
  putStrLn (stringify False)

  putStrLn ("Hola " ++ stringify False ++ " " ++ stringify True)

  putStrLn (stringify True)

  putStrLn (stringify Bar)
  putStrLn (stringify Baz)

  putStrLn (greetings True)
  putStrLn (greetings Bar)
