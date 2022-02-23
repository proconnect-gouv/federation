import { render } from '@testing-library/react';

import { ButtonSimpleComponent, FieldCheckboxComponent } from '@fc/backoffice';

import { ServicesListComponent } from './services-list.component';
import { UserPreferencesFormComponent } from './user-preferences-form.component';

// given
jest.mock('../hooks');
jest.mock('./services-list.component');

const identityProvidersMock = [expect.any(Object), expect.any(Object)];

describe('UserPreferencesFormComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should ServicesListComponent have been called with params', () => {
    // when
    render(
      <UserPreferencesFormComponent
        canNotSubmit
        identityProviders={identityProvidersMock}
        showNotification={false}
        onSubmit={jest.fn()}
      />,
    );
    // then
    expect(ServicesListComponent).toHaveBeenCalledTimes(1);
    expect(ServicesListComponent).toHaveBeenCalledWith(
      { identityProviders: identityProvidersMock },
      {},
    );
  });

  it('should FieldCheckboxComponent have been called with params', () => {
    // when
    render(
      <UserPreferencesFormComponent
        canNotSubmit
        identityProviders={identityProvidersMock}
        showNotification={false}
        onSubmit={jest.fn()}
      />,
    );
    // then
    expect(FieldCheckboxComponent).toHaveBeenCalledTimes(1);
    expect(FieldCheckboxComponent).toHaveBeenCalledWith(
      {
        className: 'is-bold mt20',
        label: 'Bloquer par défaut les nouveaux moyens de connexion dans FranceConnect',
        name: 'allowFutureIdp',
      },
      {},
    );
  });

  it('should ButtonSimpleComponent have been called with params, can not submit', () => {
    // when
    render(
      <UserPreferencesFormComponent
        canNotSubmit
        identityProviders={identityProvidersMock}
        showNotification={false}
        onSubmit={jest.fn()}
      />,
    );
    // then
    expect(ButtonSimpleComponent).toHaveBeenCalledTimes(1);
    expect(ButtonSimpleComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'py12 px32',
        disabled: true,
        label: 'Enregistrer mes réglages',
        type: 'submit',
      }),
      {},
    );
  });

  it('should ButtonSimpleComponent have been called with params, can submit', () => {
    // when
    render(
      <UserPreferencesFormComponent
        canNotSubmit={false}
        identityProviders={identityProvidersMock}
        showNotification={false}
        onSubmit={jest.fn()}
      />,
    );
    // then
    expect(ButtonSimpleComponent).toHaveBeenCalledTimes(1);
    expect(ButtonSimpleComponent).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'py12 px32',
        disabled: false,
        label: 'Enregistrer mes réglages',
        type: 'submit',
      }),
      {},
    );
  });

  it('should have been a notification when user submit form', () => {
    // when
    const { getByText } = render(
      <UserPreferencesFormComponent
        canNotSubmit
        showNotification
        identityProviders={identityProvidersMock}
        onSubmit={jest.fn()}
      />,
    );
    const element = getByText(
      'Une notification récapitulant les modifications va vous être envoyée',
    );
    // then
    expect(element).toBeInTheDocument();
  });
});
