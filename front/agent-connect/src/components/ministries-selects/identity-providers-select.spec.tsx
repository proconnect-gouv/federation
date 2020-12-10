import { fireEvent, render, waitFor } from '@testing-library/react';
import React from 'react';

import IdentityProvidersSelect from './identity-providers-select';

// setup
const mockOnSelect = jest.fn();
const props = {
  identityProviders: [
    {
      active: true,
      name: 'mock-name-1',
      uid: 'mock-uid-1',
    },
    {
      active: false,
      name: 'mock-name-2',
      uid: 'mock-uid-2',
    },
  ],
  onSelect: mockOnSelect,
};

describe('IdentityProvidersSelect', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should render the select element', () => {
    // setup
    const { getByRole } = render(<IdentityProvidersSelect {...props} />);
    // action
    const selectElement = getByRole('combobox');
    // expect
    expect(selectElement).toBeInTheDocument();
  });

  it('should render the select element, on click should show a list of children clickable element', async () => {
    // setup
    const { getByRole, getByText } = render(
      <IdentityProvidersSelect {...props} />,
    );
    // expect
    const selectInput = getByRole('combobox');
    await waitFor(() => fireEvent.mouseDown(selectInput));
    // action
    const selectItem1 = getByText('mock-name-1');
    expect(selectItem1).toBeInTheDocument();

    const selectItem2 = getByText('mock-name-2');
    expect(selectItem2).toBeInTheDocument();
  });

  it('should render the select element, on click second item should not call the function passed in props, called with uid', async () => {
    // setup
    const { getByRole, getByText } = render(
      <IdentityProvidersSelect {...props} />,
    );
    // expect
    const selectInput = getByRole('combobox');
    await waitFor(() => fireEvent.mouseDown(selectInput));
    // action
    const selectItem1 = getByText('mock-name-1');
    fireEvent.click(selectItem1);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('mock-uid-1');
  });

  it("should render the select element, on click second item should not call the function passed in props, it's disabled", async () => {
    // setup
    const { getByRole, getByText } = render(
      <IdentityProvidersSelect {...props} />,
    );
    // expect
    const selectInput = getByRole('combobox');
    await waitFor(() => fireEvent.mouseDown(selectInput));
    // action
    const selectItem2 = getByText('mock-name-2');
    fireEvent.click(selectItem2);
    expect(mockOnSelect).toHaveBeenCalledTimes(0);
  });
});
