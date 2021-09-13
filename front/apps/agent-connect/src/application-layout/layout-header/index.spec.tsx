import { render } from '@testing-library/react';

import LayoutHeader from './index';

describe('LayoutHeader', () => {
  it('should render layout header with marianne logo', () => {
    const { getAllByRole } = render(<LayoutHeader />);
    const [firstImage] = getAllByRole('img');
    expect(firstImage).toHaveAttribute(
      'alt',
      'République Française - Liberté, Égalité, Fraternité',
    );
    expect(firstImage).toHaveAttribute('src', '/img/logo-marianne.svg');
  });

  it('should render layout header with agent connect logo', () => {
    const { getAllByRole } = render(<LayoutHeader />);
    const [, lastImage] = getAllByRole('img');
    expect(lastImage).toHaveAttribute('alt', 'Agent Connect');
    expect(lastImage).toHaveAttribute('src', '/img/logo-agentconnect.svg');
  });
});
