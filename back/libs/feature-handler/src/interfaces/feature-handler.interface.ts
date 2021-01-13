/* istanbul ignore file */

// Declarative code
export interface IFeatureHandler {
  [key: string]: any;
  handle(arg?: any): Promise<any>;
}
