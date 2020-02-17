import { Injectable } from '@nestjs/common';

@Injectable()
export class CoreFcpService {
  getAuthorize(query): string {
    return 'getAuthorize'+ JSON.stringify(query);
  }

  getRedirectToIdp(): string {
    return 'getRedirectToIdp';
  }

  getOidcCallback(): string {
    return 'getOidcCallback';
  }

  getConsent(): string {
    return 'getConsent';
  }

  postConsent(): string {
    return 'postConsent';
  }

  getClientWellKnown(): string {
    return 'getClientWellKnown';
  }

  getProviderWellKnown(): string {
    return 'getProviderWellKnown';
  }
}
