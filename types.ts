export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type Values<T> = {
  [K in keyof T]: [T[K]];
}[keyof T][];
