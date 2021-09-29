/* istanbul ignore file */

// root application file
import '@fc/dsfr/styles.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import { ApplicationLayout } from './application-layout';
import { configure, initialState } from './redux';
import routes from './routes';

const { persistor, store } = configure(initialState);

ReactDOM.render(
  <ReduxProvider store={store}>
    <PersistGate persistor={persistor}>
      <BrowserRouter>
        <ApplicationLayout routes={routes} />
      </BrowserRouter>
    </PersistGate>
  </ReduxProvider>,
  document.getElementById('root'),
);
