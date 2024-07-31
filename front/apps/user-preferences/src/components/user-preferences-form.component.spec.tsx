import { fireEvent, render } from '@testing-library/react';

import { AlertComponent, SimpleButton, ToggleInput } from '@fc/dsfr';
import { useStylesQuery, useStylesVariables } from '@fc/styles';

import { useUserPreferencesForm } from '../hooks';
import { AllowFutureIdpSwitchLabelComponent } from './allow-future-idp-switch-label.component';
import { ServicesListComponent } from './services-list.component';
import { UserPreferencesFormComponent } from './user-preferences-form.component';

jest.mock('../hooks');
jest.mock('./services-list.component');
jest.mock('./allow-future-idp-switch-label.component');

describe('UserPreferencesFormComponent', () => {
  const userPreferencesMock = {
    allowFutureIdp: false,
    idpList: [expect.any(Object), expect.any(Object)],
  };
  const alertInfoStateMock = {
    hasInteractedWithAlertInfo: true,
    isDisplayedAlertInfo: false,
  };
  const hookResultMock = {
    alertInfoState: alertInfoStateMock,
    allowingIdPConfirmation: jest.fn(),
  };

  beforeEach(() => {
    // given
    jest.mocked(useStylesVariables).mockReturnValue([expect.any(String)]);
  });

  it('should match the snapshot, display into a desktop viewport', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);
    jest.mocked(useStylesQuery).mockReturnValueOnce(true);

    // when
    const { container } = render(
      <UserPreferencesFormComponent
        isDisabled
        dirtyFields={{}}
        hasValidationErrors={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, display into a mobile viewport', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);
    jest.mocked(useStylesQuery).mockReturnValueOnce(false);

    // when
    const { container } = render(
      <UserPreferencesFormComponent
        isDisabled
        dirtyFields={{}}
        hasValidationErrors={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, display into a desktop viewport when form validation button is not disabled', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);
    jest.mocked(useStylesQuery).mockReturnValueOnce(true);

    // when
    const { container } = render(
      <UserPreferencesFormComponent
        dirtyFields={{}}
        hasValidationErrors={false}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, display into a mobile viewport when form validation button is not disabled', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);
    jest.mocked(useStylesQuery).mockReturnValueOnce(false);

    // when
    const { container } = render(
      <UserPreferencesFormComponent
        dirtyFields={{}}
        hasValidationErrors={false}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, display into a desktop viewport when the form has errors', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);
    jest.mocked(useStylesQuery).mockReturnValueOnce(true);

    // when
    const { container } = render(
      <UserPreferencesFormComponent
        hasValidationErrors
        dirtyFields={{}}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot, display into a mobile viewport when the form has errors', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);
    jest.mocked(useStylesQuery).mockReturnValueOnce(false);

    // when
    const { container } = render(
      <UserPreferencesFormComponent
        hasValidationErrors
        dirtyFields={{}}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(container).toMatchSnapshot();
  });

  it('should call ServicesListComponent with params', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);

    // when
    render(
      <UserPreferencesFormComponent
        isDisabled
        dirtyFields={{}}
        hasValidationErrors={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(ServicesListComponent).toHaveBeenCalledOnce();
    expect(ServicesListComponent).toHaveBeenCalledWith(
      { identityProviders: userPreferencesMock.idpList },
      {},
    );
  });

  it('should call ToggleInput with params', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);

    // when
    render(
      <UserPreferencesFormComponent
        isDisabled
        dirtyFields={{}}
        hasValidationErrors={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(ToggleInput).toHaveBeenCalledOnce();
    expect(ToggleInput).toHaveBeenCalledWith(
      expect.objectContaining({
        initialValue: false,
        label: expect.any(Function),
        legend: { checked: 'Autorisé', unchecked: 'Bloqué' },
        name: 'allowFutureIdp',
      }),
      {},
    );
  });

  it('should render AllowFutureIdpSwitchLabelComponent with params, when labelCallback is called', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);
    const toggleInputValue = false;
    jest
      .mocked(ToggleInput)
      .mockImplementationOnce(({ label }) => <div>{(label as Function)(toggleInputValue)}</div>);
    // when
    render(
      <UserPreferencesFormComponent
        isDisabled
        dirtyFields={{}}
        hasValidationErrors={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(AllowFutureIdpSwitchLabelComponent).toHaveBeenCalledOnce();
    expect(AllowFutureIdpSwitchLabelComponent).toHaveBeenCalledWith(
      { checked: toggleInputValue },
      {},
    );
  });

  it('should call AlertComponent with params when the form has errors', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);

    // when
    render(
      <UserPreferencesFormComponent
        hasValidationErrors
        dirtyFields={{}}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(AlertComponent).toHaveBeenCalledOnce();
    expect(AlertComponent).toHaveBeenCalledWith(
      {
        children: expect.any(Array),
        type: 'error',
      },
      {},
    );
  });

  it('should call useUserPreferencesForm with dirtyFields and userPreference when allowingIdPConfirmation is called', () => {
    // given
    jest.mocked(AlertComponent).mockImplementationOnce(({ children }) => <div>{children}</div>);
    jest.mocked(useUserPreferencesForm).mockReturnValue({
      alertInfoState: {
        hasInteractedWithAlertInfo: false,
        isDisplayedAlertInfo: true,
      },
      allowingIdPConfirmation: jest.fn(),
    });

    // when
    const { getByTestId } = render(
      <UserPreferencesFormComponent
        dirtyFields={{}}
        hasValidationErrors={false}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );
    const button = getByTestId('UserPreferenceFormComponent-button-info');
    fireEvent.click(button);

    // then
    expect(useUserPreferencesForm).toHaveBeenCalledOnce();
    expect(useUserPreferencesForm).toHaveBeenCalledWith({
      dirtyFields: {},
      userPreferences: userPreferencesMock,
    });
  });

  it('should not call AlertComponent if there are no errors', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);

    // when
    render(
      <UserPreferencesFormComponent
        dirtyFields={{}}
        hasValidationErrors={false}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(AlertComponent).toHaveBeenCalledTimes(0);
  });

  it('should call SimpleButton with params, can not submit', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);

    // when
    render(
      <UserPreferencesFormComponent
        isDisabled
        dirtyFields={{}}
        hasValidationErrors={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(SimpleButton).toHaveBeenCalledOnce();
    expect(SimpleButton).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        label: 'Enregistrer mes réglages',
        type: 'submit',
      }),
      {},
    );
  });

  it('should call SimpleButton with params, can submit', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);

    // when
    render(
      <UserPreferencesFormComponent
        dirtyFields={{}}
        hasValidationErrors={false}
        isDisabled={false}
        showNotification={false}
        userPreferences={userPreferencesMock}
        onSubmit={jest.fn()}
      />,
    );

    // then
    expect(SimpleButton).toHaveBeenCalledOnce();
    expect(SimpleButton).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: false,
        label: 'Enregistrer mes réglages',
        type: 'submit',
      }),
      {},
    );
  });

  it('should show a notification when the form has been submitted', () => {
    // given
    jest.mocked(useUserPreferencesForm).mockReturnValueOnce(hookResultMock);

    // when
    const { getByText } = render(
      <UserPreferencesFormComponent
        isDisabled
        showNotification
        dirtyFields={{}}
        hasValidationErrors={false}
        userPreferences={userPreferencesMock}
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
