// @see _doc/jest.md
// import { mocked } from 'ts-jest/utils';

/// @see _doc/jest.md
// import { renderWithRedux } from '../../testUtils';

import { render } from '@testing-library/react';
import React from 'react';

import MyModule from './my-module';

describe('MyModule', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should render something', () => {
    // setup
    const { getByText } = render(<MyModule />);
    // action
    const linkElement = getByText(/learn react/i);
    // expect
    expect(linkElement).toBeInTheDocument();
  });
});
