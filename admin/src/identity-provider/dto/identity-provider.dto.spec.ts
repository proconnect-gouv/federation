import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { IdentityProviderDTO } from './identity-provider.dto';

describe('Identity Provider (Data Transfer Object)', () => {
  const idpNoDiscoveryMock = {
    name: 'MonSuperFI',
    title: 'Mon Super FI mais mieux écrit',
    issuer: 'https://issuer.fr',
    jwksUrl: 'https://issuer.fr/jwks',
    tokenUrl: 'https://issuer.fr/token',
    userInfoUrl: 'https://issuer.fr/me',
    authorizationUrl: 'https://issuer.fr/auth',
    statusUrl: 'https://issuer.fr/state',
    discovery: 'false',
    clientId: '09a1a257648c1742c74d6a3d84b31943',
    client_secret: '1234567890AZERTYUIOP',
    active: 'true',
    isBeta: 'false',
    messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
    redirectionTargetWhenInactive: 'https://issuer.fr/promo',
    order: 1,
    emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
    siret: '',
    specificText:
      "Veuillez fournir une capture d'écran de votre page de profil !",
    token_endpoint_auth_method: 'client_secret_post',
  };

  const idpDiscoveryMock = {
    name: 'MonSuperFI',
    title: 'Mon Super FI mais mieux écrit',
    issuer: 'https://issuer.fr',
    authorizationUrl: 'https://issuer.fr/auth',
    statusUrl: 'https://issuer.fr/state',
    discovery: 'true',
    discoveryUrl: 'https://issuer.fr/discovery',
    clientId: '09a1a257648c1742c74d6a3d84b31943',
    client_secret: '1234567890AZERTYUIOP',
    active: 'true',
    isBeta: 'false',
    messageToDisplayWhenInactive: 'SUPER MESSAGE !!!',
    redirectionTargetWhenInactive: 'https://issuer.fr/promo',
    order: 1,
    emails: 'sherman@kaliop.com\nvbonnard@kaliopmail.com',
    siret: '',
    specificText:
      "Veuillez fournir une capture d'écran de votre page de profil !",
    token_endpoint_auth_method: 'client_secret_post',
  };

  describe('should validate', () => {
    it('without discovery properties', async () => {
      // When | Action
      const serviceProviderToClass = plainToInstance(
        IdentityProviderDTO,
        idpNoDiscoveryMock,
      );
      const result = await validate(serviceProviderToClass);

      // Then | Assert
      expect(result).toEqual([]);
    });

    it('with discovery properties', async () => {
      // When | Action
      const serviceProviderToClass = plainToInstance(
        IdentityProviderDTO,
        idpDiscoveryMock,
      );
      const result = await validate(serviceProviderToClass);

      // Then | Assert
      expect(result).toEqual([]);
    });
  });

  describe('should fail', () => {
    it('if discovery is not enabled and token, userInfo and authorization url are missing', async () => {
      const failIdpNoDiscoveryMock = {
        ...idpNoDiscoveryMock,
      };

      delete failIdpNoDiscoveryMock.tokenUrl;
      delete failIdpNoDiscoveryMock.userInfoUrl;
      delete failIdpNoDiscoveryMock.authorizationUrl;

      // When | Action
      const serviceProviderToClass = plainToInstance(
        IdentityProviderDTO,
        failIdpNoDiscoveryMock,
      );
      const result = await validate(serviceProviderToClass);

      // Then | Assert
      expect(result.length).toBeGreaterThan(0);
    });

    it.skip('if discovery is not enabled but there is a discoveryUrl', async () => {
      const failIdpNoDiscoveryMock = {
        ...idpNoDiscoveryMock,
        discoveryUrl: 'https://issuer.fr/discovery',
      };

      // When | Action
      const serviceProviderToClass = plainToInstance(
        IdentityProviderDTO,
        failIdpNoDiscoveryMock,
      );
      const result = await validate(serviceProviderToClass);

      // Then | Assert
      expect(result.length).toBeGreaterThan(0);
    });

    it('if discovery is enabled but there is no discoveryUrl', async () => {
      const failIdpDiscoveryMock = {
        ...idpDiscoveryMock,
      };

      delete failIdpDiscoveryMock.discoveryUrl;

      // When | Action
      const serviceProviderToClass = plainToInstance(
        IdentityProviderDTO,
        failIdpDiscoveryMock,
      );
      const result = await validate(serviceProviderToClass);

      // Then | Assert
      expect(result.length).toBeGreaterThan(0);
    });

    it.skip('if discovery is enabled and there are token, userInfo and authorization url', async () => {
      const failIdpDiscoveryMock = {
        ...idpDiscoveryMock,
        tokenUrl: 'https://issuer.fr/token',
        userInfoUrl: 'https://issuer.fr/me',
        authorizationUrl: 'https://issuer.fr/auth',
      };

      // When | Action
      const serviceProviderToClass = plainToInstance(
        IdentityProviderDTO,
        failIdpDiscoveryMock,
      );
      const result = await validate(serviceProviderToClass);

      // Then | Assert
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
