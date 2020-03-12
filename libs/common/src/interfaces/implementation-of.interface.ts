export interface ImplementationOf<T> {
  new (...args: any[]): T;
}
