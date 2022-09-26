import {
  Controller,
  Get,
  HttpStatus,
  Injectable,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { FSA } from '@fc/common';
import { LoggerService } from '@fc/logger-legacy';
import { OidcClientSession } from '@fc/oidc-client';
import { ISessionService, Session, SessionCsrfService } from '@fc/session';
import { TracksService } from '@fc/tracks';

import { GetUserTracesQueryDto } from '../dto';
import { UserDashboardBackRoutes } from '../enums';
import { HttpErrorResponse } from '../interfaces';

@Injectable()
@Controller()
export class UserDashboardController {
  // eslint-disable-next-line max-params
  constructor(
    private readonly logger: LoggerService,
    private readonly csrfService: SessionCsrfService,
    private readonly tracks: TracksService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(UserDashboardBackRoutes.CSRF_TOKEN)
  async getCsrfToken(
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
  ): Promise<{ csrfToken: string }> {
    this.logger.debug('getCsrfToken()');
    const csrfToken = this.csrfService.get();
    await this.csrfService.save(sessionOidc, csrfToken);

    return { csrfToken };
  }

  @Get(UserDashboardBackRoutes.TRACKS)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getUserTraces(
    @Res({ passthrough: true }) res,
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
    @Query() query: GetUserTracesQueryDto,
  ): Promise<FSA | HttpErrorResponse> {
    this.logger.debug(`getUserTraces() with ${query}`);
    const idpIdentity = await sessionOidc.get('idpIdentity');
    if (!idpIdentity) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        code: 'INVALID_SESSION',
      });
    }

    this.logger.trace({ idpIdentity });
    const tracks = await this.tracks.getList(idpIdentity, query);
    this.logger.trace({ tracks });

    return {
      type: 'TRACKS_DATA',
      ...tracks,
    };
  }

  @Get(UserDashboardBackRoutes.USER_INFOS)
  async getUserInfos(
    @Res({ passthrough: true }) res,
    @Session('OidcClient')
    sessionOidc: ISessionService<OidcClientSession>,
  ): Promise<{ firstname: string; lastname: string } | HttpErrorResponse> {
    this.logger.debug('getUserInfos()');
    const idpIdentity = await sessionOidc.get('idpIdentity');
    if (!idpIdentity) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        code: 'INVALID_SESSION',
      });
    }

    const firstname = idpIdentity?.given_name;
    const lastname = idpIdentity?.family_name;

    this.logger.trace({ firstname, lastname });
    return { firstname, lastname };
  }
}
