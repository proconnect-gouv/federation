import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';

import { AccountProvider } from '@fc/account';
import { AxiosErrorCatcherProvider } from '@fc/axios-error-catcher';
import { AppContextProvider } from '@fc/state-management';
import { StylesProvider } from '@fc/styles';

import { AppConfig } from '../config';
import { Application } from './application';
import { ApplicationRoutes } from './application.routes';

jest.mock('react-router-dom');
jest.mock('react-helmet-async');
jest.mock('@fc/dsfr');
jest.mock('@fc/styles');
jest.mock('@fc/account');
jest.mock('@fc/state-management');
jest.mock('@fc/axios-error-catcher');
jest.mock('./application.routes');

describe('Application', () => {
  it('should match snapshot', () => {
    // when
    const { container } = render(<Application />);

    // then
    expect(container).toMatchSnapshot();
  });

  it('should call AppContextProvider with config', () => {
    // when
    render(<Application />);

    // then
    expect(AppContextProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        value: { config: AppConfig },
      }),
      {},
    );
  });

  it('should call AccountProvider with config', () => {
    // when
    render(<Application />);

    // then
    expect(AccountProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        config: AppConfig.Account,
      }),
      {},
    );
  });

  it('should call AxiosErrorCatcherProvider', () => {
    // When
    render(<Application />);
    // Then
    expect(AxiosErrorCatcherProvider).toHaveBeenCalled();
  });

  it('should call HelmetProvider', () => {
    // when
    render(<Application />);

    // then
    expect(HelmetProvider).toHaveBeenCalledOnce();
  });

  it('should call StylesProvider', () => {
    // when
    render(<Application />);

    // then
    expect(StylesProvider).toHaveBeenCalledOnce();
  });

  it('should call ApplicationRoutes', () => {
    // when
    render(<Application />);

    // then
    expect(ApplicationRoutes).toHaveBeenCalledOnce();
  });
});
