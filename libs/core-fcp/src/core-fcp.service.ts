import { Injectable } from '@nestjs/common';
import {
  OidcProviderService,
  oidcProviderEvents,
  oidcProviderHooks,
} from '@fc/oidc-provider';

@Injectable()
export class CoreFcpService {
  constructor(private readonly oidcProviderService: OidcProviderService) {}

  onModuleInit() {
    this.oidcProviderService.hook(
      oidcProviderHooks.AFTER,
      oidcProviderEvents.TOKEN,
      ctx => {
        console.log('Je suis initialisé depuis le module business !!');
      },
    );
  }
}
