import { fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { renderWithRedux } from '../../testUtils';
import MinistriesSelectComponoent from './ministries-select';

const initialState = {
  ministries: [
    {
      id: 'ministere-de-linterieur',
      identityProviders: [
        {
          active: true,
          name: '1er fi intérieur (existe)',
          uid: 'fia1v2',
        },
        {
          active: true,
          name: '2eme fi intérieur (existe)',
          uid: 'fia2v2',
        },
        {
          active: false,
          name: '3eme fi intérieur (existe disabled)',
          uid: 'fia-desactive-visible',
        },
      ],
      name: 'Ministere-de-l-interieur',
    },
    {
      id: 'ministere-de-la-sante',
      identityProviders: [
        {
          active: true,
          name: '1er fi santé (existe pas)',
          uid: 'not-fia1v2',
        },
        {
          active: false,
          name: '2eme fi santé (existe pas disabled)',
          uid: 'fia5v2',
        },
      ],
      name: 'Ministere-de-la-sante',
    },
  ],
};

describe('MinistriesSelectComponoent', () => {
  it('should render ministries list when Select is open', async () => {
    // setup
    const mockOnSelect = jest.fn();
    const { getByRole, getByText } = renderWithRedux(
      <MinistriesSelectComponoent onSelect={mockOnSelect} />,
      { initialState },
    );

    // action
    const selectInput = getByRole('combobox');

    // expect
    expect(selectInput).toBeInTheDocument();

    // Simulate Click on select content
    await waitFor(() => fireEvent.mouseDown(selectInput));

    // Then we can get the childrens names in the mocked list
    const selectItem1 = getByText('Ministere-de-la-sante');
    const selectItem2 = getByText('Ministere-de-l-interieur');

    expect(selectItem1).toBeInTheDocument();
    expect(selectItem2).toBeInTheDocument();
  });

  it('should onSelect been called', async () => {
    // setup
    const mockOnSelect = jest.fn();
    const { getByRole, getByText } = renderWithRedux(
      <MinistriesSelectComponoent onSelect={mockOnSelect} />,
      { initialState },
    );

    // action
    const selectInput = getByRole('combobox');

    // expect
    expect(selectInput).toBeInTheDocument();

    // Simulate Click on select content
    await waitFor(() => fireEvent.mouseDown(selectInput));

    // Then we can get the childrens names in the mocked list
    const selectItem = getByText('Ministere-de-la-sante');
    expect(selectItem).toBeInTheDocument();

    // Finaly we are able to fire onSelect event
    fireEvent.click(selectItem);

    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('ministere-de-la-sante');
  });
});
