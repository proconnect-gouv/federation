/* istanbul ignore file */

// Declarative code

/**
 * @todo améliorer le typage pour affiner l'ajout de données (FeatureHandler...)
 */

/**
 * The class that implements FeatureHandler
 * must contains a 'handle' function
 */
export interface IFeatureHandler<T = any> {
  [key: string]: any;
  handle(arg?: any): Promise<T>;
}
