import { Response } from 'express';

import { AuthorizationParameters } from '@fc/oidc-client';

export interface CoreServiceInterface {
  redirectToIdp: (req: Request, res: Response, idpId: string) => Promise<void>;
}

export interface CoreAuthorizationServiceInterface {
  getAuthorizeUrl(
    idpId: string,
    parameters: AuthorizationParameters,
  ): Promise<string>;
}
