import { Instantiable } from '@fc/common';

export interface InternalMappingInterface {
  alias: string;
  provider: Instantiable | object;
  methodName: string;
}
