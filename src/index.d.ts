type ValueOf<T> = T[keyof T];

type AsArgument<T> = (arg: T) => void;
