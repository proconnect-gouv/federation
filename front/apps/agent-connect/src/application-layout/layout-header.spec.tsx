import { render } from '@testing-library/react';
import React from 'react';

import LayoutHeader from './layout-header';

describe('LayoutHeader', () => {
  it('should render layout header with marianne logo', () => {
    const { getAllByRole } = render(<LayoutHeader />);
    const [firstImage] = getAllByRole('img');
    expect(firstImage).toHaveAttribute('src', '/img/logo-marianne.svg');
  });

  it('should render layout header with agent connect logo', () => {
    const { getAllByRole } = render(<LayoutHeader />);
    const [, lastImage] = getAllByRole('img');
    expect(lastImage).toHaveAttribute('src', '/img/logo-agentconnect.svg');
  });
});
