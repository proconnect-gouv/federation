import { render } from '@testing-library/react';
import { useLocation } from 'react-router-dom';

import { AccountContext } from '@fc/account';
import { useSafeContext } from '@fc/common';
import { AlertComponent, LinkComponent } from '@fc/dsfr';
import { LoginFormComponent } from '@fc/login-form';
import { useStylesQuery, useStylesVariables } from '@fc/styles';
import { getFraudSupportFormUrl } from '@fc/user-dashboard';

import { FraudLoginPage } from './fraud-login.page';

describe('FraudLoginPage', () => {
  beforeEach(() => {
    jest.mocked(useSafeContext).mockReturnValue({ expired: false });
    // @NOTE used to prevent useStylesVariables.useStylesContext to throw
    // useStylesContext requires to be into a StylesProvider context
    jest.mocked(useStylesVariables).mockReturnValue([expect.any(Number), expect.any(Number)]);
    jest.mocked(useStylesQuery).mockReturnValue(true);
  });

  it('should match the snapshot when session is not expired', () => {
    // given
    jest.mocked(useSafeContext).mockReturnValueOnce({ expired: false });

    // when
    const { container } = render(<FraudLoginPage />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match snapshot when session is expired', () => {
    // given
    jest.mocked(useSafeContext).mockReturnValueOnce({ expired: true });

    // when
    const { container } = render(<FraudLoginPage />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot on mobile layout', () => {
    // given
    jest.mocked(useStylesQuery).mockReturnValueOnce(false).mockReturnValueOnce(false);

    // when
    const { container } = render(<FraudLoginPage />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot on desktop layout', () => {
    // given
    jest.mocked(useStylesQuery).mockReturnValueOnce(true).mockReturnValueOnce(true);

    // when
    const { container } = render(<FraudLoginPage />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should match the snapshot on tablet layout', () => {
    // given
    jest.mocked(useStylesQuery).mockReturnValueOnce(false).mockReturnValueOnce(true);

    // when
    const { container } = render(<FraudLoginPage />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should call useSafeContext with AccountContext', () => {
    // when
    render(<FraudLoginPage />);

    // then
    expect(useSafeContext).toHaveBeenCalledOnce();
    expect(useSafeContext).toHaveBeenCalledWith(AccountContext);
  });

  it('should render the main heading', () => {
    // given
    const { getByRole } = render(<FraudLoginPage />);

    // when
    const element = getByRole('heading');

    // then
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent(
      'Pour signaler un cas d’usurpation d’identité, veuillez vous connecter',
    );
  });

  it('should render the paragraph', () => {
    // given
    const { getByTestId } = render(<FraudLoginPage />);

    // when
    const element = getByTestId('paragraph');

    // then
    expect(element).toBeInTheDocument();
    expect(element).toHaveTextContent(
      'Une fois connecté, vous pourrez contacter le support FranceConnect en remplissant un formulaire.',
    );
  });

  it('should render AlertComponent with specific props if session has expired', () => {
    // given
    jest.mocked(useSafeContext).mockReturnValueOnce({ expired: true });

    // when
    render(<FraudLoginPage />);

    // then
    expect(AlertComponent).toHaveBeenCalledOnce();
    expect(AlertComponent).toHaveBeenCalledWith(
      {
        children: expect.any(Object),
        className: 'text-left fr-my-3w',
        size: 'sm',
        type: 'warning',
      },
      {},
    );
  });

  it('should have called useLocation hook', () => {
    // when
    render(<FraudLoginPage />);

    // then
    expect(useLocation).toHaveBeenCalled();
  });

  it('should have called getFraudSupportFormUrl', () => {
    // given
    jest.mocked(useLocation).mockReturnValueOnce({
      hash: expect.any(String),
      key: expect.any(String),
      pathname: expect.any(String),
      search: expect.any(String),
      state: { from: { search: 'any-search' } },
    });

    // when
    render(<FraudLoginPage />);

    // then
    expect(getFraudSupportFormUrl).toHaveBeenCalledOnce();
    expect(getFraudSupportFormUrl).toHaveBeenCalledWith('any-search');
  });

  it('should render LoginFormComponent without redirectUrl', () => {
    // when
    render(<FraudLoginPage />);

    // then
    expect(LoginFormComponent).toHaveBeenCalledOnce();
    expect(LoginFormComponent).toHaveBeenCalledWith(
      {
        className: 'flex-rows items-center',
        connectType: 'FranceConnect',
        redirectUrl: '/fraud/form',
      },
      {},
    );
  });

  it('should render LoginFormComponent with redirectUrl', () => {
    // given
    jest.mocked(useLocation).mockReturnValueOnce({
      hash: expect.any(String),
      key: expect.any(String),
      pathname: expect.any(String),
      search: expect.any(String),
      state: { from: { search: '?param=value' } },
    });

    // when
    render(<FraudLoginPage />);

    // then
    expect(LoginFormComponent).toHaveBeenCalledOnce();
    expect(LoginFormComponent).toHaveBeenCalledWith(
      {
        className: 'flex-rows items-center',
        connectType: 'FranceConnect',
        redirectUrl: '/fraud/form?param=value',
      },
      {},
    );
  });

  it('should render LinkComponent with fraudSupportFormUrl', () => {
    // given
    jest.mocked(getFraudSupportFormUrl).mockReturnValue('mock-fraud-support-form-url');

    // when
    render(<FraudLoginPage />);

    // then
    expect(LinkComponent).toHaveBeenCalledOnce();
    expect(LinkComponent).toHaveBeenCalledWith(
      {
        dataTestId: 'fraud-support-form-link',
        href: 'mock-fraud-support-form-url',
        label: 'Je ne peux pas me connecter',
      },
      {},
    );
  });
});
