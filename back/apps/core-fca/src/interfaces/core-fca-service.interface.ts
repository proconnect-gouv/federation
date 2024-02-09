/* istanbul ignore file */

// Declarative file
import { Response } from 'express';

import { CoreServiceInterface } from '@fc/core';
import { OidcClientSession } from '@fc/oidc-client';
import { ISessionService } from '@fc/session';

import { CoreFcaAuthorizationParametersInterface } from './core-fca-authorization-parameters.interface';

export interface CoreFcaServiceInterface extends CoreServiceInterface {
  redirectToIdp: (
    res: Response,
    idpId: string,
    session: ISessionService<OidcClientSession>,
    authorizeParams: CoreFcaAuthorizationParametersInterface,
  ) => Promise<void>;
}
