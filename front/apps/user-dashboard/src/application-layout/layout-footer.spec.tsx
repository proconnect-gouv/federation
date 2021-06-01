import { render } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import LayoutFooter from './layout-footer';

describe('LayoutFooter', () => {
  it('should contains "En savoir plus" link', () => {
    const { getByText } = render(
      <MemoryRouter>
        <LayoutFooter />
      </MemoryRouter>
    );
    const linkElement = getByText(/En savoir plus sur FranceConnect/i);
    expect(linkElement).toBeInTheDocument();
  });

  it('should contains "CGU" link', () => {
    const { getByText } = render(
      <MemoryRouter>
        <LayoutFooter />
      </MemoryRouter>
    );
    const linkElement = getByText(/CGU/i);
    expect(linkElement).toBeInTheDocument();
  });

  it('should contains "FAQ" link', () => {
    const { getByText } = render(
      <MemoryRouter>
        <LayoutFooter />
      </MemoryRouter>
    );
    const linkElement = getByText(/Foire aux questions/i);
    expect(linkElement).toBeInTheDocument();
  });

  it('should contains "Aidant Pro" link', () => {
    const { getByText } = render(
      <MemoryRouter>
        <LayoutFooter />
      </MemoryRouter>
    );
    const linkElement = getByText(/Vous êtes un aidant professionnel/i);
    expect(linkElement).toBeInTheDocument();
  });
});
