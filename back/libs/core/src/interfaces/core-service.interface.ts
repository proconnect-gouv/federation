import { Response } from 'express';

import { AuthorizationParameters } from '@fc/oidc-client';

export interface CoreServiceInterface {
  redirectToIdp: (
    res: Response,
    idpId: string,
    authorizeParams: AuthorizationParameters,
  ) => Promise<void>;
}
