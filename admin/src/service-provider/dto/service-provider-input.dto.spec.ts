import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { ServiceProviderDto } from './service-provider-input.dto';

describe('Service Provider Input (Data Transfer Object)', () => {
  const serviceProvider = {
    name: 'Service Provider Test',
    redirectUri: 'https://localhost/',
    redirectUriLogout: 'https://localhost/',
    emails: ['toto@gmail.com'],
    ipAddresses: '1.1.1.1',
    active: 'true',
    type: 'private',
    scopes: ['given_name'],
    claims: ['amr'],
  };

  it('should validate if all properties are correct', async () => {
    // When | Action
    const serviceProviderToClass = plainToInstance(
      ServiceProviderDto,
      serviceProvider,
    );
    const result = await validate(serviceProviderToClass);

    // Then | Assert
    expect(result).toEqual([]);
  });

  it('should validate if service provider type is public', async () => {
    const customServiceProvider = {
      ...serviceProvider,
      type: 'public',
    };

    // When | Action
    const serviceProviderToClass = plainToInstance(
      ServiceProviderDto,
      customServiceProvider,
    );
    const result = await validate(serviceProviderToClass);

    // Then | Assert
    expect(result).toEqual([]);
  });
});
