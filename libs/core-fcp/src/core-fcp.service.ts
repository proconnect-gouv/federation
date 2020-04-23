import { Injectable } from '@nestjs/common';
import {
  OidcProviderService,
  OidcProviderMiddlewareStep,
  OidcProviderMiddlewarePattern,
} from '@fc/oidc-provider';

@Injectable()
export class CoreFcpService {
  constructor(private readonly oidcProviderService: OidcProviderService) {}

  onModuleInit() {
    this.oidcProviderService.registerMiddleware(
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
