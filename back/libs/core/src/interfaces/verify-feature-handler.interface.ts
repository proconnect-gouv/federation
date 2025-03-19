import { IFeatureHandler } from '@fc/feature-handler';
import { ISessionService, Session } from '@fc/session';

export interface IVerifyFeatureHandlerHandleArgument {
  sessionOidc: ISessionService<Session>;
  trackingContext?: Record<string, unknown>;
}
export interface IVerifyFeatureHandler
  extends IFeatureHandler<void, IVerifyFeatureHandlerHandleArgument> {
  /**
   * Override default handler.handle argument type
   */
  handle(options: IVerifyFeatureHandlerHandleArgument): Promise<void>;
}
