// biome-ignore lint/style/noNamespace: add custom utility types
declare namespace UtilityTypes {
  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
  export type Either<T, U> = T | U extends object
    ? (Without<T, U> & U) | (Without<U, T> & T)
    : T | U
}
