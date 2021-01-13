const _mapping = new Map<string, any>();
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
 * @param {object} ctx context given by te parent caller, usally = this.
 * @returns {class} Instatiated class
 */

FeatureHandler.get = function (key: string, ctx: any): any {
  const klass = FeatureHandler.cache.get(key);
  return ctx.moduleRef.get(klass);
};

/**
 * Retrieve the decorator declarations mapping.
 *
 * @returns {Array<string>}
 */
FeatureHandler.getAll = function (): Array<string> {
  return Array.from(FeatureHandler.cache.keys());
};
