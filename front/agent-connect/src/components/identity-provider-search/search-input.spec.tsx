import { fireEvent, render } from '@testing-library/react';
import { Form } from 'antd';
import React from 'react';

import SearchInput from './search-input';

describe('SearchInput', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should render submit button, onClick should call onChange function', () => {
    // setup
    const props = {
      label: 'mock-label',
      name: 'mock-name',
      onChange: jest.fn(),
    };
    const { getByText } = render(
      <Form>
        <SearchInput {...props} />
      </Form>,
    );
    // action
    const labelElement = getByText('mock-label').closest('label');
    // expect
    expect(labelElement).toBeInTheDocument();
    expect(labelElement).toHaveAttribute('for', 'mock-name');
  });

  it('should render an input element, when the input is filled, onchange function passed in props will be called', () => {
    // setup
    const mockOnChange = jest.fn();
    const props = {
      label: 'mock-label',
      name: 'mock-name',
      onChange: mockOnChange,
    };
    const { getByTestId } = render(
      <Form>
        <SearchInput {...props} />
      </Form>,
    );
    // action
    const inputElement = getByTestId('mock-search-input');
    fireEvent.change(inputElement, { target: { value: 'mock search value' } });
    // expect
    expect(inputElement).toBeInTheDocument();
    expect((inputElement as HTMLInputElement).value).toBe('mock search value');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should render a submit button, has no click', () => {
    // setup
    const mockOnChange = jest.fn();
    const props = {
      label: 'mock-label',
      name: 'mock-name',
      onChange: mockOnChange,
    };
    const { getByText } = render(
      <Form>
        <SearchInput {...props} />
      </Form>,
    );
    // action
    const submitElement = getByText('Rechercher');
    // expect
    expect(submitElement).toBeInTheDocument();
  });
});
