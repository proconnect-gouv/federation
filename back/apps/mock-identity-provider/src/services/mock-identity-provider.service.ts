import csvdb from 'node-csv-query';
import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { OidcSession } from '@fc/oidc';
import {
  OidcProviderMiddlewareStep,
  OidcProviderRoutes,
  OidcProviderService,
} from '@fc/oidc-provider';
import {
  ISessionGenericBoundContext,
  SessionGenericService,
} from '@fc/session-generic';
import { ConfigService } from '@fc/config';
import { ServiceProviderAdapterEnvService } from '@fc/service-provider-adapter-env';
import { AppConfig } from '../dto';
import { Csv } from '../interfaces';
import { OidcClaims } from '../interfaces/oidc-claims.interface';
@Injectable()
export class MockIdentityProviderService {
  private csvdbProxy = csvdb;

  private database;

  // Authorized in constructors
  // eslint-disable-next-line max-params
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly serviceProvider: ServiceProviderAdapterEnvService,
    private readonly sessionService: SessionGenericService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  async onModuleInit() {
    this.loadDatabase();
    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderRoutes.AUTHORIZATION,
      this.authorizationMiddleware.bind(this),
    );
  }

  private async authorizationMiddleware(ctx) {
    /**
     * Abort middleware if authorize is in error
     *
     * We do not want to start a session
     * nor trigger authorization event for invalid requests
     */
    if (ctx.oidc['isError'] === true) {
      return;
    }

    const { sessionId } = ctx.req;
    const interactionId = this.oidcProvider.getInteractionIdFromCtx(ctx);

    // oidc defined variable name
    const { client_id: spId, acr_values: spAcr } = ctx.oidc.params;

    const { name: spName } = await this.serviceProvider.getById(spId);

    const sessionProperties: OidcSession = {
      interactionId,
      spId,
      spAcr,
      spName,
    };

    const boundSessionContext: ISessionGenericBoundContext = {
      sessionId,
      moduleName: 'OidcClient',
    };
    const saveWithContext = this.sessionService.set.bind(
      this.sessionService,
      boundSessionContext,
    );
    await saveWithContext(sessionProperties);
  }

  private async loadDatabase(): Promise<void> {
    /**
     * @todo #307 Config this path
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/307
     */
    const { citizenDatabasePath } = this.config.get<AppConfig>('App');

    try {
      this.logger.debug('Loading database...');
      const data = await this.csvdbProxy(citizenDatabasePath, {
        rtrim: true,
      });

      this.database = data.rows.map(this.removeEmptyColums);
    } catch (error) {
      this.logger.fatal(
        `Failed to load CSV database, path was: ${citizenDatabasePath}`,
      );
      throw error;
    }

    this.logger.debug(
      `Database loaded (${this.database.length} entries found)`,
    );
  }

  private removeEmptyColums(data) {
    const cleanedData = {};
    Object.entries(data).forEach(([key, value]) => {
      if (value && value !== '') {
        cleanedData[key] = value;
      }
    });

    return cleanedData;
  }

  getIdentity(inputLogin: string) {
    const identity: Csv = this.database.find(
      ({ login }) => login === inputLogin,
    );

    if (!identity) {
      return;
    }

    return this.toOidcFormat(identity);
  }

  private toOidcFormat(identity: Csv): OidcClaims {
    // This copy works because "Csv" type only contains strings. Beware !
    const identityCopy = {
      ...identity,
    };

    identityCopy.sub = identity.login;
    delete identityCopy.login;

    if (this.oidcAddressFieldPresent(identityCopy)) {
      return this.formatOidcAddress(identityCopy) as OidcClaims;
    }

    return identityCopy as OidcClaims;
  }

  private formatOidcAddress(identity: Csv): Partial<OidcClaims> {
    const oidcIdentity: Partial<OidcClaims> = _.omit(identity, [
      'country',
      'postal_code',
      'locality',
      'street_address',
    ]);

    // oidc parameter
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { country, postal_code, locality, street_address } = identity;
    oidcIdentity.address = {
      country,
      // oidc parameter
      // eslint-disable-next-line @typescript-eslint/naming-convention
      postal_code,
      locality,
      // oidc parameter
      // eslint-disable-next-line @typescript-eslint/naming-convention
      street_address,
    };

    return oidcIdentity;
  }

  private oidcAddressFieldPresent(identity: Csv) {
    return Boolean(
      identity.country ||
        identity.postal_code ||
        identity.locality ||
        identity.street_address,
    );
  }
}
