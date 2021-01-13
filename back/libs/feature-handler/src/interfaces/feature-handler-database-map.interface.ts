/* istanbul ignore file */

/**
 * This interface list all the attributes that MUST be set in each
 * Identity provider database collection.
 */

export type Dictionary<T> = {
  [key: string]: T;
};

export type IFeatureHandlerDatabaseMap = Dictionary<string>;
