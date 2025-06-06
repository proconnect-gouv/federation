/**
 * To understand, please read the following documentation
 * @see https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html#extends
 * @see https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html#the-keyof-type-operator
 */
export interface ISessionService<T> {
  /**
   * Retrieves a part of a module session
   * @param key The key of the sub data to retrieve
   * @return The module session or a part of it
   */
  get<K extends keyof T>(key: K): T[typeof key] | undefined;
  /**
   * Retrieves a module session
   * @return The module session or a part of it
   */
  get(): T | undefined;
  /**
   * Set a data for a particular key in the session
   * @param key The key
   * @param data The data to set in session
   * @return The "set" operation result as a boolean
   */
  set<K extends keyof T>(key: K, value: T[typeof key]): boolean;
  /**
   * Patch a module session or a part of it
   * @param value The session module to use as a patch
   * @return The "set" operation result as a boolean
   */
  set(value: Partial<T>): boolean;

  commit(): Promise<boolean>;

  duplicate(): Promise<boolean>;

  reset(): Promise<boolean>;

  destroy(): Promise<boolean>;
}
