import { UserSession } from '@fc/core-fca';
import { IFeatureHandler } from '@fc/feature-handler';
import { ISessionService } from '@fc/session';

export interface IVerifyFeatureHandlerHandleArgument {
  sessionOidc: ISessionService<UserSession>;
  trackingContext?: Record<string, unknown>;
}
export interface IVerifyFeatureHandler
  extends IFeatureHandler<void, IVerifyFeatureHandlerHandleArgument> {
  /**
   * Override default handler.handle argument type
   */
  handle(options: IVerifyFeatureHandlerHandleArgument): Promise<void>;
}
