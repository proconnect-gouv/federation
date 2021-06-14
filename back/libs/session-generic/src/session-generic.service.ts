import { Inject, Injectable } from '@nestjs/common';
import { ConfigService, validationOptions } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { Redis, REDIS_CONNECTION_TOKEN } from '@fc/redis';
import { validateDto } from '@fc/common';
import {
  ISessionGenericBoundContext,
  ISessionGenericOptions,
  ISessionGenericRequest,
  ISessionGenericResponse,
} from './interfaces';
import { SESSION_TOKEN_OPTIONS } from './tokens';
import { SessionGenericConfig } from './dto';
import {
  SessionBadFormatException,
  SessionBadAliasException,
  SessionGenericStorageException,
} from './exceptions';

export type RedisQueryResult = [Error | null, any];

@Injectable()
export class SessionGenericService {
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

  /**
   * Retrieves a module session or a part of it
   *
   * @param ctx The context bounded by the interceptor
   * @param key The key of the sub data to retrieve
   * @return The module session or a part of it
   */
  async get(
    ctx: ISessionGenericBoundContext,
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
    ctx: ISessionGenericBoundContext,
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
  async refresh(
    req: ISessionGenericRequest,
    res: ISessionGenericResponse,
  ): Promise<string> {
    const { lifetime } =
      this.config.get<SessionGenericConfig>('SessionGeneric');

    const sessionId: string = this.getSessionIdFromCookie(req);

    const sessionKey: string = this.getSessionKey(sessionId);
    await this.redis.expire(sessionKey, lifetime);

    this.setCookies(res, sessionId);

    this.bindToRequest(req, sessionId);

    return sessionId;
  }

  /**
   * Retrieves the entire session in redis and validate it using the DTO
   *
   * provided at the initialization
   * @param ctx The context bounded by the interceptor
   * @return The full session
   */
  private async getFullSession(
    ctx: ISessionGenericBoundContext,
  ): Promise<object> {
    const sessionKey = this.getSessionKey(ctx.sessionId);

    let dataCipher: string;
    try {
      dataCipher = await this.redis.get(sessionKey);
    } catch (error) {
      throw new SessionGenericStorageException(error);
    }

    /**
     * If the cipher is invalid, we set an empty session.
     */
    if (!dataCipher) {
      return {};
    }

    const data = this.unserialize(dataCipher);
    await this.validate(data);

    this.logger.trace({ ctx, data });

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
    ctx: ISessionGenericBoundContext,
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
    ctx: ISessionGenericBoundContext,
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
    ctx: ISessionGenericBoundContext,
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
    ctx: ISessionGenericBoundContext,
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
    ctx: ISessionGenericBoundContext,
    data: object,
  ): Promise<boolean> {
    const { lifetime } =
      this.config.get<SessionGenericConfig>('SessionGeneric');
    const key = this.getSessionKey(ctx.sessionId);

    const serialized = this.serialize(data);

    const multi = this.redis.multi();

    multi.set(key, serialized);
    multi.expire(key, lifetime);

    const status = await multi.exec();

    return Boolean(status);
  }

  init(req: ISessionGenericRequest, res: ISessionGenericResponse): string {
    const { sessionIdLength } =
      this.config.get<SessionGenericConfig>('SessionGeneric');
    const sessionId: string =
      this.cryptography.genRandomString(sessionIdLength);

    this.setCookies(res, sessionId);
    this.bindToRequest(req, sessionId);

    return sessionId;
  }

  async reset(
    req: ISessionGenericRequest,
    res: ISessionGenericResponse,
  ): Promise<string> {
    const sessionId = this.getSessionIdFromCookie(req);
    const sessionKey = this.getSessionKey(sessionId);

    await this.redis.del(sessionKey);

    return this.init(req, res);
  }

  getSessionIdFromCookie(req: ISessionGenericRequest): string | undefined {
    const { sessionCookieName } =
      this.config.get<SessionGenericConfig>('SessionGeneric');

    return req.signedCookies[sessionCookieName];
  }

  /**
   * Attach the current `sessionId` to the current request.
   * @param {ISessionGenericRequest} req
   * @param {string} sessionId
   */
  private bindToRequest(req: ISessionGenericRequest, sessionId: string): void {
    req.sessionService = this;
    req.sessionId = sessionId;
  }

  private setCookies(res: ISessionGenericResponse, sessionId: string): void {
    const { sessionCookieName, cookieOptions } =
      this.config.get<SessionGenericConfig>('SessionGeneric');

    res.cookie(sessionCookieName, sessionId, cookieOptions);
    /**
     * To debug a Panva misestimating of cookie
     * @see ./node_modules/oidc-provider/lib/shared/session.js:47
     * ```js
     *   ctx.response.get('set-cookie').forEach((cookie, index, array) => {...});
     * ```
     * Where the getter expect to have an array of cookies.
     * To fix this bug we have to provide at least two cookies to prevent Oidc to crash.
     */
    res.cookie(
      'duplicate-cookie-name',
      'duplicate-cookie-value',
      cookieOptions,
    );
  }

  /**
   * Transform data to encrypted string, easy to persist.
   *
   * @param data data to serialize
   * @returns encrypted string representation of <data>
   */
  private serialize(data: object): string {
    const { encryptionKey } =
      this.config.get<SessionGenericConfig>('SessionGeneric');
    /**
     * @todo #415 should probably have a try/catch with custom error code
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/415
     */
    const dataString = JSON.stringify(data);
    const dataCipher = this.cryptography.encryptSymetric(
      encryptionKey,
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
    const session = this.config.get<SessionGenericConfig>('SessionGeneric');
    const { encryptionKey } = session;
    const dataString = this.cryptography.decryptSymetric(encryptionKey, data);

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

  /**
   *
   * @todo #485 Fix validation process
   *   author: Hugues
   *   date: 2021/04/15
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
  private getSessionKey(sessionId: string) {
    const { prefix } = this.config.get<SessionGenericConfig>('SessionGeneric');
    return `${prefix}::${sessionId}`;
  }

  /**
   * This method is used to save the corresponding reference
   * from OIDC's `interactionId` and our `sessionId`
   *
   * @param {string} key Use to interactionId
   * @param {string} value sessionId
   * @param {number} lifetime in milisec
   * @returns {RedisQueryResult[]>}
   */
  async setAlias(key: string, value: string): Promise<RedisQueryResult[]> {
    const { lifetime } =
      this.config.get<SessionGenericConfig>('SessionGeneric');
    const multi = this.redis.multi();

    multi.set(key, value);
    multi.expire(key, lifetime);

    const result: RedisQueryResult[] = await multi.exec();

    return result;
  }

  /**
   * Get our corresponding `sessionId` from Panva's `interactionId`
   *
   * @param {string} key interactionId
   * @returns {Promise<string>} return `sessionId`
   */
  async getAlias(key: string): Promise<string> {
    if (!key) {
      throw new SessionBadAliasException(new Error('Session get alias error'));
    }
    const multi = this.redis.multi();

    multi.get(key);

    const results: RedisQueryResult[] = await multi.exec();
    const value: string = results[0][1];
    return value;
  }
}
