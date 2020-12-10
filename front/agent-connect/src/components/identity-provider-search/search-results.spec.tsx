import React from 'react';

import { renderWithRedux } from '../../testUtils';
import SearchResults from './search-results';

describe('SearchResults', () => {
  it('should render a list of identity providers', () => {
    const props = {
      results: [
        {
          active: true,
          name: 'mock-name-1',
          uid: 'mock-name-1',
        },
        {
          active: true,
          name: 'mock-name-2',
          uid: 'mock-name-2',
        },
      ],
    };
    const { getByText } = renderWithRedux(<SearchResults {...props} />);
    const listTitle = getByText('Suggestions :');
    expect(listTitle).toBeInTheDocument();

    const firstButton = getByText('mock-name-1');
    expect(firstButton).toBeInTheDocument();

    const secondButton = getByText('mock-name-2');
    expect(secondButton).toBeInTheDocument();
  });
});
