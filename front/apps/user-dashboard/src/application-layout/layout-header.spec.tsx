import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import LayoutHeader from './layout-header';

describe('LayoutHeader', () => {
  it('should contains "Traces" link', () => {
    const { getByText } = render(
      <MemoryRouter>
        <LayoutHeader />
      </MemoryRouter>
    );
    const linkElement = getByText(/Traces/i);
    expect(linkElement).toBeInTheDocument();
  });
});
