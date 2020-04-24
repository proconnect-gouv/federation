import { Injectable } from '@nestjs/common';
import {
  OidcProviderService,
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
} from '@fc/oidc-provider';

@Injectable()
export class CoreFcpService {
  constructor(private readonly oidcProvider: OidcProviderService) {}

  onModuleInit() {
    this.oidcProvider.registerMiddleware(
      OidcProviderMiddlewareStep.AFTER,
      OidcProviderMiddlewarePattern.TOKEN,
      () => {
        console.log(
          'Exemple de middleware initialisé depuis le module business !!',
        );
        console.log('Voir libs/core-fcp/core-fcp.service.ts');
      },
    );
  }
}
