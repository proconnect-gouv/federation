import './application.scss';

import { HelmetProvider } from 'react-helmet-async';

import { AxiosErrorCatcherProvider } from '@fc/axios-error-catcher';
import { AppContextProvider } from '@fc/state-management';

import { AppConfig } from '../config';
import { ApplicationRoutes } from './application.routes';

export function Application() {
  return (
    <AppContextProvider value={{ config: AppConfig }}>
      <AxiosErrorCatcherProvider>
        <HelmetProvider>
          <ApplicationRoutes />
        </HelmetProvider>
      </AxiosErrorCatcherProvider>
    </AppContextProvider>
  );
}
