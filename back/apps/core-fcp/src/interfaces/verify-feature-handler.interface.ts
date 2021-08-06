/* istanbul ignore file */

// Declarative code
import { IFeatureHandler } from '@fc/feature-handler';
import { OidcClientSession } from '@fc/oidc-client';
import { ISessionService } from '@fc/session';

export interface IVerifyFeatureHandlerHandleArgument {
  sessionOidc: ISessionService<OidcClientSession>;
  trackingContext: Record<string, any>;
}
export interface IVerifyFeatureHandler extends IFeatureHandler {
  /**
   * Override default handler.handle argument type
   */
  handle(arg: IVerifyFeatureHandlerHandleArgument): Promise<void>;
}
