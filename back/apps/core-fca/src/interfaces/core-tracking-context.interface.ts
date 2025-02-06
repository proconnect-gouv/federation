import { ICoreTrackingContext } from '@fc/core';

export interface CoreFcaTrackingContextInterface extends ICoreTrackingContext {
  readonly fqdn?: string;
  readonly email?: string;
  readonly idpSub?: string;
}
