import React from 'react';

import { fireEvent, renderWithRedux, waitFor } from '../../testUtils';
import IdentityProvidersSelect from './identity-providers-select';

// setup
const mockOnSelect = jest.fn();
const initialState = {
  identityProviders: [
    { active: true, display: true, name: 'mock fi 1', uid: 'mock-fi-1' },
    {
      active: false,
      display: true,
      name: 'mock fi disabled',
      uid: 'mock-fi-disabled',
    },
  ],
  ministries: [
    {
      id: 'mock-min-1',
      identityProviders: ['mock-fi-1', 'mock-fi-disabled'],
      name: "Ministere de l'interieur 1",
    },
  ],
};

describe('IdentityProvidersSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should render the select element', () => {
    // setup
    const { getByRole } = renderWithRedux(
      <IdentityProvidersSelect
        ministryID="mock-min-1"
        onSelect={mockOnSelect}
      />,
      { initialState },
    );
    // action
    const selectElement = getByRole('combobox');
    // expect
    expect(selectElement).toBeInTheDocument();
  });

  it('should render the select element, on click should show a list of children clickable element', async () => {
    // setup
    const { getByRole, getByText } = renderWithRedux(
      <IdentityProvidersSelect
        ministryID="mock-min-1"
        onSelect={mockOnSelect}
      />,
      { initialState },
    );
    // expect
    const selectInput = getByRole('combobox');
    await waitFor(() => fireEvent.mouseDown(selectInput));
    // action
    const selectItem1 = getByText('mock fi 1');
    expect(selectItem1).toBeInTheDocument();

    const selectItem2 = getByText('mock fi disabled');
    expect(selectItem2).toBeInTheDocument();
  });

  it('should render the select element, on click second item should call the function passed in props, called with uid', async () => {
    // setup
    const { getByRole, getByText } = renderWithRedux(
      <IdentityProvidersSelect
        ministryID="mock-min-1"
        onSelect={mockOnSelect}
      />,
      { initialState },
    );
    // expect
    const selectInput = getByRole('combobox');
    await waitFor(() => fireEvent.mouseDown(selectInput));

    // action
    const selectItem1 = getByText('mock fi 1');
    fireEvent.click(selectItem1);
    // expect
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('mock-fi-1');
  });

  it("should render the select element, on click second item should not call the function passed in props, it's disabled", async () => {
    // setup
    const { getByRole, getByText } = renderWithRedux(
      <IdentityProvidersSelect
        ministryID="mock-min-1"
        onSelect={mockOnSelect}
      />,
      { initialState },
    );
    // expect
    const selectInput = getByRole('combobox');
    await waitFor(() => fireEvent.mouseDown(selectInput));
    // action
    const selectItem2 = getByText('mock fi disabled');
    fireEvent.click(selectItem2);
    expect(mockOnSelect).toHaveBeenCalledTimes(0);
  });
});
