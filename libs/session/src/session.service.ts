import { Injectable, Inject } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { SessionConfig } from './dto';
import {
  SessionBadFormatException,
  SessionNotFoundException,
  SessionBadSessionIdException,
} from './exceptions';
import { ISession, IPatchSession } from './interfaces';

@Injectable()
export class SessionService {
  private prefix: string;
  private cryptoKey: string;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    @Inject(REDIS_CONNECTION_TOKEN) private readonly redis: Redis,
    private readonly cryptography: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onModuleInit() {
    const { prefix, cryptographyKey } = this.config.get<SessionConfig>(
      'Session',
    );

    this.prefix = prefix;
    this.cryptoKey = cryptographyKey;
  }

  /**
   * Transform data to encrypted string, easy to persist.
   *
   * @param data data to serialize
   * @returns encrypted string representation of <data>
   */
  private serialize(data: object): string {
    const dataString = JSON.stringify(data);
    const dataCipher = this.cryptography.encryptSymetric(
      this.cryptoKey,
      dataString,
    );

    return dataCipher;
  }

  /**
   * Build back an object from encrypted string representation.
   *
   * @param data encrypted string representation of a data object
   * eg output of `serialize` method.
   * @returns object data
   */
  private unserialize(data: string): any {
    const dataString = this.cryptography.decryptSymetric(this.cryptoKey, data);

    try {
      return JSON.parse(dataString);
    } catch (error) {
      throw new SessionBadFormatException(error);
    }
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * Get Session from volatile memory
   *
   * @TODO #83 validate session data via DTO
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/83
   */
  async get(key: string): Promise<ISession> {
    this.logger.debug('get session from redis');
    const dataCipher = await this.redis.get(this.getKey(key));

    if (!dataCipher) {
      throw new SessionNotFoundException();
    }

    return this.unserialize(dataCipher);
  }

  /**
   * Store session data in volatile memory for later retrieval
   * when SP calls us on /userinfo
   *
   * @TODO #145 handle return or throw if persistance fails
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/150
   */
  async store(interactionId: string, data: ISession): Promise<boolean> {
    this.logger.debug('store session in redis');
    const serialized = this.serialize(data);
    const key = this.getKey(interactionId);
    const { lifetime } = this.config.get<SessionConfig>('Session');
    const multi = this.redis.multi();

    multi.set(key, serialized);
    multi.expire(key, lifetime);

    const status = await multi.exec();

    return Boolean(status);
  }

  /**
   * Remove an identity from volatile memory
   * @param key
   */
  async delete(key: string): Promise<number> {
    this.logger.debug('delete session from redis');

    return this.redis.del(this.getKey(key));
  }

  /**
   * Update the session by appending given properties to existing data.
   * Existing properties are overwritten
   * @param key
   * @param newValues
   */
  async set(key: string, newValues: IPatchSession) {
    const session = await this.get(key);
    this.store(key, { ...session, ...newValues });
  }

  setCookie(res, name, value) {
    const { cookieOptions } = this.config.get<SessionConfig>('Session');
    res.cookie(name, value, cookieOptions);
  }

  init(res, interactionId, properties) {
    const sessionId = this.cryptography.genSessionId();
    const { interactionCookieName, sessionCookieName } = this.config.get<
      SessionConfig
    >('Session');

    this.setCookie(res, interactionCookieName, interactionId);
    this.setCookie(res, sessionCookieName, sessionId);

    this.store(interactionId, {
      sessionId,
      ...properties,
    });
  }

  async verify(interactionId, sessionId) {
    const session = await this.get(interactionId);

    if (session.sessionId !== sessionId) {
      throw new SessionBadSessionIdException();
    }
  }

  refresh(key: string) {
    const { lifetime } = this.config.get<SessionConfig>('Session');
    this.redis.expire(key, lifetime);
  }
}
