import { render } from '@testing-library/react';
import React from 'react';

import PanelTitle from './ministry-name';

describe('PanelTitle', () => {
  it('should render the title of card when passing this title in props', () => {
    const name = 'mock-title';
    const { getByText } = render(<PanelTitle name={name} />);
    const linkElement = getByText(name);
    expect(linkElement).toBeInTheDocument();
  });
});
