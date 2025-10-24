import { ConfigService } from '@fc/config';

import { IsUrlExtendedConstraint } from './is-url-extended.validator';

const configMock = {
  get: jest.fn(),
};

const instance = new IsUrlExtendedConstraint(
  configMock as unknown as ConfigService,
);
describe('IsUrlExtended', () => {
  const valuesToTestSecureUrl = [
    {
      value: 'https://doretdeplatineshop.com/fr-fr/',
      expected: true,
    },
    {
      value: 'https://localhost/oidc-callback',
      expected: false,
    },
    {
      value: 'http://localhost/oidc-callback',
      expected: false,
    },
    {
      value: 'http://localhost:3000',
      expected: false,
    },
  ];

  const valuesToTestInsecureUrl = [
    {
      value: 'http://localhost:3000/oidc-callback',
      expected: true,
    },
    {
      value: 'https://localhost:3000/oidc-callback',
      expected: true,
    },
    {
      value: 'localhost',
      expected: false,
    },
    {
      value: 'localhost:3000',
      expected: false,
    },
    {
      value: 'http//localhost:3000/oidc-callback/',
      expected: false,
    },
    {
      value: 'http://localhost:3000.fr',
      expected: true,
    },
    {
      value: 'https://doretdeplatineshop.com/fr-fr/',
      expected: true,
    },
  ];

  describe('validate', () => {
    it.each(valuesToTestSecureUrl)(
      'should return "$expected" if we receive the url "$value" and $context',
      ({ value, expected }) => {
        // Given
        configMock.get.mockReturnValueOnce({
          allowInsecureUrls: false,
        });

        // When
        const result = instance.validate(value);

        // Then
        expect(result).toStrictEqual(expected);
      },
    );

    it.each(valuesToTestInsecureUrl)(
      'should return "$expected" if redirect_uris and post_logout_redirect_uris $context',
      ({ value, expected }) => {
        // Given
        configMock.get.mockReturnValueOnce({
          allowInsecureUrls: true,
        });

        // When
        const result = instance.validate(value);

        // Then
        expect(result).toStrictEqual(expected);
      },
    );
  });

  describe('defaultMessage', () => {
    const invalidURL = 'URL is invalid';
    const defaultMessageContext = [
      { allowInsecureUrls: true, defaultMessage: `${invalidURL}` },
      {
        allowInsecureUrls: false,
        defaultMessage: `${invalidURL} (https is mandatory, a valid tld is mandatory (eg. no localhost))`,
      },
    ];

    it.each(defaultMessageContext)(
      'should return the default message : $defaultMessage',
      ({ allowInsecureUrls, defaultMessage }) => {
        configMock.get.mockReturnValueOnce({
          allowInsecureUrls,
        });
        // given
        const instance = new IsUrlExtendedConstraint(
          configMock as unknown as ConfigService,
        );

        // when
        const result = instance.defaultMessage();

        // then
        expect(result).toStrictEqual(defaultMessage);
      },
    );
  });
});
