import { TransformOptions } from 'class-transformer';
import { defaultMetadataStorage } from 'class-transformer/storage';

export function doSplit(separator: string | RegExp = ' ') {
  return (value: any) => {
    return value !== undefined && value !== null
      ? String(value).split(separator)
      : [];
  };
}

// declarative code
/* istanbul ignore next */
export function Split(
  separator: string | RegExp,
  options: TransformOptions = {},
): PropertyDecorator {
  const transformFn = doSplit(separator);

  return function (target: any, propertyName: string | symbol): void {
    defaultMetadataStorage.addTransformMetadata({
      target: target.constructor,
      propertyName: propertyName as string,
      transformFn,
      options,
    });
  };
}
