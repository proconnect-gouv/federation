import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, validationOptions } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { validateDto } from '@fc/common';
import { IBoundSessionContext, ISessionGenericOptions } from './interfaces';
import { SESSION_TOKEN_OPTIONS } from './tokens';
import { SessionGenericConfig } from './dto';
import { SessionBadFormatException } from './exceptions';

@Injectable()
export class SessionGenericService {
  private prefix: string;
  private encryptionKey: string;
  private lifetime: number;

  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    @Inject(SESSION_TOKEN_OPTIONS)
    private readonly sessionOptions: ISessionGenericOptions,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    @Inject(REDIS_CONNECTION_TOKEN)
    private readonly redis: Redis,
    private readonly cryptography: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onModuleInit() {
    const {
      prefix,
      encryptionKey,
      lifetime,
    } = this.config.get<SessionGenericConfig>('SessionGeneric');

    this.prefix = prefix;
    this.encryptionKey = encryptionKey;
    this.lifetime = lifetime;
  }

  /**
   * Retrieves a module session or a part of it
   *
   * @param ctx The context bounded by the interceptor
   * @param key The key of the sub data to retrieve
   * @return The module session or a part of it
   */
  async get(
    ctx: IBoundSessionContext,
    key?: string,
  ): Promise<unknown | undefined> {
    const session = await this.getFullSession(ctx);

    if (key) {
      return this.getByKey(ctx, session, key);
    }

    return this.getModule(ctx, session);
  }

  /**
   * Patch a module session or a part of it
   *
   * @param ctx The context bounded by the interceptor
   * @param keyOrData The module data if it's a patch, else the key
   * @param data The data to set in session if the key is provided
   * @return The "save" operation result as a boolean
   */
  async set(
    ctx: IBoundSessionContext,
    keyOrData: string | object,
    data?: unknown,
  ): Promise<boolean> {
    this.logger.debug('store session in redis');
    const session = await this.getFullSession(ctx);

    if (typeof keyOrData === 'string') {
      this.setByKey(ctx, session, keyOrData, data);
    } else if (typeof keyOrData === 'object') {
      this.setModule(ctx, session, keyOrData);
    }

    return this.save(ctx, session);
  }

  /**
   * Refresh the TTL of the session in redis
   *
   * @param ctx The context bounded by the interceptor to the "set" or "get" operation
   * @return The "expire" operation result as a boolean
   */
  async refresh(ctx: IBoundSessionContext): Promise<boolean> {
    const sessionKey = this.getSessionKey(ctx);
    const refreshStatus = await this.redis.expire(sessionKey, this.lifetime);
    return Boolean(refreshStatus);
  }

  /**
   * Retrieves the entire session in redis and validate it using the DTO
   *
   * provided at the initialization
   * @param ctx The context bounded by the interceptor
   * @return The full session
   */
  private async getFullSession(ctx: IBoundSessionContext): Promise<object> {
    this.logger.debug('get session from redis');

    const sessionKey = this.getSessionKey(ctx);
    const dataCipher = await this.redis.get(sessionKey);

    /**
     * If the cipher is invalid, we set an empty session.
     */
    if (!dataCipher) {
      return {};
    }

    const data = this.unserialize(dataCipher);
    await this.validate(data);

    return data;
  }

  /**
   * Get a value in the session module corresponding to the provided key
   *
   * @param ctx The context bounded by the interceptor
   * @param session The full session
   * @param key The key to retrieve in the ctx module session
   * @return The part of the session module corresponding to the provided key
   */
  private getByKey(
    ctx: IBoundSessionContext,
    session: object,
    key: string,
  ): unknown | undefined {
    return session[ctx.moduleName]?.[key];
  }

  /**
   * Get the session module
   *
   * @param ctx The context bounded by the interceptor
   * @param session The full session
   * @return The session module
   */
  private getModule(
    ctx: IBoundSessionContext,
    session: object,
  ): unknown | undefined {
    return session[ctx.moduleName];
  }

  /**
   * Set a value in the session module corresponding to the provided key
   *
   * @param ctx The context bounded by the interceptor
   * @param session The full session
   * @param key The key to set in the ctx module session
   * @param data The data to set in the ctx module session
   */
  private setByKey(
    ctx: IBoundSessionContext,
    session: object,
    key: string,
    data: unknown,
  ): void {
    if (session[ctx.moduleName]) {
      session[ctx.moduleName][key] = data;
    } else {
      session[ctx.moduleName] = {
        [key]: data,
      };
    }
  }

  /**
   * Patch the session module with the provided data
   *
   * @param ctx The context bounded by the interceptor
   * @param session The full session
   * @param data The data to patch in the ctx module session
   */
  private setModule(
    ctx: IBoundSessionContext,
    session: object,
    data: object,
  ): void {
    session[ctx.moduleName] = {
      ...session[ctx.moduleName],
      ...data,
    };
  }

  /**
   * Serialize, encrypt, enxpire and save the data to redis
   *
   * @param ctx The context bounded by the interceptor
   * @param data The full session to save
   * @return The boolean result of the multi operation in redis
   */
  private async save(
    ctx: IBoundSessionContext,
    data: object,
  ): Promise<boolean> {
    const key = this.getSessionKey(ctx);

    const serialized = this.serialize(data);

    const multi = this.redis.multi();

    multi.set(key, serialized);
    multi.expire(key, this.lifetime);

    const status = await multi.exec();

    return Boolean(status);
  }

  /**
   * Transform data to encrypted string, easy to persist.
   *
   * @param data data to serialize
   * @returns encrypted string representation of <data>
   */
  private serialize(data: object): string {
    /**
     * @todo #415 should probably have a try/catch with custom error code
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/415
     */
    const dataString = JSON.stringify(data);
    const dataCipher = this.cryptography.encryptSymetric(
      this.encryptionKey,
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
  private unserialize(data: string): object | never {
    const dataString = this.cryptography.decryptSymetric(
      this.encryptionKey,
      data,
    );

    try {
      return JSON.parse(dataString);
    } catch (error) {
      throw new SessionBadFormatException(error);
    }
  }

  /**
   * Validate the session using the DTO provided at the library initialization
   *
   * @param session The full session
   */
  private async validate(session: object): Promise<void> {
    /**
     * @todo #416 Add specific error code
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/416
     */
    await validateDto(session, this.sessionOptions.schema, validationOptions);
  }

  /**
   * Contruct the session key using the context
   *
   * @param ctx The context bounded by the interceptor
   * @return The session key
   */
  private getSessionKey(ctx: IBoundSessionContext) {
    return `${this.prefix}::${ctx.sessionId}`;
  }
}
