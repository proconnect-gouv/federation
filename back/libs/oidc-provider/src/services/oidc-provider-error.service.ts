import { KoaContextWithOIDC } from 'oidc-provider';

import { Injectable } from '@nestjs/common';

import { throwException } from '@fc/exceptions/helpers';

import { OidcProviderNoWrapperException } from '../exceptions';

@Injectable()
export class OidcProviderErrorService {
  /**
   * @deprecated this should render a simple error page
   *
   * @param {KoaContextWithOIDC} ctx Koa's `ctx` object
   * @param {string} out output body, we won't use it here.
   * @param {any} error error trown from oidc-provider
   *
   * @see https://github.com/panva/node-oidc-provider/tree/master/docs#rendererror
   */
  async renderError(ctx: KoaContextWithOIDC, _out: string, error: any) {
    const wrappedError = new OidcProviderNoWrapperException(error);

    /**
     * Flag the request as invalid
     * to inform async treatment (event listeners)
     */
    if (ctx?.oidc) {
      ctx.oidc['isError'] = true;
    }

    await throwException(wrappedError);
  }
}
