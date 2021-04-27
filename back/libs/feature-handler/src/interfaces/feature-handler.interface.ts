/* istanbul ignore file */

// Declarative code

/**
 * @todo #429 améliorer le typage pour affiner l'ajout de données (FeatureHandler...)
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/429
 */

/**
 * The class that implements FeatureHandler
 * must contains a 'handle' function
 */
export interface IFeatureHandler<T = any> {
  [key: string]: any;
  handle(arg?: unknown | void): Promise<T>;
}
