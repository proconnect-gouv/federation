/* istanbul ignore file */
import './styles/index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import ApplicationLayout from './application-layout';
import routes from './configs/routes';

ReactDOM.render(
  <BrowserRouter>
    <ApplicationLayout routes={routes} />
  </BrowserRouter>,
  document.getElementById('root')
);
