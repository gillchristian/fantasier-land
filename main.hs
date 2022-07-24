class ToString a where
  stringify :: a -> String

instance ToString Bool where
  stringify True = "True"
  stringify False = "False"

class Filterable f where
  myFilter :: (a -> Bool) -> f a -> f a

instance Filterable [] where
  myFilter f [] = []
  myFilter f (x : xs) =
    if f x
      then x : myFilter f xs
      else myFilter f xs

data Option a
  = Algo a
  | Nada
  deriving (Show)

instance Filterable Option where
  myFilter f (Algo x) =
    if f x
      then Algo x
      else Nada
  myFilter _ Nada = Nada

main = do
  putStrLn $ stringify True
  print $ myFilter (> 1) (Algo 2)
  print $ myFilter (> 1) (Algo 0)

  print $ myFilter (> 1) [-1 .. 3]
