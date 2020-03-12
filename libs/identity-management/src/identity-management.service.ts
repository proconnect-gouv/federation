import { Injectable } from '@nestjs/common';
import { IIdentityManagementService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';

/** @TODO Remove this POC storage and use a proper tool */
const uglyTemporaryStoreThatShouldBeReplacedByRedis = {};

@Injectable()
export class IdentityManagementService implements IIdentityManagementService {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(this.constructor.name);
  }
  /**
   * Get data from volatile memory
   *
   * @TODO interface/DTO for identity
   * @TODO store identity in Redis (via an injected presistance wrapper)
   * @TODO decrypt data before returning (via an injected crypto wrapper)
   * @TODO handle return or throw if persistance fails
   */
  async getIdentity(id: string): Promise<boolean | object> {
    this.logger.debug(`getIdentity with id: <${id}>`);

    if (!uglyTemporaryStoreThatShouldBeReplacedByRedis.hasOwnProperty(id)) {
      this.logger.debug('Id not found');
      return false;
    }

    this.logger.debug('Id found');

    return uglyTemporaryStoreThatShouldBeReplacedByRedis[id] as object;
  }

  /**
   * Store identity in volatile memory for later retrieval
   * when SP calls us on /userinfo
   *
   * @TODO interface/DTO for identity
   * @TODO store identity in Redis (via an injected presistance wrapper)
   * @TODO encrypt data before storage (via an injected crypto wrapper)
   * @TODO handle return or throw if persistance fails
   */
  async storeIdentity(key: string, identity: object): Promise<boolean> {
    this.logger.trace('Store identity');
    this.logger.trace({ key, identity });

    uglyTemporaryStoreThatShouldBeReplacedByRedis[key] = identity;

    return true;
  }
}
