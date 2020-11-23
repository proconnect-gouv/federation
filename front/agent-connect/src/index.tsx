/* istanbul ignore file */
// root application file
import './styles/index.scss';

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { PersistGate } from 'redux-persist/integration/react';

import ApplicationLayout from './application-layout';
import { initialState } from './redux/config';
import { configure } from './redux/store';
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
