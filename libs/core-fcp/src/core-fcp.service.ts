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
      () => {
        console.log('Exemple de Hook initialisé depuis le module business !!');
        console.log('Voir libs/core-fcp/core-fcp.service.ts');
      },
    );
  }
}
