import '~styles/index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import ApplicationLayout from './application-layout';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApplicationLayout />
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
