import { render } from '@testing-library/react';
import React from 'react';

import NoSearchResults from './no-search-results';

describe('NoSearchResults', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should render a text for no search results', () => {
    // setup
    const { getByText } = render(<NoSearchResults />);
    // action
    const textElement = getByText('Aucuns résultats');
    // expect
    expect(textElement).toBeInTheDocument();
  });
});
