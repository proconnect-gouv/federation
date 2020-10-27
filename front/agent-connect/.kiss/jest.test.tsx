import { render } from '@testing-library/react';
import React from 'react';

import MyModule from './my-module';

describe('MyModule', () => {
  it('renders learn react link', () => {
    const { getByText } = render(<MyModule />);
    const linkElement = getByText(/learn react/i);
    expect(linkElement).toBeInTheDocument();
  });
});
