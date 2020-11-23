import React from 'react';

import { renderWithRedux } from '../../../testUtils';
import IdentityProviderButton from './identity-provider-button';

describe('IdentityProviderButton', () => {
  it('should set the name property as the submit button label', () => {
    const props = { identityProvider: { name: 'mock-name', uid: 'mock-uid' } };
    const { container, getByText } = renderWithRedux(
      <IdentityProviderButton {...props} />,
    );
    const buttonElement = getByText('mock-name');
    const submitElement = container.querySelector('button[type="submit"]');
    expect(buttonElement).toStrictEqual(submitElement);
  });

  it('should have input with value "eidas2" and name "acr_values"', () => {
    const props = { identityProvider: { name: 'mock-name', uid: 'mock-uid' } };
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
    );
    const valueElement = getByDisplayValue('eidas2');
    const nameElement = container.querySelector('input[name="acr_values"');
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "corev2" and name "providerUid"', () => {
    const props = { identityProvider: { name: 'mock-name', uid: 'mock-uid' } };
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
    );
    const valueElement = getByDisplayValue('corev2');
    const nameElement = container.querySelector('input[name="providerUid"');
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "https://fsp1v2.docker.dev-franceconnect.fr/login-callback" and "redirect_uri"', () => {
    const props = { identityProvider: { name: 'mock-name', uid: 'mock-uid' } };
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
    );
    const valueElement = getByDisplayValue(
      'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
    );
    const nameElement = container.querySelector('input[name="redirect_uri"');
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "code" and name "response_type"', () => {
    const props = { identityProvider: { name: 'mock-name', uid: 'mock-uid' } };
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
    );
    const valueElement = getByDisplayValue('code');
    const nameElement = container.querySelector('input[name="response_type"');
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone" and name "scope"', () => {
    const props = { identityProvider: { name: 'mock-name', uid: 'mock-uid' } };
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
    );
    const valueElement = getByDisplayValue(
      'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address phone',
    );
    const nameElement = container.querySelector('input[name="scope"');
    expect(valueElement).toEqual(nameElement);
  });
});
