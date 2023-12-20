import { Response } from 'express';
import { JWTPayload } from 'jose';

import { Body, Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';

import { DataProviderAdapterMongoService } from '@fc/data-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { OidcClientSession } from '@fc/oidc-client';
import { ISessionRequest, SessionService } from '@fc/session';

import { ChecktokenRequestDto } from '../dto';
import { DataProviderRoutes } from '../enums';
import { DataProviderService } from '../services';

@Controller()
export class DataProviderController {
  constructor(
    private readonly logger: LoggerService,
    private readonly dataProvider: DataProviderService,
    private readonly dataProviderAdapter: DataProviderAdapterMongoService,
    private readonly session: SessionService,
  ) {}

  @Post(DataProviderRoutes.CHECKTOKEN)
  async checktoken(
    @Req() req: ISessionRequest,
    @Res() res: Response,
    @Body() bodyChecktokenRequest: ChecktokenRequestDto,
  ) {
    let jwt: string;

    try {
      await this.dataProvider.checkRequestValid(bodyChecktokenRequest);

      const {
        access_token: accessToken,
        client_id: clientId,
        client_secret: clientSecret,
      } = bodyChecktokenRequest;

      await this.dataProviderAdapter.checkAuthentication(
        clientId,
        clientSecret,
      );

      const sessionId =
        await this.dataProvider.getSessionByAccessToken(accessToken);

      let payload: JWTPayload;

      if (!sessionId) {
        payload = this.dataProvider.generateExpiredPayload(clientId);
      } else {
        req.sessionId = sessionId;
        req.sessionService = this.session;
        const oidcSessionService =
          SessionService.getBoundSession<OidcClientSession>(req, 'OidcClient');

        payload = await this.dataProvider.generatePayload(
          oidcSessionService,
          accessToken,
          clientId,
        );
      }

      jwt = await this.dataProvider.generateJwt(payload, clientId);
    } catch (exception) {
      const {
        message,
        error = '',
        httpStatusCode = HttpStatus.INTERNAL_SERVER_ERROR,
      } = exception;
      this.logger.crit({ error }, message);

      const result = this.dataProvider.generateErrorMessage(
        httpStatusCode,
        message,
        error,
      );

      return res.status(httpStatusCode).json(result);
    }

    res.set('Content-Type', 'application/token-introspection+jwt');
    return res.status(HttpStatus.OK).end(jwt);
  }
}
