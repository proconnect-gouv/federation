/* istanbul ignore file */

// Declarative file
import { Response } from 'express';

import { CoreServiceInterface } from '@fc/core';
import { OidcClientSession } from '@fc/oidc-client';
import { ISessionService } from '@fc/session';

import { CoreFcpAuthorizationParametersInterface } from './core-fcp-authorization-parameters.interface';

export interface CoreFcpServiceInterface extends CoreServiceInterface {
  redirectToIdp: (
    res: Response,
    idpId: string,
    session: ISessionService<OidcClientSession>,
    authorizeParams: CoreFcpAuthorizationParametersInterface,
  ) => Promise<void>;
}
