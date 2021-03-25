/* istanbul ignore file */

/**
 * This interface list all the attributes that MUST be set in each
 * Identity provider database collection.
 */

export type IFeatureHandlerDatabaseMap<T extends string = string> = Record<
  T,
  string
>;
