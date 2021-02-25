import { FeatureHandlerNoHandler } from '../handlers';

const _mapping = new Map<string, any>();

// We need to assign the `null` value assigned to the `FeatureHandlerNoHandler()` class
// to create the corelation between the `null` value set in the database for no action to execute.
_mapping.set(null, new FeatureHandlerNoHandler());

export function FeatureHandler(key: string) {
  /**
   * @todo type target
   * We can't achieve typing of FeatureHandlerAbstract
   * Compilation fails on handlers definition in applications
   * if we try to use an abstract class or an interface.
   */
  return function (target: any) {
    FeatureHandler.cache.set(key, target);
    return target;
  };
}

// For Unit test purpose
FeatureHandler.cache = _mapping;

/**
 * Retrieve the instatiated class of a given feature handler key.
 *
 * @param {string} key Unique feature handler mapped name.
 * @param {any} ctx context given by the parent caller, usally = this.
 * @returns {class} Instatiated class
 */
FeatureHandler.get = function (key: string, ctx: any): any {
  switch (key) {
    //If the database contain an `undefined` feature handler value,
    //it is probably a database error.
    case undefined:
      throw new Error();

    //If the Feature Handler defined in the database is `null` or an empty string,
    //a handler class is returned with an empty handle() method.
    case '':
    case null:
      return new FeatureHandlerNoHandler();

    default:
      const klass = FeatureHandler.cache.get(key);
      return ctx.moduleRef.get(klass);
  }
};

/**
 * Retrieve the decorator declarations mapping.
 *
 * @returns {Array<string>}
 */
FeatureHandler.getAll = function (): Array<string> {
  return Array.from(FeatureHandler.cache.keys());
};
