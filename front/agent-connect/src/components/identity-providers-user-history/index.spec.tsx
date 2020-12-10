import React from 'react';

import { renderWithRedux } from '../../testUtils';
import IdentityProvidersUserHistory from './index';

const initialState = {
  identityProvidersHistory: ['mock-uid-1', 'mock-uid-2'],
  ministries: [
    {
      id: 'mock-ministry-1',
      identityProviders: [
        {
          active: true,
          name: 'mock-name-1',
          uid: 'mock-uid-1',
        },
        {
          active: false,
          name: 'mock-name-2',
          uid: 'mock-uid-2',
        },
      ],
      name: 'mock ministry 1',
    },
  ],
};

describe('IdentityProvidersUserHistory', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should render the title of the section', () => {
    // setup
    const { getByText } = renderWithRedux(<IdentityProvidersUserHistory />);
    // action
    const titleElement = getByText("J'utilise à nouveau");
    // expect
    expect(titleElement).toBeInTheDocument();
  });

  it('should render a list with two historycard from the store', () => {
    // setup
    const { getByText } = renderWithRedux(<IdentityProvidersUserHistory />, {
      initialState,
    });
    // action
    const firstElement = getByText('mock-name-1');
    const secondElement = getByText('mock-name-2');
    // expect
    expect(firstElement).toBeInTheDocument();
    expect(secondElement).toBeInTheDocument();
  });
});
