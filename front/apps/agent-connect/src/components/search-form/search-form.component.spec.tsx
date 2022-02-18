import { fireEvent, render } from '@testing-library/react';
import { DebouncedFunc } from 'lodash';
import { useMediaQuery } from 'react-responsive';
import { mocked } from 'ts-jest/utils';

import { useOnSearch } from '@fc/agent-connect-search';

import { SearchFormComponent } from './search-form.component';

jest.mock('@fc/agent-connect-search');

describe('SearchFormComponent', () => {
  beforeEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it('should have called useMediaQuery', () => {
    // when
    render(<SearchFormComponent formData={{ 'fi-search-term': undefined }} />);
    // then
    expect(useMediaQuery).toHaveBeenCalledTimes(2);
    expect(useMediaQuery).toHaveBeenNthCalledWith(1, { query: '(min-width: 768px)' });
    expect(useMediaQuery).toHaveBeenNthCalledWith(2, { query: '(min-width: 768px)' });
  });

  it('should render the component for a desktop viewport', () => {
    // given
    mocked(useMediaQuery).mockReturnValueOnce(true);
    // when
    const { getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const element = getByTestId('form-title');
    // then
    expect(element).not.toHaveClass('mb8');
  });

  it('should render the component for a tablet viewport', () => {
    // given
    mocked(useMediaQuery).mockReturnValueOnce(false);
    // when
    const { getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const element = getByTestId('form-title');
    // then
    expect(element).toHaveClass('mb8');
  });

  it('should have the form title', () => {
    // when
    const { getByText } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const element = getByText('Je recherche mon administration');
    // then
    expect(element).toBeInTheDocument();
  });

  it('should have the form', () => {
    // when
    const { getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const element = getByTestId('search-form');
    // then
    expect(element).toBeInTheDocument();
  });

  it('should have the button, disabled by default', () => {
    // when
    const { getByRole } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const button = getByRole('button');
    // then
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('disabled');
  });

  it('should have the label title, it should be associated to search input', () => {
    // when
    const { getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const element = getByTestId('input-label');
    // then
    expect(element).toBeInTheDocument();
    expect(element).toHaveAttribute('for', 'fi-search-term');
    expect(element.innerHTML).toStrictEqual(
      'Veuillez taper le nom complet de votre administration',
    );
  });

  it('should have the search input', () => {
    // when
    const { getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const element = getByTestId('search-input');
    // then
    expect(element).toBeInTheDocument();
    expect(element.tagName.toLowerCase()).toStrictEqual('input');
    expect(element).toHaveAttribute('type', 'text');
    expect(element).toHaveAttribute('name', 'fi-search-term');
    expect(element).toHaveAttribute('id', 'fi-search-term');
    expect(element).toHaveAttribute('placeholder', 'ex : ministère de la mer, ministère de...');
  });

  it('should call onSearch hook on input change', () => {
    // given
    const onSearchMock = jest.fn();
    mocked(useOnSearch).mockReturnValue(
      onSearchMock as unknown as DebouncedFunc<(value: string) => void>,
    );
    // when
    const { getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const input = getByTestId('search-input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'any-search-term' } });
    // then
    expect(input.value).toBe('any-search-term');
    expect(onSearchMock).toHaveBeenCalledTimes(1);
    expect(onSearchMock).toHaveBeenCalledWith('any-search-term');
  });

  it('should call onSearch hook on form submit with input value', () => {
    // given
    const onSearchMock = jest.fn();
    mocked(useOnSearch).mockReturnValue(
      onSearchMock as unknown as DebouncedFunc<(value: string) => void>,
    );
    // when
    const { getByRole, getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': undefined }} />,
    );
    const input = getByTestId('search-input') as HTMLInputElement;
    const button = getByRole('button') as HTMLButtonElement;
    fireEvent.change(input, { target: { value: 'from-submit-button' } });
    fireEvent.click(button);
    // then
    // @NOTE should be called twice
    // 1/ first on input change
    // 2/ second on button click
    expect(onSearchMock).toHaveBeenCalledTimes(2);
    expect(onSearchMock).toHaveBeenNthCalledWith(2, 'from-submit-button');
  });

  it('should have enabled submit button, when user input is not equal default props', () => {
    // given
    const onSearchMock = jest.fn();
    mocked(useOnSearch).mockReturnValue(
      onSearchMock as unknown as DebouncedFunc<(value: string) => void>,
    );
    // when
    const { getByRole, getByTestId } = render(
      <SearchFormComponent formData={{ 'fi-search-term': 'from-default-props' }} />,
    );
    const button = getByRole('button') as HTMLButtonElement;
    const input = getByTestId('search-input') as HTMLInputElement;
    // then
    expect(button).toHaveAttribute('disabled');
    fireEvent.change(input, { target: { value: 'from-text-input' } });
    expect(button).not.toHaveAttribute('disabled');
  });
});
