import './ui/styles/index.scss';

import { Settings } from 'luxon';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import ApplicationLayout from './ui/application-layout';

Settings.defaultLocale = 'fr';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApplicationLayout />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root'),
);
