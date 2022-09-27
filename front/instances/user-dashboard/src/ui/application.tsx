import './application.scss';

import { BrowserRouter } from 'react-router-dom';

import { AccountProvider } from '@fc/account';
import { AxiosErrorCatcherProvider } from '@fc/axios-error-catcher';
import { AppContextProvider } from '@fc/state-management';

import { AppConfig } from '../config';
import { ApplicationRoutes } from './application.routes';

export function Application(): JSX.Element {
  return (
    <BrowserRouter>
      <AppContextProvider value={{ config: AppConfig }}>
        <AccountProvider config={AppConfig.Account}>
          <AxiosErrorCatcherProvider>
            <ApplicationRoutes />
          </AxiosErrorCatcherProvider>
        </AccountProvider>
      </AppContextProvider>
    </BrowserRouter>
  );
}
