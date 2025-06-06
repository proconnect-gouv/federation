import { TransformFnParams } from 'class-transformer';
/**
 * @todo Remove this internal API coupling or make it reliable
 * The defaultMetadataStorage is a class-transformer internal API that can be broken at any time.
 * An issue is open on github to ask the maintainer to give a public API for this purpose,
 * @see https://github.com/typestack/class-transformer/issues/563
 */
import { defaultMetadataStorage } from 'class-transformer/cjs/storage';

import { SplitOptionsInterface } from '../interfaces';

export function doSplit(
  separator: string | RegExp = ' ',
  options: SplitOptionsInterface,
) {
  return ({ value }: Partial<TransformFnParams>): Array<string> => {
    if (options.maxLength && value.length > options.maxLength) {
      return [];
    }

    return typeof value === 'string' ? String(value).split(separator) : [];
  };
}

// declarative code
/* istanbul ignore next */
export function Split(
  separator: string | RegExp,
  options: SplitOptionsInterface = {},
): PropertyDecorator {
  const transformFn = doSplit(separator, options);

  return function (target: any, propertyName: string | symbol): void {
    defaultMetadataStorage.addTransformMetadata({
      target: target.constructor,
      propertyName: propertyName as string,
      transformFn,
      options,
    });
  };
}
