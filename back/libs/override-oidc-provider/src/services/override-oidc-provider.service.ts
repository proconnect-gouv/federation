import * as OidcProviderInstance from 'oidc-provider/lib/helpers/weak_cache';
import { JWK, JWKS } from 'jose';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { OverrideOidcProviderConfig } from '../dto';

@Injectable()
export class OverrideOidcProviderService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  onApplicationBootstrap() {
    this.logger.debug('Override public signing key');
    this.overrideKeystore();
  }

  /**
   * Override oidc-povider's Keystore with our public key from HSM
   *
   * This allow us to make `oidc-provider` to use the HSM provided public key
   * to check self issued signature (usefull on logout cinematic)
   *
   * This allow us to make `oidc-provider` publish the HSM provided public key
   * on /jwks discovery url.
   *
   * Note about the tricky part on `OidcProviderInstance`:
   * `oidc-provider` internally stores the "full" provider instance in a weakMap,
   * referenced by the object returned by the instantiation of the Provider class.
   * (take a deep breath...)
   *
   * The weakMap is acceed with a helper exported and used as `instance` in `oidc-provider` codebase.
   * To give more context, we prefixed the name in this module.
   */
  private overrideKeystore() {
    /** Grab HSM public sig key from configuration */
    const { sigHsmPubKey } = this.config.get<OverrideOidcProviderConfig>(
      'OverrideOidcProvider',
    );
    const key = JWK.asKey(sigHsmPubKey);

    const provider = this.oidcProvider.getProvider();

    /** Get instance stored in `oidc-provider`'s internal weakMap */
    const instance = OidcProviderInstance(provider);

    /** Override keystore */
    instance.keystore = new JWKS.KeyStore([key]);
  }
}
