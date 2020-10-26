import { TransformOptions } from 'class-transformer';
import { defaultMetadataStorage } from 'class-transformer/storage';

export function doJoin(joiner = ',') {
  return (value: any) => {
    return !!value || value === false ? Array.from(value).join(joiner) : null;
  };
}

// declarative code
/* istanbul ignore next */
export function Join(
  joiner: string,
  options: TransformOptions = {},
): PropertyDecorator {
  const transformFn = doJoin(joiner);

  return function (target: any, propertyName: string | symbol): void {
    defaultMetadataStorage.addTransformMetadata({
      target: target.constructor,
      propertyName: propertyName as string,
      transformFn,
      options,
    });
  };
}
