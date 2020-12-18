import React from 'react';
import { mocked } from 'ts-jest/utils';

import { choosenIdentityProvider } from '../../redux/actions';
import { fireEvent, renderWithRedux } from '../../testUtils';
import IdentityProviderSubmitComponent from './identity-provider-submit';

jest.mock('../../redux/actions');

const initialState = {
  identityProviders: [
    {
      active: false,
      display: true,
      name: 'mock-name',
      uid: 'mock-uid-inactive',
    },
    {
      active: true,
      display: true,
      name: 'mock-name',
      uid: 'mock-uid-active',
    },
  ],
  redirectToIdentityProviderInputs: {
    acr_values: 'mock-acr_values',
    redirectUriServiceProvider: 'mock-redirectUriServiceProvider',
    response_type: 'mock-response_type',
    scope: 'mock-scope',
  },
};

describe('IdentityProviderSubmitComponent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should have inputs hidden', () => {
    // setup
    const { getByDisplayValue } = renderWithRedux(
      <IdentityProviderSubmitComponent uid="mock-uid-active" />,
      {
        initialState,
      },
    );
    // action
    const inputElement1 = getByDisplayValue('mock-acr_values');
    // expect
    expect(inputElement1).toBeInTheDocument();
    expect(inputElement1).toHaveAttribute('name', 'acr_values');
    expect(inputElement1).toHaveAttribute('type', 'hidden');

    // action
    const inputElement2 = getByDisplayValue('mock-redirectUriServiceProvider');
    // expect
    expect(inputElement2).toBeInTheDocument();
    expect(inputElement2).toHaveAttribute('name', 'redirectUriServiceProvider');
    expect(inputElement2).toHaveAttribute('type', 'hidden');

    // action
    const inputElement3 = getByDisplayValue('mock-response_type');
    // expect
    expect(inputElement3).toBeInTheDocument();
    expect(inputElement3).toHaveAttribute('name', 'response_type');
    expect(inputElement3).toHaveAttribute('type', 'hidden');

    // action
    const inputElement4 = getByDisplayValue('mock-scope');
    // expect
    expect(inputElement4).toBeInTheDocument();
    expect(inputElement4).toHaveAttribute('name', 'scope');
    expect(inputElement4).toHaveAttribute('type', 'hidden');

    // action
    const inputElement5 = getByDisplayValue('mock-uid-active');
    // expect
    expect(inputElement5).toBeInTheDocument();
    expect(inputElement5).toHaveAttribute('name', 'providerUid');
    expect(inputElement5).toHaveAttribute('type', 'hidden');
  });

  it('should have disabled submit button with label ok', () => {
    // action
    const { getByText } = renderWithRedux(
      <IdentityProviderSubmitComponent uid="mock-uid-inactive" />,
      {
        initialState,
      },
    );
    const submitButton = getByText('OK').closest('button');
    // expect
    expect(submitButton).toBeDisabled();
  });

  it('should have disabled submit button with label ok if no uid provided', () => {
    // action
    const { getByText } = renderWithRedux(
      <IdentityProviderSubmitComponent uid={null} />,
      {
        initialState,
      },
    );
    const submitButton = getByText('OK').closest('button');
    // expect
    expect(submitButton).toBeDisabled();
  });

  it('should not have disabled props on submit button with label ok', () => {
    // action
    const { getByText } = renderWithRedux(
      <IdentityProviderSubmitComponent uid="mock-uid-active" />,
      {
        initialState,
      },
    );
    const submitButton = getByText('OK').closest('button');
    // expect
    expect(submitButton).not.toBeDisabled();
  });

  it('should call choosenIdentityProvider when user click on the button', () => {
    // setup
    const action = { payload: 'mock-uid-active', type: 'mock-action-type' };
    const spy = mocked(choosenIdentityProvider, true);
    spy.mockReturnValueOnce(action);

    // action
    const { getByText } = renderWithRedux(
      <IdentityProviderSubmitComponent uid="mock-uid-active" />,
      {
        initialState,
      },
    );
    const submitButton = getByText('OK').closest('button');
    fireEvent.click(submitButton as HTMLButtonElement);
    // expect
    expect(choosenIdentityProvider).toHaveBeenCalledTimes(1);
  });
});
