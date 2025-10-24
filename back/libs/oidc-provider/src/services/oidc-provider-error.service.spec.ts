import { KoaContextWithOIDC } from 'oidc-provider';

import { Test, TestingModule } from '@nestjs/testing';

import { throwException } from '@fc/exceptions/helpers';

import { OidcProviderErrorService } from './oidc-provider-error.service';

jest.mock('@fc/exceptions/helpers', () => ({
  ...jest.requireActual('@fc/exceptions/helpers'),
  throwException: jest.fn(),
}));

describe('OidcProviderErrorService', () => {
  let service: OidcProviderErrorService;

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OidcProviderErrorService],
    }).compile();

    service = module.get<OidcProviderErrorService>(OidcProviderErrorService);
  });

  describe('renderError', () => {
    it('should set isError flag on ctx.oidc', async () => {
      // Given
      const ctx = { oidc: {} } as KoaContextWithOIDC;
      const error = new Error('error');
      // When
      await service.renderError(ctx, '', error);
      // Then
      expect(ctx.oidc).toHaveProperty('isError', true);
    });

    it('should call throwException', async () => {
      // Given
      const ctx = {} as KoaContextWithOIDC;
      const error = new Error('error');
      // When
      await service.renderError(ctx, '', error);
      // Then
      expect(throwException).toHaveBeenCalledTimes(1);
    });
  });
});
