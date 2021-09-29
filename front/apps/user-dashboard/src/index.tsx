import { Settings } from 'luxon';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import { ApplicationLayout } from './ui/application-layout';

import { routes } from './config/routes';

Settings.defaultLocale = 'fr';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApplicationLayout routes={routes()} />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
