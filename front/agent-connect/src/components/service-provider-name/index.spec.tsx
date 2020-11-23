import React from 'react';

import { renderWithRedux } from '../../testUtils';
import ServiceProviderName from './index';

describe('ServiceProviderName', () => {
  it('should renderWithRedux the title from redux store', () => {
    const mockTitle = 'mock-title';
    const { getByText } = renderWithRedux(<ServiceProviderName />, {
      initialState: {
        serviceProviderName: mockTitle,
      },
    });
    const titleElement = getByText(mockTitle);
    expect(titleElement).toBeInTheDocument();
  });
});
