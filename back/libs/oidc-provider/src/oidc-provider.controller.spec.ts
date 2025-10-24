import { Test, TestingModule } from '@nestjs/testing';

import {
  AuthorizeParamsDto,
  LogoutParamsDto,
  RevocationTokenParamsDTO,
} from './dto';
import { OidcProviderController } from './oidc-provider.controller';

describe('OidcProviderController', () => {
  let oidcProviderController: OidcProviderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [OidcProviderController],
      providers: [],
    }).compile();

    oidcProviderController = app.get<OidcProviderController>(
      OidcProviderController,
    );

    jest.resetAllMocks();
  });

  describe('getAuthorize()', () => {
    it('should call next', () => {
      // Given
      const next = jest.fn();
      const queryMock = {} as AuthorizeParamsDto;
      // When
      oidcProviderController.getAuthorize(next, queryMock);
      // Then
      expect(next).toHaveReturnedTimes(1);
    });
  });

  describe('postAuthorize()', () => {
    it('should call next', () => {
      // Given
      const next = jest.fn();
      const bodyMock = {} as AuthorizeParamsDto;
      // When
      oidcProviderController.postAuthorize(next, bodyMock);
      // Then
      expect(next).toHaveReturnedTimes(1);
    });
  });

  describe('getUserInfo()', () => {
    it('should call identity service', () => {
      // Given
      const next = jest.fn();

      // When
      oidcProviderController.getUserInfo(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('postToken()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      // When
      oidcProviderController.postToken(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getEndSession()', () => {
    it('should call logout service', () => {
      // Given
      const next = jest.fn();
      const queryMock = {} as LogoutParamsDto;

      // When
      oidcProviderController.getEndSession(next, queryMock);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('revokeToken()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      const bodyMock = {} as RevocationTokenParamsDTO;
      // When
      oidcProviderController.revokeToken(next, bodyMock);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getJwks()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      // When
      oidcProviderController.getJwks(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('getOpenidConfiguration()', () => {
    it('should call next()', () => {
      // Given
      const next = jest.fn();
      // When
      oidcProviderController.getOpenidConfiguration(next);
      // Then
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
