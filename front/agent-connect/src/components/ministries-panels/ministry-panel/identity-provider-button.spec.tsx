import React from 'react';

import { renderWithRedux } from '../../../testUtils';
import IdentityProviderButton from './identity-provider-button';

const initialState = {
  redirectToIdentityProviderInputs: {
    acr_values: 'eidas2',
    redirectUriServiceProvider: 'https://login-callback',
    response_type: 'code',
    scope: 'scopes from backend',
  },
};

const props = { identityProvider: { active: true, name: 'mock-name', uid: 'mock-uid' } };

describe('IdentityProviderButton', () => {
  it('should set the name property as the submit button label', () => {
    const { container, getByText } = renderWithRedux(
      <IdentityProviderButton {...props} />,
    );
    const buttonElement = getByText('mock-name');
    const submitElement = container.querySelector('button[type="submit"]');
    expect(buttonElement).toStrictEqual(submitElement);
  });

  it('should have input with value "eidas2" and name "acr_values"', () => {
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
      {
        initialState,
      },
    );
    const valueElement = getByDisplayValue('eidas2');
    const nameElement = container.querySelector('input[name="acr_values"');
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "mock-uid" and name "providerUID"', () => {
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
      {
        initialState,
      },
    );
    const valueElement = getByDisplayValue('mock-uid');
    const nameElement = container.querySelector('input[name="providerUID"');
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "https://login-callback" and "redirectUriServiceProvider"', () => {
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
      {
        initialState,
      },
    );
    const valueElement = getByDisplayValue('https://login-callback');
    const nameElement = container.querySelector(
      'input[name="redirectUriServiceProvider"',
    );
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "code" and name "response_type"', () => {
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
      {
        initialState,
      },
    );
    const valueElement = getByDisplayValue('code');
    const nameElement = container.querySelector('input[name="response_type"');
    expect(valueElement).toEqual(nameElement);
  });

  it('should have input with value "scopes from backend" and name "scope"', () => {
    const { container, getByDisplayValue } = renderWithRedux(
      <IdentityProviderButton {...props} />,
      {
        initialState,
      },
    );
    const valueElement = getByDisplayValue('scopes from backend');
    const nameElement = container.querySelector('input[name="scope"');
    expect(valueElement).toEqual(nameElement);
  });
});
