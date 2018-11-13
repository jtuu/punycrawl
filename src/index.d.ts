type ValueOf<T> = T[keyof T];

type AsArgument<T> = (arg: T) => void;

type TuplePrototypes<T> = { [P in keyof T]: T[P] extends Function ? T[P]["prototype"] : never } extends { [key: number]: infer V } ? V : never;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
