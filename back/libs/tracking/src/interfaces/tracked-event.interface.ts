import { Type } from '@nestjs/common';

import { FcException } from '@fc/exceptions/exceptions';

export interface TrackedEventInterface {
  /**
   * Event name.
   * Use an explicit name
   */
  readonly event: string;

  /**
   * Automatically track exception
   */
  readonly exceptions?: Array<Type<FcException>>;
}
